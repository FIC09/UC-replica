import mongoose from 'mongoose';
import { ChatConversation } from '../models/ChatConversation.js';
import { ChatMessage } from '../models/ChatMessage.js';
import { ChatMessageReceipt } from '../models/ChatMessageReceipt.js';
import { Booking } from '../models/Booking.js';
import { WorkerApplication } from '../models/WorkerApplication.js';

// Active SSE client connections: conversationId -> Set of HTTP response objects
const sseChatClients = new Map();

// Typing state tracker: conversationId -> Map of userId -> { isTyping, role, name, expiresAt }
const typingTrackers = new Map();

// Quick Replies Catalog (English & Tamil Unicode)
export const QUICK_REPLIES = {
  customer: [
    { id: 'q-c1', en: 'Where are you now?', ta: 'இப்போது எங்கு இருக்கிறீர்கள்?' },
    { id: 'q-c2', en: 'How long until you arrive?', ta: 'வர எவ்வளவு நேரம் ஆகும்?' },
    { id: 'q-c3', en: 'Please call me when you reach.', ta: 'வந்ததும் எனக்கு அழைக்கவும்.' },
    { id: 'q-c4', en: "I'm at the service location.", ta: 'நான் சேவை இடத்தில் இருக்கிறேன்.' },
    { id: 'q-c5', en: 'Please come to the main entrance.', ta: 'தயவுசெய்து முதன்மை வாயிலுக்கு வரவும்.' },
    { id: 'q-c6', en: 'Thank you.', ta: 'நன்றி.' }
  ],
  professional: [
    { id: 'q-w1', en: 'I have accepted your booking.', ta: 'உங்கள் முன்பதிவை நான் ஏற்றுக்கொண்டேன்.' },
    { id: 'q-w2', en: "I'm on the way.", ta: 'நான் கிளம்பிவிட்டேன், வழியில் இருக்கிறேன்.' },
    { id: 'q-w3', en: "I'll arrive shortly.", ta: 'நான் விரைவில் வந்துவிடுவேன்.' },
    { id: 'q-w4', en: "I've reached your location.", ta: 'நான் உங்கள் இடத்தை அடைந்துவிட்டேன்.' },
    { id: 'q-w5', en: 'Could you please confirm the entrance?', ta: 'நுழைவாயிலை உறுதிப்படுத்த முடியுமா?' },
    { id: 'q-w6', en: "I'm starting the service now.", ta: 'நான் இப்போது வேலையைத் தொடங்குகிறேன்.' },
    { id: 'q-w7', en: 'The service has been completed.', ta: 'சேவை வெற்றிகரமாக முடிந்தது.' }
  ]
};

/**
 * Register SSE client connection for a conversation
 */
export function registerChatClient(conversationId, res, userMeta = {}) {
  if (!sseChatClients.has(conversationId)) {
    sseChatClients.set(conversationId, new Set());
  }
  res._userMeta = userMeta;
  sseChatClients.get(conversationId).add(res);

  // Broadcast presence / connection update
  broadcastChatEvent(conversationId, {
    type: 'presence',
    userId: userMeta.id,
    role: userMeta.role,
    status: 'online',
    timestamp: new Date()
  });
}

/**
 * Unregister SSE client connection
 */
export function unregisterChatClient(conversationId, res) {
  const clients = sseChatClients.get(conversationId);
  if (clients) {
    const userMeta = res._userMeta || {};
    clients.delete(res);
    if (clients.size === 0) {
      sseChatClients.delete(conversationId);
    }
    // Broadcast offline presence if no other connection for this user
    let userStillOnline = false;
    for (const c of (sseChatClients.get(conversationId) || [])) {
      if (c._userMeta?.id === userMeta.id) {
        userStillOnline = true;
        break;
      }
    }
    if (!userStillOnline && userMeta.id) {
      broadcastChatEvent(conversationId, {
        type: 'presence',
        userId: userMeta.id,
        role: userMeta.role,
        status: 'offline',
        timestamp: new Date()
      });
    }
  }
}

/**
 * Broadcast an event to all connected clients in a conversation
 */
export function broadcastChatEvent(conversationId, eventData) {
  const clients = sseChatClients.get(conversationId);
  if (!clients || clients.size === 0) return;

  const payload = `data: ${JSON.stringify(eventData)}\n\n`;
  for (const client of clients) {
    try {
      client.write(payload);
    } catch (e) {
      clients.delete(client);
    }
  }
}

