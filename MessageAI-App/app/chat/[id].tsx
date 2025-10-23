import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OptimisticMessage } from '../../types';
import { COLORS } from '../../utils/constants';
import { Colors } from '../../constants';
import { subscribeToMessages, sendMessageOptimistic, retryMessage, markMessagesAsRead, markMessagesAsDelivered } from '../../services/message.service';
import { getConversation, markConversationAsRead } from '../../services/conversation.service';
import { getUserData } from '../../services/auth.service';
import { MessageBubble } from '../../components/MessageBubble';
import { MessageInput } from '../../components/MessageInput';
import { TypingIndicator } from '../../components/TypingIndicator';
import { GroupMembersModal } from '../../components/GroupMembersModal';
import { SmartRepliesBar } from '../../components/SmartRepliesBar';
import { getMessagesFromLocal, saveMessageToLocal, getUserFromCache, saveUserToCache } from '../../services/storage.service';
import { isOnline, queueMessageForSync } from '../../services/sync.service';
import {
  subscribeToUserPresence,
  setTypingIndicator,
  subscribeToTypingIndicators,
  clearTypingIndicator,
  getLastSeenText
} from '../../services/presence.service';
import { setBadgeCount } from '../../services/notification.service';
import { useAISettings } from '../../hooks/useAISettings';
import { generateSmartReplies, learnCommunicationStyle } from '../../services/smart-replies.service';
import { SmartReply } from '../../types/ai.types';
import { isAIConfigured } from '../../services/ai.service';
import { getTime, toDate } from '../../utils/dateFormat';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);
  const { settings: aiSettings } = useAISettings();
  const insets = useSafeAreaInsets();
  
  // Capture initial bottom inset ONCE using ref (never changes)
  const fixedBottomInsetRef = useRef<number | null>(null);
  if (fixedBottomInsetRef.current === null) {
    fixedBottomInsetRef.current = Platform.OS === 'android' ? Math.max(insets.bottom, 20) : 0;
  }

  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [firestoreMessages, setFirestoreMessages] = useState<OptimisticMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState('Loading...');
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [otherUserLastSeen, setOtherUserLastSeen] = useState<Date | null>(null);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [showGroupMembers, setShowGroupMembers] = useState(false);

  // Smart replies state
  const [smartReplies, setSmartReplies] = useState<SmartReply[]>([]);
  const [loadingSmartReplies, setLoadingSmartReplies] = useState(false);
  const [smartRepliesError, setSmartRepliesError] = useState<string | null>(null);
  const smartRepliesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear badge count when entering chat
  useEffect(() => {
    setBadgeCount(0);
  }, []);

  // Merge optimistic and Firestore messages
  useEffect(() => {
    // Only keep optimistic messages that are still sending or failed
    // As soon as they're confirmed by Firestore, remove them
    const activeOptimistic = optimisticMessages.filter(opt => {
      // Always keep if still sending or failed
      if (opt.status === 'sending' || opt.status === 'failed') return true;
      
      // For 'sent' optimistic messages, check if Firestore has a matching one
      // Match by: same text, same sender, timestamp within 10 seconds
      const hasFirestoreMatch = firestoreMessages.some(fs => 
        fs.text.trim() === opt.text.trim() && 
        fs.senderId === opt.senderId &&
        Math.abs(getTime(fs.timestamp) - getTime(opt.timestamp)) < 10000
      );
      
      // Remove if Firestore has it
      return !hasFirestoreMatch;
    });

    // Combine: Firestore messages + only truly optimistic messages
    // Use a Set to track unique message signatures to prevent any duplicates
    const seen = new Set<string>();
    const allMessages: OptimisticMessage[] = [];
    
    // Add Firestore messages first (they're the source of truth)
    firestoreMessages.forEach(msg => {
      const signature = `${msg.senderId}-${msg.text.trim()}-${Math.floor(getTime(msg.timestamp) / 1000)}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        allMessages.push(msg);
      }
    });
    
    // Add active optimistic messages (only if not already in Firestore)
    activeOptimistic.forEach(msg => {
      const signature = `${msg.senderId}-${msg.text.trim()}-${Math.floor(getTime(msg.timestamp) / 1000)}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        allMessages.push(msg);
      }
    });
    
    // Sort by timestamp (newest first for inverted FlatList)
    allMessages.sort((a, b) => getTime(b.timestamp) - getTime(a.timestamp));

    setMessages(allMessages);
  }, [firestoreMessages, optimisticMessages]);

  useEffect(() => {
    if (!id || !user) return;

    let isMounted = true;

    const loadMessages = async () => {
      try {
        // 1. Load from SQLite cache FIRST (instant, works offline)
        console.log('📦 Loading messages from cache...');
        const cachedMessages = await getMessagesFromLocal(id);
        if (isMounted && cachedMessages.length > 0) {
          console.log(`✅ Loaded ${cachedMessages.length} cached messages`);
          setFirestoreMessages(cachedMessages);
          setLoading(false);
        }

        // 2. Then subscribe to Firestore for real-time updates
        console.log('🌐 Subscribing to Firestore messages...');
        const unsubscribe = subscribeToMessages(id, async (msgs) => {
          if (!isMounted) return;
          
          console.log(`📨 Received ${msgs.length} messages from Firestore`);
          
          // Save messages to local cache
          for (const msg of msgs) {
            try {
              await saveMessageToLocal(msg as OptimisticMessage);
            } catch (error) {
              console.error('Error caching message:', error);
            }
          }
          
          setFirestoreMessages(msgs as OptimisticMessage[]);
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error loading messages:', error);
        setLoading(false);
      }
    };

    // Load conversation details
    loadConversationDetails();

    // Start loading messages
    const unsubscribePromise = loadMessages();

    return () => {
      isMounted = false;
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, [id, user]);

  // Subscribe to other user's presence status
  useEffect(() => {
    if (!otherUserId) return;

    const unsubscribe = subscribeToUserPresence(
      otherUserId,
      (isOnline, lastSeen) => {
        setIsOtherUserOnline(isOnline);
        setOtherUserLastSeen(lastSeen);
      }
    );

    return () => unsubscribe();
  }, [otherUserId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!id || !user) return;

    const unsubscribe = subscribeToTypingIndicators(
      id,
      user.uid,
      (users) => {
        setTypingUsers(users);
      }
    );

    return () => unsubscribe();
  }, [id, user]);

  // Clear typing indicator on unmount
  useEffect(() => {
    return () => {
      if (id && user) {
        clearTypingIndicator(id, user.uid);
      }
    };
  }, [id, user]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (!id || !user) return;

    const markAsRead = async () => {
      try {
        // Mark conversation as read (updates conversation list)
        await markConversationAsRead(id, user.uid);

        // For DMs: also mark individual messages as read/delivered
        if (otherUserId) {
          await markMessagesAsDelivered(id, user.uid);
          await markMessagesAsRead(id, otherUserId, user.uid);
        }
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    };

    // Mark on mount
    markAsRead();

    // Also mark when new messages arrive (after a short delay to ensure they're visible)
    const timeoutId = setTimeout(() => {
      markAsRead();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [id, user, otherUserId, firestoreMessages.length]);

  const loadConversationDetails = async () => {
    if (!id || !user) return;

    try {
      const conversation = await getConversation(id);
      if (conversation && !conversation.isGroup) {
        // Get other user's name
        setIsGroup(false);
        const foundOtherUserId = conversation.participants.find(uid => uid !== user.uid);
        if (foundOtherUserId) {
          setOtherUserId(foundOtherUserId);
          
          // Try cache first for instant load
          const cachedUser = await getUserFromCache(foundOtherUserId);
          if (cachedUser) {
            setOtherUserName(cachedUser.displayName);
          }
          
          // Then fetch from Firestore (will update if changed)
          const userData = await getUserData(foundOtherUserId);
          if (userData) {
            setOtherUserName(userData.displayName);
            // Save to cache for next time
            await saveUserToCache({
              ...userData,
              lastSeen: toDate(userData.lastSeen)
            });
          }
        }
      } else if (conversation?.isGroup) {
        setIsGroup(true);
        setParticipantCount(conversation.participants.length);
        setParticipantIds(conversation.participants);
        setOtherUserName(conversation.groupName || 'Group Chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleMemberPress = async (userId: string) => {
    // Navigate to 1-on-1 chat with the selected member
    if (!user) return;
    
    try {
      // Import getOrCreateConversation
      const { getOrCreateConversation } = await import('../../services/conversation.service');
      const conversationId = await getOrCreateConversation(user.uid, userId);
      setShowGroupMembers(false);
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Generate smart replies when messages change
  const generateRepliesForMessages = async () => {
    // Only generate if AI is configured, smart replies are enabled, and we have messages
    if (!isAIConfigured() || !aiSettings.smartRepliesEnabled || messages.length === 0 || !user) {
      return;
    }

    // Don't generate for own messages (last message must be from someone else)
    // Messages are inverted (newest first at index 0)
    const lastMessage = messages[0];
    if (!lastMessage || lastMessage.senderId === user.uid) {
      setSmartReplies([]);
      return;
    }
    
    console.log('💡 Smart replies conditions met - generating...');

    // Debounce: Clear any existing timeout
    if (smartRepliesTimeoutRef.current) {
      clearTimeout(smartRepliesTimeoutRef.current);
    }

    // Wait 500ms before generating (to avoid too many API calls)
    smartRepliesTimeoutRef.current = setTimeout(async () => {
      setLoadingSmartReplies(true);
      setSmartRepliesError(null);

      try {
        // Learn user's communication style
        const userStyle = learnCommunicationStyle(
          messages.map(m => ({
            ...m,
            timestamp: toDate(m.timestamp) || new Date(),
          })),
          user.uid
        );

        // Generate smart replies
        const replies = await generateSmartReplies(
          messages.slice(-10).map(m => ({
            ...m,
            timestamp: toDate(m.timestamp) || new Date(),
          })),
          userStyle,
          3
        );

        setSmartReplies(replies);
      } catch (error: any) {
        console.error('Smart replies generation error:', error);
        
        // Provide friendly error messages
        let friendlyMessage: string | null = 'Failed to generate replies';
        
        if (error.code === 'RATE_LIMIT_EXCEEDED') {
          friendlyMessage = 'Too many requests. Please wait a moment.';
        } else if (error.code === 'API_KEY_INVALID') {
          friendlyMessage = 'AI service not configured properly';
        } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('network')) {
          friendlyMessage = 'Network issue. Check your connection.';
        } else if (error.code === 'API_ERROR') {
          // Don't show technical API errors to user
          friendlyMessage = null;
        }
        
        setSmartRepliesError(friendlyMessage);
      } finally {
        setLoadingSmartReplies(false);
      }
    }, 500);
  };

  // Trigger smart replies generation when messages change
  useEffect(() => {
    generateRepliesForMessages();

    // Cleanup timeout on unmount
    return () => {
      if (smartRepliesTimeoutRef.current) {
        clearTimeout(smartRepliesTimeoutRef.current);
      }
    };
  }, [messages, user, aiSettings.smartRepliesEnabled]);

  const handleSelectReply = (replyText: string) => {
    // When a smart reply is selected, send it as a message
    handleSendMessage(replyText);
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !id || !text.trim()) return;

    // Check if online
    const online = await isOnline();

    if (online) {
      // Online: Send with optimistic UI
      await sendMessageOptimistic(
        id,
        text.trim(),
        user.uid,
        user.displayName,
        // On optimistic message created
        (optimisticMsg) => {
          setOptimisticMessages(prev => [...prev, optimisticMsg]);
          // Save to local storage immediately
          saveMessageToLocal(optimisticMsg).catch(console.error);
        },
        // On success
        (realId) => {
          // Remove optimistic message (Firestore listener will add the real one)
          setOptimisticMessages(prev => 
            prev.filter(msg => !msg.text.includes(text.trim()))
          );
        },
        // On error
        (error) => {
          // Update the optimistic message to failed state
          setOptimisticMessages(prev =>
            prev.map(msg =>
              msg.text === text.trim() && msg.status === 'sending'
                ? { ...msg, status: 'failed' as const, error }
                : msg
            )
          );
        }
      );
    } else {
      // Offline: Queue message for later sync
      console.log('📴 Offline, queuing message...');
      
      const offlineMessage: OptimisticMessage = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: id,
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName,
        timestamp: new Date(),
        status: 'sending',
        type: 'text',
        isOptimistic: false
      };

      // Add to optimistic messages for immediate display
      setOptimisticMessages(prev => [...prev, offlineMessage]);

      // Queue for sync when online
      try {
        await queueMessageForSync(offlineMessage);
        console.log('✅ Message queued successfully');
      } catch (error) {
        console.error('Error queuing message:', error);
        // Mark as failed
        setOptimisticMessages(prev =>
          prev.map(msg =>
            msg.id === offlineMessage.id
              ? { ...msg, status: 'failed' as const, error: 'Failed to queue message' }
              : msg
          )
        );
      }
    }
  };

  const handleRetryMessage = async (message: OptimisticMessage) => {
    if (!user || !id) return;

    // Update to sending state
    setOptimisticMessages(prev =>
      prev.map(msg =>
        msg.id === message.id
          ? { ...msg, status: 'sending' as const, error: undefined }
          : msg
      )
    );

    await retryMessage(
      message,
      // On success
      (realId) => {
        // Remove optimistic message
        setOptimisticMessages(prev => prev.filter(msg => msg.id !== message.id));
      },
      // On error
      (error) => {
        setOptimisticMessages(prev =>
          prev.map(msg =>
            msg.id === message.id
              ? { ...msg, status: 'failed' as const, error }
              : msg
          )
        );
        Alert.alert('Failed to Send', error, [
          { text: 'Cancel' },
          { text: 'Retry', onPress: () => handleRetryMessage(message) }
        ]);
      }
    );
  };

  const handleTyping = async (isTyping: boolean) => {
    if (!id || !user) return;
    
    await setTypingIndicator(id, user.uid, user.displayName, isTyping);
  };

  const renderMessage = ({ item }: { item: OptimisticMessage}) => {
    const isOwnMessage = item.senderId === user?.uid;
    return (
      <TouchableOpacity
        onLongPress={() => {
          if (item.status === 'failed') {
            Alert.alert('Failed Message', 'Would you like to retry sending this message?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Retry', onPress: () => handleRetryMessage(item) },
              { text: 'Delete', style: 'destructive', onPress: () => {
                setOptimisticMessages(prev => prev.filter(msg => msg.id !== item.id));
              }}
            ]);
          }
        }}
        activeOpacity={item.status === 'failed' ? 0.7 : 1}
      >
        <MessageBubble 
          message={item} 
          isOwnMessage={isOwnMessage}
          userPreferredLanguage={aiSettings.preferredLanguage}
          autoTranslate={aiSettings.autoTranslate}
          showCulturalHints={aiSettings.showCulturalHints}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Send a message to start the conversation!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.outerContainer}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          enabled={true}
        >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{otherUserName}</Text>
            {!loading && isGroup ? (
              <TouchableOpacity 
                style={styles.statusContainer}
                onPress={() => setShowGroupMembers(true)}
              >
                <Text style={styles.statusText}>{participantCount} members</Text>
                <Text style={styles.statusText}> 👥</Text>
              </TouchableOpacity>
            ) : !loading && otherUserId && (
              <View style={styles.statusContainer}>
                {isOtherUserOnline && (
                  <>
                    <View style={styles.onlineDot} />
                    <Text style={styles.statusText}>online</Text>
                  </>
                )}
                {!isOtherUserOnline && otherUserLastSeen && (
                  <Text style={styles.statusText}>{getLastSeenText(otherUserLastSeen)}</Text>
                )}
              </View>
            )}
          </View>
          {!loading && isGroup ? (
            <TouchableOpacity
              style={styles.groupInfoButton}
              onPress={() => setShowGroupMembers(true)}
            >
              <Text style={styles.groupInfoIcon}>👥</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}
        </View>

        {/* Loading or Messages List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => {
            // Use a stable key that doesn't change when optimistic → real message
            // This prevents React from unmounting/remounting the component
            const signature = `${item.senderId}-${item.text.trim()}-${Math.floor(getTime(item.timestamp) / 1000)}`;
            return signature;
          }}
          renderItem={renderMessage}
          inverted
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={renderEmptyState}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
        />
        )}

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Smart Replies Bar */}
        <SmartRepliesBar
          replies={smartReplies}
          onSelectReply={handleSelectReply}
          loading={loadingSmartReplies}
          error={smartRepliesError || undefined}
          onRetry={generateRepliesForMessages}
          visible={aiSettings.smartRepliesEnabled && isAIConfigured()}
        />

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </KeyboardAvoidingView>

      {/* Fixed bottom safe area for Android navigation */}
      {Platform.OS === 'android' && <View style={[styles.bottomSafeArea, { height: fixedBottomInsetRef.current }]} />}
      
      </View>

      {/* Group Members Modal */}
      <GroupMembersModal
        visible={showGroupMembers}
        onClose={() => setShowGroupMembers(false)}
        participantIds={participantIds}
        currentUserId={user?.uid || ''}
        onMemberPress={handleMemberPress}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary, // Changed to teal
  },
  outerContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bottomSafeArea: {
    backgroundColor: Colors.primary, // Changed to teal
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary, // Changed to teal
    minHeight: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: Colors.white,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.online, // Using theme green
    marginRight: 4,
    borderWidth: 1,
    borderColor: Colors.white,
  },
  statusText: {
    fontSize: 12,
    color: Colors.white,
    opacity: 0.9,
  },
  messagesList: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  groupInfoButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  groupInfoIcon: {
    fontSize: 24,
  },
});

