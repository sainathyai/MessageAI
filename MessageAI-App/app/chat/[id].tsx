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
import { subscribeToMessages, sendMessageOptimistic, retryMessage } from '../../services/message.service';
import { getConversation } from '../../services/conversation.service';
import { getUserData } from '../../services/auth.service';
import { MessageBubble } from '../../components/MessageBubble';
import { MessageInput } from '../../components/MessageInput';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<OptimisticMessage[]>([]);
  const [firestoreMessages, setFirestoreMessages] = useState<OptimisticMessage[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [otherUserName, setOtherUserName] = useState('Chat');

  // Merge optimistic and Firestore messages
  useEffect(() => {
    // Combine optimistic messages with Firestore messages
    // Remove optimistic messages that have been confirmed by Firestore
    const activeOptimistic = optimisticMessages.filter(opt => {
      // Keep if it's still sending or failed
      if (opt.status === 'sending' || opt.status === 'failed') return true;
      // Remove if we have a matching Firestore message
      return !firestoreMessages.some(fs => fs.text === opt.text && fs.senderId === opt.senderId);
    });

    // Combine and sort all messages
    const allMessages = [...firestoreMessages, ...activeOptimistic].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
    );

    setMessages(allMessages);
  }, [firestoreMessages, optimisticMessages]);

  useEffect(() => {
    if (!id || !user) return;

    // Load conversation details
    loadConversationDetails();

    // Subscribe to messages from Firestore
    const unsubscribe = subscribeToMessages(id, (msgs) => {
      setFirestoreMessages(msgs as OptimisticMessage[]);
      setLoading(false);
      
      // Auto-scroll to bottom on new message
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => unsubscribe();
  }, [id, user]);

  const loadConversationDetails = async () => {
    if (!id || !user) return;

    try {
      const conversation = await getConversation(id);
      if (conversation && !conversation.isGroup) {
        // Get other user's name
        const otherUserId = conversation.participants.find(uid => uid !== user.uid);
        if (otherUserId) {
          const userData = await getUserData(otherUserId);
          if (userData) {
            setOtherUserName(userData.displayName);
          }
        }
      } else if (conversation?.isGroup) {
        setOtherUserName(conversation.groupName || 'Group Chat');
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!user || !id || !text.trim()) return;

    await sendMessageOptimistic(
      id,
      text.trim(),
      user.uid,
      user.displayName,
      // On optimistic message created
      (optimisticMsg) => {
        setOptimisticMessages(prev => [...prev, optimisticMsg]);
        // Auto-scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
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

  const renderMessage = ({ item }: { item: OptimisticMessage }) => {
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
    <View style={styles.emptyContainer}>
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
          <Text style={styles.headerTitle}>{otherUserName}</Text>
          <View style={styles.backButton} />
        </View>

        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messagesList,
            messages.length === 0 && styles.emptyList
          ]}
          ListEmptyComponent={renderEmptyState}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Message Input */}
        <MessageInput onSend={handleSendMessage} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
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
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
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
    color: COLORS.PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
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

