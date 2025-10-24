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
  ImageBackground,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { OptimisticMessage } from '../../types';
import { COLORS } from '../../utils/constants';
import { Colors } from '../../constants';
import { subscribeToMessages, sendMessageOptimistic, retryMessage, markMessagesAsRead, markMessagesAsDelivered, sendImageMessage, sendVideoMessage } from '../../services/message.service';
import { getConversation, markConversationAsRead } from '../../services/conversation.service';
import { getUserData } from '../../services/auth.service';
import { MessageBubble } from '../../components/MessageBubble';
import { MessageInput } from '../../components/MessageInput';
import { TypingIndicator } from '../../components/TypingIndicator';
import { GroupMembersModal } from '../../components/GroupMembersModal';
import { SmartRepliesBar } from '../../components/SmartRepliesBar';
import { getMessagesFromLocal, saveMessageToLocal, getUserFromCache, saveUserToCache, getConversationFromLocal, clearMessagesFromLocal } from '../../services/storage.service';
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
  const { theme, isDark } = useTheme();
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

    // Only update if messages changed (prevent unnecessary re-renders)
    setMessages(prev => {
      if (prev.length === allMessages.length) {
        const allSame = prev.every((prevMsg, idx) => 
          prevMsg.id === allMessages[idx].id && 
          prevMsg.status === allMessages[idx].status
        );
        if (allSame) return prev;
      }
      return allMessages;
    });
  }, [firestoreMessages, optimisticMessages]);

  useEffect(() => {
    if (!id || !user) return;

    let isMounted = true;

    const loadMessages = async () => {
      try {
        // 0. FIRST: Load conversation from cache to get isGroup status (prevents flickering)
        const cachedConversation = await getConversationFromLocal(id);
        if (cachedConversation && isMounted) {
          setIsGroup(cachedConversation.isGroup);
          if (cachedConversation.isGroup) {
            setParticipantCount(cachedConversation.participants.length);
            setParticipantIds(cachedConversation.participants);
            setOtherUserName(cachedConversation.groupName || 'Group Chat');
          }
        }

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
          
          // Populate senderName for messages that don't have it (for group chats)
          const messagesWithNames = await Promise.all(msgs.map(async (msg) => {
            if (!msg.senderName || msg.senderName === '') {
              // Fetch sender's display name
              try {
                const senderData = await getUserData(msg.senderId);
                const name = senderData?.displayName || 'Unknown User';
                console.log('📛 Populated missing senderName:', name, 'for message from:', msg.senderId);
                return {
                  ...msg,
                  senderName: name
                } as OptimisticMessage;
              } catch (error) {
                console.error('Error fetching sender name:', error);
                return { ...msg, senderName: 'Unknown User' } as OptimisticMessage;
              }
            }
            return msg as OptimisticMessage;
          }));
          
          console.log('📬 Messages with names:', messagesWithNames.map(m => ({ 
            sender: m.senderName, 
            text: m.text.substring(0, 20),
            type: m.type,
            hasImageUrl: !!m.imageUrl,
            hasMedia: !!m.media
          })));
          
          // Clear and replace cache with fresh Firestore data (prevents stale/duplicate messages)
          await clearMessagesFromLocal(id);
          
          // Save fresh messages to cache
          for (const msg of messagesWithNames) {
            try {
              await saveMessageToLocal(msg);
            } catch (error) {
              console.error('Error caching message:', error);
            }
          }
          
          // Only update if messages changed (prevent flickering)
          setFirestoreMessages(prev => {
            // Check if messages are actually different
            if (prev.length === messagesWithNames.length) {
              // Create a map for fast lookup
              const prevMap = new Map(prev.map(m => [m.id, m]));
              const allSame = messagesWithNames.every(newMsg => {
                const prevMsg = prevMap.get(newMsg.id);
                return prevMsg && 
                       prevMsg.text === newMsg.text && 
                       prevMsg.status === newMsg.status &&
                       prevMsg.senderName === newMsg.senderName;
              });
              if (allSame) return prev; // Don't update if nothing changed
            }
            return messagesWithNames;
          });
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
        console.log('✅ Group chat detected:', conversation.groupName, 'participants:', conversation.participants.length);
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

  const handleSendImage = async (imageUri: string, width: number, height: number, caption?: string) => {
    if (!user || !id) return;

    try {
      // Check if online
      const online = await isOnline();

      if (!online) {
        Alert.alert('Offline', 'Image upload requires an internet connection. Please try again when online.');
        return;
      }

      // Create optimistic message for immediate display
      const optimisticImageMessage: OptimisticMessage = {
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: id,
        text: caption || '',
        senderId: user.uid,
        senderName: user.displayName,
        timestamp: new Date(),
        status: 'sending',
        type: 'image',
        media: {
          localUri: imageUri, // Show local preview
          width,
          height,
          mimeType: 'image/jpeg',
        },
        isOptimistic: true,
      };

      // Add to optimistic messages immediately
      setOptimisticMessages(prev => [...prev, optimisticImageMessage]);

      // Upload to S3 and save to Firestore in background
      try {
        await sendImageMessage(
          id,
          imageUri,
          user.uid,
          user.displayName,
          width,
          height,
          caption,
          (progress) => {
            console.log(`📤 Upload progress: ${progress.percentage}%`);
            // TODO: Update UI with upload progress
          }
        );

        // Remove optimistic message after successful upload
        setOptimisticMessages(prev => 
          prev.filter(msg => msg.id !== optimisticImageMessage.id)
        );

        console.log('✅ Image sent successfully');
      } catch (uploadError) {
        console.error('❌ Image upload failed:', uploadError);
        
        // Mark optimistic message as failed
        setOptimisticMessages(prev =>
          prev.map(msg =>
            msg.id === optimisticImageMessage.id
              ? { 
                  ...msg, 
                  status: 'failed' as const, 
                  error: uploadError instanceof Error ? uploadError.message : 'Upload failed' 
                }
              : msg
          )
        );

        Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error sending image:', error);
      Alert.alert('Error', 'Failed to send image. Please try again.');
    }
  };

  const handleSendImages = async (images: Array<{ uri: string; width: number; height: number }>, caption?: string) => {
    if (!user || !id || images.length === 0) return;

    try {
      // Check if online
      const online = await isOnline();

      if (!online) {
        Alert.alert('Offline', 'Image upload requires an internet connection. Please try again when online.');
        return;
      }

      // Send each image separately (with shared caption on first image only)
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const imageCaption = i === 0 ? caption : undefined; // Only first image gets caption
        
        await handleSendImage(image.uri, image.width, image.height, imageCaption);
        
        // Small delay between sends to avoid overwhelming the system
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      console.log(`✅ Successfully sent ${images.length} images`);
    } catch (error) {
      console.error('❌ Error sending images:', error);
      Alert.alert('Error', 'Failed to send some images. Please try again.');
    }
  };

  const handleSendVideo = async (
    videoUri: string, 
    duration: number, 
    thumbnailUri: string, 
    width: number, 
    height: number, 
    caption?: string
  ) => {
    if (!user || !id) return;

    try {
      // Check if online
      const online = await isOnline();

      if (!online) {
        Alert.alert('Offline', 'Video upload requires an internet connection. Please try again when online.');
        return;
      }

      // Video is already validated at picker stage (≤ 60s)
      console.log('📹 Sending video:', {
        duration,
        width,
        height,
      });

      // Create optimistic message for immediate display
      const optimisticVideoMessage: OptimisticMessage = {
        id: `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        conversationId: id,
        text: caption || '',
        senderId: user.uid,
        senderName: user.displayName,
        timestamp: new Date(),
        status: 'sending',
        type: 'video',
        media: {
          localUri: videoUri,
          thumbnailUrl: thumbnailUri,
          duration: duration,
          width,
          height,
          mimeType: 'video/mp4',
        },
        isOptimistic: true,
      };

      // Add to optimistic messages immediately
      setOptimisticMessages(prev => [...prev, optimisticVideoMessage]);

      // Upload to S3 and save to Firestore in background
      try {
        await sendVideoMessage(
          id,
          videoUri,
          thumbnailUri,
          user.uid,
          user.displayName,
          duration,
          width,
          height,
          caption,
          (progress) => {
            console.log(`📤 Upload progress: ${progress.percentage}%`);
            // TODO: Update UI with upload progress
          }
        );

        // Remove optimistic message after successful upload
        setOptimisticMessages(prev => 
          prev.filter(msg => msg.id !== optimisticVideoMessage.id)
        );

        console.log('✅ Video sent successfully');
      } catch (uploadError) {
        console.error('❌ Video upload failed:', uploadError);
        
        // Mark optimistic message as failed
        setOptimisticMessages(prev =>
          prev.map(msg =>
            msg.id === optimisticVideoMessage.id
              ? { 
                  ...msg, 
                  status: 'failed' as const, 
                  error: uploadError instanceof Error ? uploadError.message : 'Upload failed' 
                }
              : msg
          )
        );

        Alert.alert('Upload Failed', 'Failed to upload video. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error sending video:', error);
      Alert.alert('Error', 'Failed to send video. Please try again.');
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
          isGroupChat={isGroup}
          userPreferredLanguage={aiSettings.preferredLanguage}
          autoTranslate={aiSettings.autoTranslate}
          showCulturalHints={aiSettings.showCulturalHints}
        />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textPrimary }]}>No messages yet</Text>
      <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>Send a message to start the conversation!</Text>
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

        {/* Loading or Messages List with WhatsApp-style background */}
        <View style={[
          styles.messagesContainer,
          { backgroundColor: isDark ? '#0d1418' : theme.background }
        ]}>
          {/* WhatsApp-style subtle pattern overlay for dark mode */}
          {isDark && (
            <View style={styles.darkPatternOverlay}>
              {/* Create repeating pattern dots */}
              {Array.from({ length: 100 }).map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.patternDot,
                    {
                      left: `${(i % 10) * 10 + 2}%`,
                      top: `${Math.floor(i / 10) * 10 + 2}%`,
                    }
                  ]}
                />
              ))}
            </View>
          )}
          
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
        </View>

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
        <MessageInput 
          onSend={handleSendMessage} 
          onSendImage={handleSendImage}
          onSendImages={handleSendImages}
          onSendVideo={handleSendVideo}
          onTyping={handleTyping} 
        />
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
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  messagesContainer: {
    flex: 1,
    position: 'relative',
  },
  darkPatternOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
    pointerEvents: 'none', // Allow touches to pass through
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3a4a52',
    opacity: 0.7,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
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

