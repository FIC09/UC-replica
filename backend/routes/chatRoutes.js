import express from 'express';
import jwt from 'jsonwebtoken';
import { ChatConversation } from '../models/ChatConversation.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { ChatMessageReceipt } from '../models/ChatMessageReceipt.js';
import { ChatAttachment } from '../models/ChatAttachment.js';
import { ChatReport } from '../models/ChatReport.js';
import { Booking } from '../models/Booking.js';
import {
  getOrCreateConversation,
  registerChatClient,
  unregisterChatClient,
  broadcastChatEvent,
  isRecipientOnline,
  setTypingState,
  evaluateBookingLifecycleClosure,
  QUICK_REPLIES
} from '../services/chatService.js';

const router = express.Router();

/**
 * Extract authenticated user from token or verified headers
 */
function extractChatUser(req) {
  const authHeader = req.headers.authorization || req.headers['x-admin-token'] || req.headers['x-auth-token'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (authHeader) {
    token = authHeader;
  }

  // Support query token for SSE EventSource connections
  if (!token && req.query.token) {
    token = req.query.token;
  }

  let user = {
    id: req.headers['x-user-id'] || req.headers['x-professional-id'] || req.query.userId || '',
    role: req.headers['x-user-role'] || req.headers['x-role'] || req.query.role || '',
    name: req.headers['x-user-name'] || req.query.name || ''
  };

  if (token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded) {
        user.id = decoded.id || decoded.userId || decoded.workerId || decoded.sub || user.id;
        user.role = decoded.role || (decoded.email?.includes('admin') ? 'admin' : user.role);
        user.name = decoded.name || decoded.applicantName || user.name;
        user.email = decoded.email;
        user.phone = decoded.phone;
      }
    } catch {}
  }

  if (req.headers['x-professional-id']) {
    user.id = req.headers['x-professional-id'];
    user.role = 'professional';
  }

  if (!user.role) {
    if (user.id && (user.id.startsWith('WRK') || user.id.startsWith('PRO'))) {
      user.role = 'professional';
    } else {
      user.role = 'customer';
    }
  }

  return user;
}

/**
 * Verify conversation participation authorization
 */
function authorizeConversationAccess(conversation, user) {
  if (!conversation) return { authorized: false, reason: 'Conversation not found.' };

  // Super Admins & Operations support
  if (user.role === 'admin' || user.role === 'Super Admin' || user.role === 'Operations Manager' || user.role === 'support') {
    return { authorized: true, role: 'admin' };
  }

  // Check worker participant
  if (user.role === 'professional') {
    if (user.id !== conversation.workerId) {
      return { authorized: false, reason: 'Technician is not authorized for this private conversation.' };
    }
    return { authorized: true, role: 'professional' };
  }

  // Check customer participant
  const matchesId = Boolean(user.id && user.id === conversation.customerId);
  const matchesPhone = Boolean(user.phone && conversation.customerPhone && user.phone === conversation.customerPhone);

  if (matchesId || matchesPhone) {
    return { authorized: true, role: 'customer' };
  }

  // If customer ID is provided and does not match
  if (user.id && user.id !== conversation.customerId) {
    return { authorized: false, reason: 'Customer is not authorized for this private conversation.' };
  }

  // Guest booking fallback only when conversation customerId is anonymous
  if (user.role === 'customer' && (!user.id || conversation.customerId === 'cust-anon')) {
    return { authorized: true, role: 'customer' };
  }

  return { authorized: false, reason: 'User is not an authorized participant in this conversation.' };
}

// ----------------------------------------------------------------------
// 1. GET /api/chat/quick-replies - Predefined Rapido-style bilingual quick chips
// ----------------------------------------------------------------------
router.get('/quick-replies', (req, res) => {
  res.json({
    success: true,
    quickReplies: QUICK_REPLIES
  });
});