/**
 * Check if counterparty is currently online in the conversation
 */
export function isRecipientOnline(conversationId, recipientId) {
  const clients = sseChatClients.get(conversationId);
  if (!clients) return false;
  for (const client of clients) {
    if (client._userMeta?.id === recipientId || client._userMeta?.role === recipientId) {
      return true;
    }
  }
  return false;
}

/**
 * Get or automatically create a conversation linked to a confirmed booking assignment
 */
export async function getOrCreateConversation(bookingId, workerOverride = null) {
  let booking = null;
  try {
    booking = await Booking.findOne({ id: bookingId });
    if (!booking) {
      if (mongoose.isValidObjectId(bookingId)) {
        booking = await Booking.findOne({ $or: [{ _id: bookingId }, { bookingReference: bookingId }] });
      } else {
        booking = await Booking.findOne({ bookingReference: bookingId });
      }
    }
  } catch (dbErr) {
    console.warn('Booking lookup error:', dbErr.message);
  }

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found.`);
  }

  const assignedWorker = workerOverride || booking.assignedProfessional;
  if (!assignedWorker || !assignedWorker.id) {
    throw new Error('Chat unavailable: No professional worker has been assigned to this booking yet.');
  }

  const workerId = assignedWorker.id;
  const customerId = booking.userId || booking.userPhone || booking.userEmail || `cust-${booking.id}`;
  const convId = `conv-${booking.id}-${workerId}`;

  // Try to enrich worker details from database
  let workerRecord = null;
  try {
    workerRecord = await WorkerApplication.findOne({
      $or: [
        { id: workerId },
        { applicationNumber: workerId }
      ]
    });
  } catch {}

  const effectiveWorkerName = workerRecord?.applicantName || workerRecord?.name || assignedWorker.name || 'Service Specialist';
  const effectiveWorkerAvatar = workerRecord?.avatar || assignedWorker.avatar || '';
  const effectiveWorkerPhone = workerRecord?.phone || assignedWorker.phone || '';
  const effectiveWorkerTrade = workerRecord?.tradeName || workerRecord?.trade || assignedWorker.trade || booking.serviceName || 'Technician';

  // Check if an existing conversation exists for this booking
  const existingConversations = await ChatConversation.find({
    $or: [
      { bookingId: booking.id },
      { bookingId: booking.bookingReference || booking.id }
    ]
  }).sort({ createdAt: -1 });

  // 1. Check if conversation belongs to the currently assigned worker (whether active or closed)
  let existingWorkerConv = existingConversations.find(c => c.workerId === String(workerId) || c.id === convId);
  if (!existingWorkerConv) {
    existingWorkerConv = await ChatConversation.findOne({ id: convId });
  }

  if (existingWorkerConv) {
    const isBookingActive = ['Confirmed', 'Assigned', 'In Progress', 'En Route', 'Arrived'].includes(booking.status);
    if (isBookingActive && existingWorkerConv.status === 'closed') {
      existingWorkerConv.status = 'active';
      existingWorkerConv.closureReason = undefined;
      existingWorkerConv.closedAt = undefined;
    }
    // Keep worker details synchronized
    existingWorkerConv.workerName = effectiveWorkerName;
    existingWorkerConv.workerPhone = effectiveWorkerPhone;
    existingWorkerConv.workerAvatar = effectiveWorkerAvatar;
    existingWorkerConv.workerTrade = effectiveWorkerTrade;
    await existingWorkerConv.save();

    await evaluateBookingLifecycleClosure(existingWorkerConv, booking);
    return existingWorkerConv;
  }

  // 2. If there's an active conversation for a PREVIOUS worker, close it now due to reassignment
  const oldActiveConv = existingConversations.find(c => c.workerId !== String(workerId) && c.status === 'active');
  if (oldActiveConv) {
    oldActiveConv.status = 'closed';
    oldActiveConv.closureReason = 'worker_reassigned';
    oldActiveConv.closedAt = new Date();
    await oldActiveConv.save();

    // Broadcast closure to old participants
    broadcastChatEvent(oldActiveConv.id, {
      type: 'conversation_closed',
      conversationId: oldActiveConv.id,
      reason: 'worker_reassigned',
      message: 'This conversation has been closed due to technician reassignment.'
    });
  }

  // 3. Create a brand new private conversation for the new worker
  let newConv = null;
  try {
    newConv = await ChatConversation.create({
      id: convId,
      bookingId: booking.id,
      assignmentId: `asgn-${booking.id}-${workerId}`,
      customerId: String(customerId),
      customerName: booking.userName || 'Customer',
      customerPhone: booking.userPhone || '',
      workerId: String(workerId),
      workerName: effectiveWorkerName,
      workerPhone: effectiveWorkerPhone,
      workerAvatar: effectiveWorkerAvatar,
      workerTrade: effectiveWorkerTrade,
      serviceName: booking.serviceName || 'Home Service',
      serviceAddress: booking.address || '',
      status: 'active',
      lastMessage: {
        text: 'Chat activated. You can now communicate directly regarding this service.',
        senderId: 'system',
        senderRole: 'system',
        messageType: 'system',
        timestamp: new Date()
      }
    });

    // Create initial system message in the chat
    await ChatMessage.create({
      id: `msg-sys-${Date.now()}`,
      conversationId: newConv.id,
      bookingId: booking.id,
      senderId: 'system',
      senderRole: 'system',
      senderName: 'Krishnagiri Dispatch',
      messageType: 'system',
      messageText: `Chat opened for Booking #${booking.id}. Direct communication between ${newConv.customerName} and ${newConv.workerName} is now active.`,
      status: 'delivered'
    });
  } catch (createErr) {
    // If duplicate key error occurs, recover gracefully by returning the existing conversation
    if (createErr.code === 11000 || createErr.message?.includes('E11000')) {
      newConv = await ChatConversation.findOne({ id: convId });
      if (newConv) {
        newConv.status = 'active';
        newConv.closureReason = undefined;
        newConv.closedAt = undefined;
        newConv.workerName = effectiveWorkerName;
        await newConv.save();
        return newConv;
      }
    }
    throw createErr;
  }

  return newConv;
}

