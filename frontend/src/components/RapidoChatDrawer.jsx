import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Check,
  CheckCheck,
  Clock,
  Phone,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Loader2,
  Lock,
  Maximize2
} from 'lucide-react';

export function RapidoChatDrawer({
  isOpen,
  onClose,
  booking,
  currentUser = null
}) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [counterpartyTyping, setCounterpartyTyping] = useState(false);
  const [isCounterpartyOnline, setIsCounterpartyOnline] = useState(true);
  const [language, setLanguage] = useState('en'); // 'en' | 'ta'
  const [quickReplies, setQuickReplies] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('Inappropriate language');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const eventSourceRef = useRef(null);

  // Derive role and IDs
  const userRole = currentUser?.role || (currentUser?.id?.startsWith('WRK') ? 'professional' : 'customer');
  const userId = currentUser?.id || currentUser?.phone || booking?.userId || booking?.userPhone || 'cust-user';
  const userName = currentUser?.name || (userRole === 'professional' ? (booking?.assignedProfessional?.name || 'Technician') : (booking?.userName || 'Customer'));

  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    'x-user-role': userRole,
    'x-user-name': userName,
    ...(userRole === 'professional' ? { 'x-professional-id': userId } : {})
  };

  // 1. Fetch Quick Replies catalog
  useEffect(() => {
    fetch('/api/chat/quick-replies')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.quickReplies) {
          const list = userRole === 'professional' ? data.quickReplies.professional : data.quickReplies.customer;
          setQuickReplies(list || []);
        }
      })
      .catch(() => {});
  }, [userRole]);

  // 2. Load Conversation & Messages
  useEffect(() => {
    if (!isOpen || !booking?.id) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Fetch or activate conversation for this booking
    fetch(`/api/chat/booking/${booking.id}`, { headers: authHeaders })
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (!data.success) {
          throw new Error(data.error || 'Failed to initialize chat');
        }

        const conv = data.conversation;
        setConversation(conv);

        // Fetch message history
        return fetch(`/api/chat/conversations/${conv.id}/messages`, { headers: authHeaders });
      })
      .then(res => res ? res.json() : null)
      .then(data => {
        if (!isMounted || !data) return;
        if (data.success) {
          setMessages(data.messages || []);
        }
        setLoading(false);
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, booking?.id]);

  // 3. Connect Real-Time SSE Stream
  useEffect(() => {
    if (!isOpen || !conversation?.id) return;

    const streamUrl = `/api/chat/stream/${conversation.id}?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(userRole)}&name=${encodeURIComponent(userName)}`;
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === 'connected') {
          setIsCounterpartyOnline(true);
        } else if (payload.type === 'new_message' && payload.message) {
          const newMsg = payload.message;
          setMessages(prev => {
            // Avoid duplicate if already present
            if (prev.some(m => m.id === newMsg.id || (newMsg.clientMessageId && m.clientMessageId === newMsg.clientMessageId))) {
              return prev.map(m => (m.clientMessageId === newMsg.clientMessageId ? newMsg : m));
            }
            return [...prev, newMsg];
          });

          // If incoming message from counterparty, immediately mark as read
          if (newMsg.senderRole !== userRole) {
            fetch(`/api/chat/conversations/${conversation.id}/read`, {
              method: 'POST',
              headers: authHeaders
            }).catch(() => {});
          }
        } else if (payload.type === 'delivery_receipt') {
          setMessages(prev => prev.map(m => (m.status === 'sent' ? { ...m, status: 'delivered' } : m)));
        } else if (payload.type === 'read_receipt') {
          setMessages(prev => prev.map(m => (m.senderRole === userRole ? { ...m, status: 'read', readAt: payload.readAt } : m)));
        } else if (payload.type === 'typing') {
          if (payload.role !== userRole) {
            setCounterpartyTyping(payload.isTyping);
          }
        } else if (payload.type === 'presence') {
          if (payload.role !== userRole) {
            setIsCounterpartyOnline(payload.status === 'online');
          }
        } else if (payload.type === 'conversation_closed' || payload.type === 'conversation_read_only') {
          setConversation(prev => prev ? { ...prev, status: payload.type === 'conversation_closed' ? 'closed' : 'read_only' } : null);
        }
      } catch (e) {
        console.warn('Chat SSE parse error:', e);
      }
    };

    // Mark existing messages as read upon entering chat
    fetch(`/api/chat/conversations/${conversation.id}/read`, {
      method: 'POST',
      headers: authHeaders
    }).catch(() => {});

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [isOpen, conversation?.id]);

  // 4. Auto-scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, counterpartyTyping, isOpen]);

  // 5. Send custom or quick message
  const handleSendMessage = async (customText = null, msgType = 'text') => {
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !conversation?.id || sending) return;

    if (conversation.status === 'closed' || conversation.status === 'read_only') {
      alert('This conversation is closed for new messages.');
      return;
    }

    const clientMsgId = `cl-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const optimisticMsg = {
      id: clientMsgId,
      conversationId: conversation.id,
      bookingId: booking.id,
      senderId: userId,
      senderRole: userRole,
      senderName: userName,
      messageType: msgType,
      messageText: textToSend,
      clientMessageId: clientMsgId,
      status: 'sending',
      createdAt: new Date()
    };

    // Optimistic UI insert
    setMessages(prev => [...prev, optimisticMsg]);
    if (!customText) setInputText('');
    setSending(true);

    // Stop typing indicator
    emitTyping(false);

    try {
      const res = await fetch(`/api/chat/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          messageText: textToSend,
          messageType: msgType,
          clientMessageId: clientMsgId
        })
      });
      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => prev.map(m => (m.clientMessageId === clientMsgId ? data.message : m)));
      } else {
        throw new Error(data.error || 'Message failed to send');
      }
    } catch (err) {
      setMessages(prev => prev.map(m => (m.clientMessageId === clientMsgId ? { ...m, status: 'failed' } : m)));
    } finally {
      setSending(false);
    }
  };

  // 6. Handle Image Attachment
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversation?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File exceeds 5MB size limit.');
      return;
    }

    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64Data = reader.result;
        const uploadRes = await fetch(`/api/chat/conversations/${conversation.id}/attachments`, {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            base64Data
          })
        });
        const uploadData = await uploadRes.json();
        if (uploadData.success && uploadData.attachment) {
          // Send message with image attachment
          await fetch(`/api/chat/conversations/${conversation.id}/messages`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
              messageText: '📷 Photo attachment',
              messageType: 'image',
              attachmentUrl: uploadData.attachment.url,
              attachmentMeta: {
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
              }
            })
          });
        }
      } catch (err) {
        alert('Image upload failed: ' + err.message);
      } finally {
        setUploadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // 7. Emit typing event with debounce
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (!conversation?.id) return;

    emitTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitTyping(false);
    }, 2000);
  };

  const emitTyping = (isTyping) => {
    if (!conversation?.id) return;
    fetch(`/api/chat/conversations/${conversation.id}/typing`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ isTyping })
    }).catch(() => {});
  };

  // 8. Submit Report
  const handleSubmitReport = async (e) => {
    e.preventDefault();
    if (!conversation?.id) return;

    try {
      const res = await fetch(`/api/chat/conversations/${conversation.id}/report`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          reason: reportReason,
          details: reportDetails
        })
      });
      const data = await res.json();
      if (data.success) {
        setReportSubmitted(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSubmitted(false);
        }, 2000);
      }
    } catch {}
  };

  if (!isOpen) return null;

  // Counterparty display details
  const isWorker = userRole === 'professional';
  const partnerName = isWorker
    ? (conversation?.customerName || booking?.userName || 'Customer')
    : (conversation?.workerName || booking?.assignedProfessional?.name || 'Assigned Professional');
  const partnerTrade = isWorker
    ? (conversation?.serviceName || booking?.serviceName || 'Home Service')
    : (conversation?.workerTrade || booking?.assignedProfessional?.trade || 'Verified Pro Specialist');
  const partnerPhone = isWorker ? conversation?.customerPhone : conversation?.workerPhone;

  const isReadOnly = conversation?.status === 'read_only' || conversation?.status === 'closed';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 99990,
          transition: 'all 0.2s ease'
        }}
      />

      {/* Slide-out Drawer */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          width: '100%',
          maxWidth: 480,
          height: '88vh',
          background: '#FFFFFF',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: '0 -20px 45px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.1)',
          zIndex: 99995,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'slideUpChat 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Avatar with pulse online dot */}
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  color: '#FFFFFF',
                  border: '2px solid rgba(255,255,255,0.3)',
                  boxShadow: '0 4px 10px rgba(99, 102, 241, 0.4)'
                }}
              >
                {partnerName.slice(0, 2).toUpperCase()}
              </div>
              <span
                style={{
                  position: 'absolute',
                  bottom: 1,
                  right: 1,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: isCounterpartyOnline ? '#10B981' : '#94A3B8',
                  border: '2px solid #1E1B4B'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <strong style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>
                  {partnerName}
                </strong>
                <span
                  style={{
                    fontSize: 10,
                    background: 'rgba(255,255,255,0.18)',
                    padding: '1px 6px',
                    borderRadius: 10,
                    color: '#E0E7FF'
                  }}
                >
                  #{booking?.id}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#C7D2FE', marginTop: 2 }}>
                {counterpartyTyping ? (
                  <span style={{ color: '#FCD34D', fontWeight: 600 }}>typing...</span>
                ) : (
                  <span>{partnerTrade} • <span style={{ color: isCounterpartyOnline ? '#34D399' : '#94A3B8' }}>{isCounterpartyOnline ? 'Online' : 'Away'}</span></span>
                )}
              </div>
            </div>
          </div>

          {/* Action icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {partnerPhone && (
              <a
                href={`tel:${partnerPhone}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  textDecoration: 'none'
                }}
                title="Call via Masked Bridge"
              >
                <Phone size={17} />
              </a>
            )}

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FECACA',
                cursor: 'pointer'
              }}
              title="Report Issue"
            >
              <ShieldAlert size={17} />
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Real-time Encryption / Location Banner */}
        <div
          style={{
            padding: '7px 16px',
            background: '#EEF2FF',
            borderBottom: '1px solid #E0E7FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#4338CA'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4F46E5' }} />
            <span>Direct Krishnagiri Town Channel • Doorstep dispatch</span>
          </div>

          {/* Bilingual Language Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFFFFF', padding: '2px 8px', borderRadius: 12, border: '1px solid #C7D2FE' }}>
            <Globe size={11} color="#6366F1" />
            <button
              type="button"
              onClick={() => setLanguage('en')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 11,
                fontWeight: language === 'en' ? 700 : 500,
                color: language === 'en' ? '#4F46E5' : '#6B7280',
                cursor: 'pointer',
                padding: 0
              }}
            >
              EN
            </button>
            <span style={{ color: '#D1D5DB' }}>|</span>
            <button
              type="button"
              onClick={() => setLanguage('ta')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 11,
                fontWeight: language === 'ta' ? 700 : 500,
                color: language === 'ta' ? '#4F46E5' : '#6B7280',
                cursor: 'pointer',
                padding: 0
              }}
            >
              தமிழ்
            </button>
          </div>
        </div>

        {/* Message Thread Area */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#F8FAFC'
          }}
        >
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, color: '#6366F1' }}>
              <Loader2 size={24} className="animate-spin" />
              <span style={{ fontSize: 13, fontWeight: 600 }}>Connecting private channel...</span>
            </div>
          )}

          {error && (
            <div style={{ padding: 16, background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: 12, color: '#991B1B', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={18} />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && messages.map((m, idx) => {
            const isMe = m.senderRole === userRole;
            const isSystem = m.messageType === 'system' || m.senderRole === 'system';

            if (isSystem) {
              return (
                <div
                  key={m.id || idx}
                  style={{
                    alignSelf: 'center',
                    background: '#F1F5F9',
                    border: '1px solid #E2E8F0',
                    color: '#475569',
                    fontSize: 11.5,
                    padding: '5px 14px',
                    borderRadius: 16,
                    textAlign: 'center',
                    maxWidth: '90%',
                    margin: '6px 0'
                  }}
                >
                  🔒 {m.messageText}
                </div>
              );
            }

            return (
              <div
                key={m.id || idx}
                style={{
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '78%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    background: isMe
                      ? 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                      : '#FFFFFF',
                    color: isMe ? '#FFFFFF' : '#0F172A',
                    padding: '10px 14px',
                    borderRadius: 16,
                    borderBottomRightRadius: isMe ? 4 : 16,
                    borderBottomLeftRadius: isMe ? 16 : 4,
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    boxShadow: isMe ? '0 3px 10px rgba(79, 70, 229, 0.25)' : '0 1px 3px rgba(0,0,0,0.06)',
                    border: isMe ? 'none' : '1px solid #E2E8F0',
                    wordBreak: 'break-word'
                  }}
                >
                  {/* Photo Attachment */}
                  {m.attachmentUrl && (
                    <div style={{ marginBottom: 6, position: 'relative', cursor: 'pointer' }} onClick={() => setEnlargedImage(m.attachmentUrl)}>
                      <img
                        src={m.attachmentUrl}
                        alt="attachment"
                        style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 10, display: 'block', objectFit: 'cover' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 6,
                          right: 6,
                          background: 'rgba(0,0,0,0.5)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Maximize2 size={12} />
                      </div>
                    </div>
                  )}

                  {/* Text */}
                  {m.messageText && m.messageText !== '📷 Photo attachment' && (
                    <div>{m.messageText}</div>
                  )}
                </div>

                {/* Status Ticks & Timestamp */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10.5,
                    color: '#94A3B8',
                    marginTop: 3,
                    padding: '0 4px'
                  }}
                >
                  <span>
                    {m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                  </span>
                  {isMe && (
                    <span>
                      {m.status === 'sending' && <Clock size={11} color="#94A3B8" />}
                      {m.status === 'sent' && <Check size={12} color="#94A3B8" />}
                      {m.status === 'delivered' && <CheckCheck size={12} color="#94A3B8" />}
                      {m.status === 'read' && <CheckCheck size={12} color="#10B981" />}
                      {m.status === 'failed' && <span style={{ color: '#EF4444' }}>Failed (Tap to retry)</span>}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {counterpartyTyping && (
            <div
              style={{
                alignSelf: 'flex-start',
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                padding: '8px 14px',
                borderRadius: 16,
                borderBottomLeftRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: '#64748B'
              }}
            >
              <span>{partnerName} is typing</span>
              <div style={{ display: 'flex', gap: 3 }}>
                <span className="typing-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366F1' }} />
                <span className="typing-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366F1' }} />
                <span className="typing-dot" style={{ width: 4, height: 4, borderRadius: '50%', background: '#6366F1' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies Carousel */}
        {!isReadOnly && quickReplies.length > 0 && (
          <div
            style={{
              padding: '8px 12px',
              background: '#F1F5F9',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              gap: 8,
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {quickReplies.map((qr) => {
              const chipLabel = language === 'ta' ? qr.ta : qr.en;
              return (
                <button
                  key={qr.id}
                  type="button"
                  onClick={() => handleSendMessage(chipLabel, 'quick_reply')}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: 16,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#334155',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6366F1';
                    e.currentTarget.style.color = '#4F46E5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.color = '#334155';
                  }}
                >
                  ⚡ {chipLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* Input Bar or Read-Only Notice */}
        {isReadOnly ? (
          <div
            style={{
              padding: '14px 20px',
              background: '#F1F5F9',
              borderTop: '1px solid #E2E8F0',
              textAlign: 'center',
              fontSize: 12,
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Lock size={14} />
            <span>Service completed. Conversation is now read-only for records and audits.</span>
          </div>
        ) : (
          <div
            style={{
              padding: '12px 16px',
              background: '#FFFFFF',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              gap: 10
            }}
          >
            {/* Image upload button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              disabled={uploadingImage}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: '#F1F5F9',
                border: 'none',
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: uploadingImage ? '#94A3B8' : '#4F46E5',
                cursor: 'pointer'
              }}
              title="Attach Photo"
            >
              {uploadingImage ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={19} />}
            </button>

            {/* Input field */}
            <input
              type="text"
              placeholder={language === 'ta' ? 'செய்தியைத் தட்டச்சு செய்யவும்...' : `Message ${partnerName}...`}
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              style={{
                flex: 1,
                padding: '11px 16px',
                borderRadius: 24,
                border: '1.5px solid #E2E8F0',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.15s ease',
                color: '#0F172A'
              }}
              onFocus={(e) => { e.target.style.borderColor = '#6366F1'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E2E8F0'; }}
            />

            {/* Send button */}
            <button
              type="button"
              disabled={!inputText.trim() || sending}
              onClick={() => handleSendMessage()}
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: !inputText.trim() || sending
                  ? '#CBD5E1'
                  : 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                cursor: !inputText.trim() || sending ? 'default' : 'pointer',
                boxShadow: !inputText.trim() || sending ? 'none' : '0 4px 12px rgba(79, 70, 229, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Safety Report Modal */}
      {showReportModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              maxWidth: 420,
              width: '100%',
              padding: 24,
              boxShadow: '0 20px 30px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#DC2626', fontWeight: 700, fontSize: 16 }}>
                <ShieldAlert size={20} />
                <span>Report Conversation</span>
              </div>
              <button type="button" onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {reportSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#059669' }}>
                <Check size={36} style={{ margin: '0 auto 10px auto' }} />
                <h4 style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Report Submitted</h4>
                <p style={{ fontSize: 13, color: '#64748B' }}>
                  Our Trust & Safety arbitration team has been alerted and will review the case log.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  REASON FOR REPORT:
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, marginBottom: 14 }}
                >
                  <option value="Inappropriate language">Inappropriate language or harassment</option>
                  <option value="Safety concern">Safety or personal conduct concern</option>
                  <option value="Unprofessional behavior">Unprofessional service conduct</option>
                  <option value="Spam or fraudulent request">Spam or fraudulent request</option>
                </select>

                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  ADDITIONAL DETAILS:
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Provide context for our review team..."
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, marginBottom: 16 }}
                />

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: 'pointer', fontSize: 13 }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: '#DC2626', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Enlarged Image Lightbox Modal */}
      {enlargedImage && (
        <div
          onClick={() => setEnlargedImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20
          }}
        >
          <img
            src={enlargedImage}
            alt="Enlarged"
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </>
  );
}
