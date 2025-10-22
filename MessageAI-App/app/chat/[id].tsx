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
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { OptimisticMessage } from '../../types';
import { COLORS } from '../../utils/constants';
import { subscribeToMessages, sendMessageOptimistic, retryMessage, markMessagesAsRead, markMessagesAsDelivered } from '../../services/message.service';
import { getConversation, markConversationAsRead } from '../../services/conversation.service';
import { getUserData } from '../../services/auth.service';
import { MessageBubble } from '../../components/MessageBubble';
import { MessageInput } from '../../components/MessageInput';
import { TypingIndicator } from '../../components/TypingIndicator';
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

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

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
        Math.abs(fs.timestamp.getTime() - opt.timestamp.getTime()) < 10000
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
      const signature = `${msg.senderId}-${msg.text.trim()}-${Math.floor(msg.timestamp.getTime() / 1000)}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        allMessages.push(msg);
      }
    });
    
    // Add active optimistic messages (only if not already in Firestore)
    activeOptimistic.forEach(msg => {
      const signature = `${msg.senderId}-${msg.text.trim()}-${Math.floor(msg.timestamp.getTime() / 1000)}`;
      if (!seen.has(signature)) {
        seen.add(signature);
        allMessages.push(msg);
      }
    });
    
    // Sort by timestamp (newest first for inverted FlatList)
    allMessages.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

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
            await saveUserToCache(userData);
          }
        }
      } else if (conversation?.isGroup) {
        setIsGroup(true);
        setParticipantCount(conversation.participants.length);
        setOtherUserName(conversation.groupName || 'Group Chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
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
        <MessageBubble message={item} isOwnMessage={isOwnMessage} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={[styles.emptyContainer, { transform: [{ scaleY: -1 }] }]}>
      <Text style={styles.emptyText}>No messages yet</Text>
      <Text style={styles.emptySubtext}>Send a message to start the conversation!</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{otherUserName}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>{otherUserName}</Text>
            {isGroup ? (
              <View style={styles.statusContainer}>
                <Text style={styles.statusText}>{participantCount} members</Text>
              </View>
            ) : otherUserId && (
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
          <View style={styles.backButton} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => {
            // Use a stable key that doesn't change when optimistic → real message
            // This prevents React from unmounting/remounting the component
            const signature = `${item.senderId}-${item.text.trim()}-${Math.floor(item.timestamp.getTime() / 1000)}`;
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

        {/* Typing Indicator */}
        <TypingIndicator typingUsers={typingUsers} />

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} onTyping={handleTyping} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.PRIMARY,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
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
    padding: 16,
    backgroundColor: COLORS.PRIMARY,
    paddingTop: 50, // Account for status bar
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.WHITE,
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
    marginRight: 4,
    borderWidth: 1,
    borderColor: COLORS.WHITE,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.WHITE,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