/**
 * Evaluate if booking lifecycle dictates conversation closure
 */
export async function evaluateBookingLifecycleClosure(conversation, booking = null) {
  if (conversation.status === 'closed' || conversation.status === 'read_only') {
    return conversation;
  }

  if (!booking) {
    booking = await Booking.findOne({ id: conversation.bookingId });
  }

  if (!booking) return conversation;

  // If booking is Cancelled, apply closure
  if (booking.status === 'Cancelled') {
    conversation.status = 'closed';
    conversation.closureReason = 'booking_cancelled';
    conversation.closedAt = new Date();
    await conversation.save();

    broadcastChatEvent(conversation.id, {
      type: 'conversation_closed',
      conversationId: conversation.id,
      reason: 'booking_cancelled',
      message: 'Booking cancelled. Conversation is now closed.'
    });
    return conversation;
  }

  // If booking is Completed, check 24h grace period
  if (booking.status === 'Completed') {
    const completedAt = booking.completedAt || booking.updatedAt || conversation.createdAt;
    const hoursSinceCompletion = (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60);

    if (hoursSinceCompletion > 24) {
      conversation.status = 'read_only';
      conversation.closureReason = 'post_completion_support_window_expired';
      conversation.closedAt = new Date();
      await conversation.save();

      broadcastChatEvent(conversation.id, {
        type: 'conversation_read_only',
        conversationId: conversation.id,
        reason: 'post_completion_support_window_expired',
        message: 'Support window has concluded. Conversation is now read-only.'
      });
    }
  }

  return conversation;
}

/**
 * Handle typing indicator updates with auto-expiration
 */
export function setTypingState(conversationId, userMeta, isTyping) {
  if (!typingTrackers.has(conversationId)) {
    typingTrackers.set(conversationId, new Map());
  }
  const convTyping = typingTrackers.get(conversationId);

  if (isTyping) {
    convTyping.set(userMeta.id, {
      userId: userMeta.id,
      role: userMeta.role,
      name: userMeta.name,
      expiresAt: Date.now() + 5000
    });
  } else {
    convTyping.delete(userMeta.id);
  }

  broadcastChatEvent(conversationId, {
    type: 'typing',
    conversationId,
    userId: userMeta.id,
    role: userMeta.role,
    name: userMeta.name,
    isTyping: Boolean(isTyping),
    timestamp: new Date()
  });
}