// ----------------------------------------------------------------------
// 2. GET /api/chat/booking/:bookingId - Activate or fetch active chat for booking
// ----------------------------------------------------------------------
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const user = extractChatUser(req);

    const conversation = await getOrCreateConversation(bookingId);
    const auth = authorizeConversationAccess(conversation, user);

    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    // Refresh lifecycle status
    await evaluateBookingLifecycleClosure(conversation);

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 3. GET /api/chat/conversations - List conversations for authenticated user
// ----------------------------------------------------------------------
router.get('/conversations', async (req, res) => {
  try {
    const user = extractChatUser(req);
    let query = {};

    if (user.role === 'professional') {
      query = { workerId: user.id };
    } else if (user.role === 'customer' && user.id) {
      query = { customerId: user.id };
    } else if (user.role === 'admin' || user.role === 'Super Admin') {
      // Admins see all for support audits
      query = {};
    }

    const conversations = await ChatConversation.find(query).sort({ updatedAt: -1 }).limit(50);
    res.json({ success: true, count: conversations.length, conversations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 4. GET /api/chat/conversations/:conversationId - Single conversation details
// ----------------------------------------------------------------------
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    await evaluateBookingLifecycleClosure(conversation);

    res.json({ success: true, conversation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 5. GET /api/chat/conversations/:conversationId/messages - Ordered message history
// ----------------------------------------------------------------------
router.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { limit = 50, before } = req.query;
    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    let query = { conversationId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(parseInt(limit) || 50);

    res.json({
      success: true,
      count: messages.length,
      messages
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 6. POST /api/chat/conversations/:conversationId/messages - Send message
// ----------------------------------------------------------------------
router.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const {
      messageText,
      messageType = 'text',
      attachmentUrl = '',
      attachmentMeta = null,
      clientMessageId = null
    } = req.body;

    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    // Check if conversation is closed or read-only
    await evaluateBookingLifecycleClosure(conversation);
    if (conversation.status === 'read_only') {
      return res.status(403).json({
        success: false,
        error: 'Conversation is read-only. Service has been completed and the support window has expired.'
      });
    }
    if (conversation.status === 'closed') {
      return res.status(403).json({
        success: false,
        error: `Conversation is closed (${conversation.closureReason || 'closed'}). New messages are blocked.`
      });
    }

    if (!messageText && !attachmentUrl) {
      return res.status(400).json({ success: false, error: 'Message text or attachment is required.' });
    }

    // Idempotency: Prevent duplicate messages from network retries
    if (clientMessageId) {
      const existing = await ChatMessage.findOne({ conversationId, clientMessageId });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: existing,
          isDuplicate: true
        });
      }
    }

    const senderRole = auth.role === 'admin' ? 'admin' : (user.role === 'professional' ? 'professional' : 'customer');
    const senderName = user.name || (senderRole === 'professional' ? conversation.workerName : conversation.customerName);
    const recipientId = senderRole === 'professional' ? conversation.customerId : conversation.workerId;
    const recipientRole = senderRole === 'professional' ? 'customer' : 'professional';

    // Determine initial delivery status based on recipient online state
    const isOnline = isRecipientOnline(conversationId, recipientRole);
    const initialStatus = isOnline ? 'delivered' : 'sent';
    const now = new Date();

    const newMsgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMsg = await ChatMessage.create({
      id: newMsgId,
      conversationId,
      bookingId: conversation.bookingId,
      senderId: user.id || (senderRole === 'professional' ? conversation.workerId : conversation.customerId),
      senderRole,
      senderName,
      messageType,
      messageText: String(messageText || '').trim(),
      attachmentUrl,
      attachmentMeta,
      clientMessageId,
      status: initialStatus,
      deliveredAt: isOnline ? now : null
    });

    // Create message receipt
    await ChatMessageReceipt.create({
      id: `rcpt-${newMsgId}`,
      messageId: newMsg.id,
      conversationId,
      recipientId,
      recipientRole,
      deliveredAt: isOnline ? now : null
    });

    // Update conversation last message & unread counts
    conversation.lastMessage = {
      text: newMsg.messageText || (messageType === 'image' ? '📷 Photo attachment' : 'Message'),
      senderId: newMsg.senderId,
      senderRole: newMsg.senderRole,
      messageType: newMsg.messageType,
      timestamp: now
    };
    if (senderRole === 'professional') {
      conversation.unreadCountCustomer = (conversation.unreadCountCustomer || 0) + 1;
    } else {
      conversation.unreadCountWorker = (conversation.unreadCountWorker || 0) + 1;
    }
    await conversation.save();

    // Broadcast new message via real-time SSE
    broadcastChatEvent(conversationId, {
      type: 'new_message',
      conversationId,
      message: newMsg
    });

    res.status(201).json({
      success: true,
      message: newMsg
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 7. POST /api/chat/conversations/:conversationId/read - Mark read receipts
// ----------------------------------------------------------------------
router.post('/conversations/:conversationId/read', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    const readerRole = auth.role === 'admin' ? 'admin' : (user.role === 'professional' ? 'professional' : 'customer');
    const senderRoleToMarkRead = readerRole === 'professional' ? 'customer' : 'professional';
    const now = new Date();

    // Update messages to 'read'
    const result = await ChatMessage.updateMany(
      {
        conversationId,
        senderRole: senderRoleToMarkRead,
        status: { $ne: 'read' }
      },
      {
        $set: {
          status: 'read',
          readAt: now
        }
      }
    );

    // Update receipts
    await ChatMessageReceipt.updateMany(
      {
        conversationId,
        recipientRole: readerRole,
        readAt: null
      },
      {
        $set: { readAt: now }
      }
    );

    // Reset unread counters on conversation
    if (readerRole === 'professional') {
      conversation.unreadCountWorker = 0;
    } else if (readerRole === 'customer') {
      conversation.unreadCountCustomer = 0;
    }
    await conversation.save();

    // Broadcast read receipt event
    broadcastChatEvent(conversationId, {
      type: 'read_receipt',
      conversationId,
      readerId: user.id,
      readerRole,
      readAt: now,
      modifiedCount: result.modifiedCount
    });

    res.json({
      success: true,
      readAt: now,
      markedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 8. POST /api/chat/conversations/:conversationId/typing - Broadcast typing indicator
// ----------------------------------------------------------------------
router.post('/conversations/:conversationId/typing', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { isTyping = true } = req.body;
    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    setTypingState(conversationId, user, isTyping);

    res.json({ success: true, isTyping: Boolean(isTyping) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 9. POST /api/chat/conversations/:conversationId/attachments - Upload image/file
// ----------------------------------------------------------------------
router.post('/conversations/:conversationId/attachments', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { fileName, fileType, fileSize, base64Data } = req.body;
    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    if (!fileName || !fileType) {
      return res.status(400).json({ success: false, error: 'File name and MIME type are required.' });
    }

    // Security: Validate file type and max size (5 MB)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Unsupported attachment type. Allowed: JPEG, PNG, WEBP, GIF, PDF.'
      });
    }

    const sizeBytes = parseInt(fileSize) || 0;
    if (sizeBytes > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        error: 'File size exceeds maximum permitted limit of 5 Megabytes.'
      });
    }

    // Secure storage reference
    const storageKey = `chat/${conversationId}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const attachmentUrl = base64Data && base64Data.startsWith('data:')
      ? base64Data
      : `https://storage.urbancompany.com/${storageKey}`;

    const attachment = await ChatAttachment.create({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId,
      fileName,
      fileType,
      fileSize: sizeBytes,
      storageKey,
      url: attachmentUrl,
      uploadedBy: user.id || 'anonymous',
      uploadedRole: auth.role
    });

    res.status(201).json({
      success: true,
      attachment
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 10. POST /api/chat/conversations/:conversationId/report - Report conversation
// ----------------------------------------------------------------------
router.post('/conversations/:conversationId/report', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { reason, details = '', messageId = '' } = req.body;
    const user = extractChatUser(req);

    const conversation = await ChatConversation.findOne({ id: conversationId });
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found.' });
    }

    const auth = authorizeConversationAccess(conversation, user);
    if (!auth.authorized) {
      return res.status(403).json({ success: false, error: auth.reason });
    }

    if (!reason) {
      return res.status(400).json({ success: false, error: 'Report reason is mandatory.' });
    }

    const report = await ChatReport.create({
      id: `rpt-${Date.now()}`,
      conversationId,
      bookingId: conversation.bookingId,
      messageId,
      reporterId: user.id || 'reporter',
      reporterRole: auth.role,
      reason,
      details,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted to Trust & Safety. Case ticket created for review.',
      reportId: report.id
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------------------------
// 11. GET /api/chat/stream/:conversationId - Real-Time Server-Sent Events (SSE) Stream
// ----------------------------------------------------------------------
router.get('/stream/:conversationId', async (req, res) => {
  const { conversationId } = req.params;
  const user = extractChatUser(req);

  const conversation = await ChatConversation.findOne({ id: conversationId });
  if (!conversation) {
    return res.status(404).json({ success: false, error: 'Conversation not found.' });
  }

  const auth = authorizeConversationAccess(conversation, user);
  if (!auth.authorized) {
    return res.status(403).json({ success: false, error: auth.reason });
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send connected handshake
  res.write(`data: ${JSON.stringify({
    type: 'connected',
    conversationId,
    userRole: auth.role,
    status: conversation.status,
    timestamp: new Date()
  })}\n\n`);

  // Register client
  registerChatClient(conversationId, res, { id: user.id, role: auth.role, name: user.name });

  // Update pending 'sent' messages to 'delivered' now that recipient connected
  const senderRoleDelivered = auth.role === 'professional' ? 'customer' : 'professional';
  try {
    const updated = await ChatMessage.updateMany(
      {
        conversationId,
        senderRole: senderRoleDelivered,
        status: 'sent'
      },
      {
        $set: {
          status: 'delivered',
          deliveredAt: new Date()
        }
      }
    );

    if (updated.modifiedCount > 0) {
      broadcastChatEvent(conversationId, {
        type: 'delivery_receipt',
        conversationId,
        recipientRole: auth.role,
        deliveredAt: new Date(),
        count: updated.modifiedCount
      });
    }
  } catch (e) {
    console.warn('Delivery receipt update warning:', e.message);
  }

  // Keep-alive heartbeat every 15s
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    unregisterChatClient(conversationId, res);
  });
});

export default router;
