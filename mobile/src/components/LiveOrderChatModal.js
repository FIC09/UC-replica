import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator
} from 'react-native';
import mobileApi from '../services/apiClient';

export default function LiveOrderChatModal({
  visible,
  onClose,
  booking,
  userRole = 'customer', // 'customer' | 'worker'
  currentUserName = ''
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef(null);

  const rawBookingId = booking?.id || booking?.bookingReference || '9410';
  const cleanBookingId = String(rawBookingId).replace(/^#/, '').trim();

  const isCustomer = userRole === 'customer';
  const senderRole = isCustomer ? 'customer' : 'worker';
  const senderName = currentUserName || (isCustomer ? (booking?.customer || booking?.userName || 'Customer') : (booking?.assignedProfessional?.name || 'Vikram Salvi'));
  const counterpartyName = isCustomer
    ? (booking?.assignedProfessional?.name || booking?.technician?.name || 'Vikram Salvi (Specialist)')
    : (booking?.customer || booking?.userName || booking?.customerName || 'Customer');

  const displayBookingRef = cleanBookingId.startsWith('UC-')
    ? cleanBookingId
    : `UC-${cleanBookingId.replace(/^(JOB|LEAD)[-_]?/i, '')}`;

  // Load and poll messages in real-time
  const fetchMessages = async () => {
    try {
      let res = await mobileApi.getChatMessages(cleanBookingId);
      if ((!res || !res.success || !Array.isArray(res.messages) || res.messages.length === 0) && cleanBookingId) {
        const bare = cleanBookingId.replace(/^(UC|JOB|LEAD)[-_]?/i, '');
        const alt = await mobileApi.getChatMessages(`UC-${bare}`);
        if (alt && alt.success && Array.isArray(alt.messages) && alt.messages.length > 0) {
          res = alt;
        }
      }
      if (res && res.success && Array.isArray(res.messages)) {
        setMessages(res.messages);
      }
    } catch (_) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchMessages();
    const interval = setInterval(fetchMessages, 1500);
    return () => clearInterval(interval);
  }, [visible, cleanBookingId]);

  useEffect(() => {
    if (visible && messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, visible]);

  const handleSendMessage = async (textToSend = null) => {
    const text = (textToSend || inputText).trim();
    if (!text || isSending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      bookingId: cleanBookingId,
      senderName,
      senderRole,
      messageText: text,
      createdAt: new Date().toISOString(),
      status: 'sending'
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');
    setIsSending(true);

    try {
      const res = await mobileApi.sendChatMessage({
        bookingId: cleanBookingId,
        senderId: isCustomer ? 'CUST-USER' : 'PRO-8841',
        senderRole,
        senderName,
        messageText: text
      });

      if (res && res.success && res.message) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...res.message, status: 'delivered' } : m))
        );
      }
    } catch (_) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'delivered' } : m))
      );
    } finally {
      setIsSending(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 80);
    }
  };

  const customerQuickReplies = [
    "I'm waiting at the door 🚪",
    'Please call when you reach 📞',
    'Where are you now? 🛵',
    `Safety Start OTP: ${booking?.otp || booking?.safetyPin || '4829'} 🔑`
  ];

  const workerQuickReplies = [
    "I'm on the way to your doorstep 🛵",
    'I have arrived at your gate / door 📍',
    'Please share your 4-digit start OTP 🔑',
    'Service is completed! 🎉'
  ];

  const quickReplies = isCustomer ? customerQuickReplies : workerQuickReplies;

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>←</Text>
            </TouchableOpacity>

            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {counterpartyName.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                {counterpartyName}
              </Text>
              <View style={styles.onlineStatusRow}>
                <View style={styles.onlineGreenDot} />
                <Text style={styles.onlineStatusText}>Connected · Live Dispatch Chat</Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeChip} activeOpacity={0.8}>
              <Text style={styles.closeChipText}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          {/* Encryption & Order Info Banner */}
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              🔒 Order #{displayBookingRef} · Real-time direct chat between customer and specialist
            </Text>
          </View>

          {/* Messages Scroll Area */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {loading && messages.length === 0 ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#F04400" />
                <Text style={styles.loadingText}>Connecting live chat...</Text>
              </View>
            ) : messages.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ fontSize: 36, marginBottom: 8 }}>💬</Text>
                <Text style={styles.emptyTitle}>Direct Dispatch Chat Active</Text>
                <Text style={styles.emptySub}>
                  Send a message or tap a quick reply below to communicate directly about your doorstep service.
                </Text>
              </View>
            ) : (
              messages.map((item, idx) => {
                const isMine =
                  item.senderRole === senderRole ||
                  item.senderName === senderName ||
                  (isCustomer && item.senderRole === 'customer') ||
                  (!isCustomer && (item.senderRole === 'worker' || item.senderRole === 'professional'));

                const isSystem = item.senderRole === 'system';

                if (isSystem) {
                  return (
                    <View key={item.id || idx} style={styles.systemMsgBox}>
                      <Text style={styles.systemMsgText}>ℹ️ {item.messageText || item.text}</Text>
                    </View>
                  );
                }

                const timeStr = item.createdAt
                  ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Just now';

                return (
                  <View
                    key={item.id || idx}
                    style={[styles.messageRow, isMine ? styles.myMessageRow : styles.theirMessageRow]}
                  >
                    {!isMine && (
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>
                          {(item.senderName || 'S').charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.bubble, isMine ? styles.myBubble : styles.theirBubble]}>
                      {!isMine && (
                        <Text style={styles.senderHeaderName}>{item.senderName || counterpartyName}</Text>
                      )}
                      <Text style={[styles.bubbleText, isMine ? styles.myBubbleText : styles.theirBubbleText]}>
                        {item.messageText || item.text}
                      </Text>
                      <View style={styles.bubbleMetaRow}>
                        <Text style={[styles.metaTime, isMine ? styles.myMetaTime : styles.theirMetaTime]}>
                          {timeStr}
                        </Text>
                        {isMine && (
                          <Text style={styles.deliveredTick}>✓✓</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* Quick Reply Chips */}
          <View style={styles.quickRepliesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickRepliesScroll}>
              {quickReplies.map((reply, i) => (
                <TouchableOpacity
                  key={`qr-${i}`}
                  style={styles.quickReplyChip}
                  onPress={() => handleSendMessage(reply)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickReplyText}>{reply}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Input Area */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
              onPress={() => handleSendMessage()}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.85}
            >
              <Text style={styles.sendBtnIcon}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0'
  },
  backBtn: {
    padding: 6,
    marginRight: 6
  },
  backBtnText: {
    fontSize: 22,
    color: '#0F172A',
    fontWeight: '700'
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A'
  },
  onlineStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  onlineGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginRight: 5
  },
  onlineStatusText: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '600'
  },
  closeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F1F5F9'
  },
  closeChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B'
  },
  infoBanner: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEDD5'
  },
  infoBannerText: {
    fontSize: 11.5,
    color: '#C2410C',
    fontWeight: '600',
    textAlign: 'center'
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 14
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B'
  },
  emptyBox: {
    padding: 36,
    alignItems: 'center',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18
  },
  systemMsgBox: {
    alignSelf: 'center',
    backgroundColor: '#EEF2F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    maxWidth: '90%'
  },
  systemMsgText: {
    fontSize: 11.5,
    color: '#475569',
    textAlign: 'center'
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    alignItems: 'flex-end'
  },
  myMessageRow: {
    justifyContent: 'flex-end'
  },
  theirMessageRow: {
    justifyContent: 'flex-start'
  },
  smallAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    marginBottom: 2
  },
  smallAvatarText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E293B'
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 16
  },
  myBubble: {
    backgroundColor: '#0F172A',
    borderBottomRightRadius: 4
  },
  theirBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  senderHeaderName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F04400',
    marginBottom: 3
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 19
  },
  myBubbleText: {
    color: '#FFFFFF',
    fontWeight: '500'
  },
  theirBubbleText: {
    color: '#0F172A',
    fontWeight: '500'
  },
  bubbleMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4
  },
  metaTime: {
    fontSize: 10
  },
  myMetaTime: {
    color: '#94A3B8'
  },
  theirMetaTime: {
    color: '#94A3B8'
  },
  deliveredTick: {
    fontSize: 10,
    color: '#10B981',
    fontWeight: '700'
  },
  quickRepliesContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingVertical: 8
  },
  quickRepliesScroll: {
    paddingHorizontal: 14,
    gap: 8
  },
  quickReplyChip: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  quickReplyText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600'
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0'
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    maxHeight: 90
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F04400',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1'
  },
  sendBtnIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  }
});
