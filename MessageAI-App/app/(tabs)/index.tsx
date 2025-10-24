import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation, User } from '../../types';
import { COLORS } from '../../utils/constants';
import { Colors } from '../../constants';
import { 
  subscribeToConversations, 
  getOrCreateConversation 
} from '../../services/conversation.service';
import { getUserData } from '../../services/auth.service';
import { 
  getConversationsFromLocal, 
  saveConversationToLocal,
  getUserFromCache,
  saveUserToCache,
  initDatabase 
} from '../../services/storage.service';
import { ConversationItem } from '../../components/ConversationItem';
import { UserSearch } from '../../components/UserSearch';
import { scheduleLocalNotification } from '../../services/notification.service';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { getTime, toDate } from '../../utils/dateFormat';

export default function ChatsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const previousConversationsRef = useRef<Conversation[]>([]);

  // Helper function: Get user with cache-first strategy
  const getUserWithCache = async (userId: string): Promise<string> => {
    // 1. Try cache first (instant!)
    const cachedUser = await getUserFromCache(userId);
    if (cachedUser) {
      return cachedUser.displayName;
    }

    // 2. If not in cache, fetch from Firestore
    const userData = await getUserData(userId);
    if (userData) {
      // Save to cache for next time
      await saveUserToCache({
        ...userData,
        lastSeen: toDate(userData.lastSeen)
      });
      return userData.displayName;
    }

    return 'Unknown User';
  };

  // Initialize database on mount
  useEffect(() => {
    initDatabase();
  }, []);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // Load conversations from cache FIRST (instant, works offline)
    const loadConversations = async () => {
      console.log('📦 Loading conversations from cache...');
      const cachedConvos = await getConversationsFromLocal();
      if (isMounted && cachedConvos.length > 0) {
        console.log(`✅ Loaded ${cachedConvos.length} cached conversations`);
        setConversations(cachedConvos);
        setLoading(false);
        
        // Load user names for cached conversations (cache-first!)
        const names: Record<string, string> = {};
        const userFetchPromises = cachedConvos
          .filter(convo => !convo.isGroup)
          .map(async (convo) => {
            const otherUserId = convo.participants.find(id => id !== user.uid);
            if (otherUserId) {
              names[otherUserId] = await getUserWithCache(otherUserId);
            }
          });
        await Promise.all(userFetchPromises);
        if (isMounted) {
          setUserNames(names);
        }
      }
    };

    loadConversations();

    // Subscribe to conversations from Firestore for real-time updates
    const unsubscribe = subscribeToConversations(user.uid, async (convos) => {
      if (!isMounted) return;
      // Check for new messages and trigger notifications
      if (previousConversationsRef.current.length > 0) {
        for (const convo of convos) {
          const prevConvo = previousConversationsRef.current.find(c => c.id === convo.id);
          
          // Check if there's a new message
          if (convo.lastMessage && 
              convo.lastMessage.senderId !== user.uid &&
              (!prevConvo?.lastMessage || 
               getTime(prevConvo.lastMessage.timestamp) < getTime(convo.lastMessage.timestamp))) {
            
            // Get sender name
            let senderName = 'Someone';
            if (convo.isGroup) {
              senderName = `${convo.groupName || 'Group'}`;
            } else {
              const otherUserId = convo.participants.find(id => id !== user.uid);
              if (otherUserId) {
                const userData = await getUserData(otherUserId);
                senderName = userData?.displayName || 'Someone';
              }
            }
            
            // Send notification (works in foreground & background)
            console.log('📬 New message from:', senderName);
            console.log('🔔 Sending notification...');
            await scheduleLocalNotification(
              senderName,
              convo.lastMessage.text,
              { conversationId: convo.id, type: 'message' }
            );
          }
        }
      }
      
      // Fetch user names for all conversations IN PARALLEL (cache-first!)
      const names: Record<string, string> = {};
      const userFetchPromises = convos
        .filter(convo => !convo.isGroup)
        .map(async (convo) => {
          const otherUserId = convo.participants.find(id => id !== user.uid);
          if (otherUserId && !names[otherUserId]) {
            names[otherUserId] = await getUserWithCache(otherUserId);
          }
        });
      
      // Wait for all user data to load in parallel (much faster!)
      await Promise.all(userFetchPromises);
      
      // Save conversations to SQLite cache
      console.log('💾 Saving conversations to cache...');
      for (const convo of convos) {
        try {
          await saveConversationToLocal(convo);
        } catch (error) {
          console.error('Error caching conversation:', error);
        }
      }
      
      // Update state AFTER names are loaded to prevent "Loading..." flash
      setUserNames(names);
      setConversations(convos);
      setLoading(false);
      
      // Update previous conversations for next check
      previousConversationsRef.current = convos;
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [user]);

  const handleConversationPress = useCallback((conversation: Conversation) => {
    // Navigate to chat screen (will be implemented in PR #4)
    router.push(`/chat/${conversation.id}`);
  }, [router]);

  const handleUserSelect = async (selectedUser: User) => {
    if (!user) return;

    try {
      setLoading(true);
      const conversationId = await getOrCreateConversation(user.uid, selectedUser.uid);
      router.push(`/chat/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversationItem = useCallback(({ item }: { item: Conversation }) => {
    const otherUserId = item.participants.find(id => id !== user?.uid);
    const otherUserName = otherUserId ? userNames[otherUserId] : undefined;

    return (
      <ConversationItem
        conversation={item}
        currentUserId={user?.uid || ''}
        otherUserName={otherUserName}
        onPress={() => handleConversationPress(item)}
      />
    );
  }, [user?.uid, userNames, handleConversationPress]);

  const renderEmptyState = () => (
    <EmptyState
      icon="💬"
      title="No conversations yet"
      message="Tap the + button above to start a new chat or create a group"
    />
  );

  if (loading && conversations.length === 0) {
    return <LoadingSpinner message="Loading conversations..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Chats</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.groupButton}
              onPress={() => router.push('/group/create')}
            >
              <Text style={styles.groupButtonText}>👥 Group</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.newChatButton}
              onPress={() => setSearchVisible(true)}
            >
              <Text style={styles.newChatButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Conversation List */}
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={renderConversationItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={conversations.length === 0 ? styles.emptyList : undefined}
        />

        {/* User Search Modal */}
        <UserSearch
          visible={searchVisible}
          currentUserId={user?.uid || ''}
          onClose={() => setSearchVisible(false)}
          onUserSelect={handleUserSelect}
        />

        {/* Floating Action Button (FAB) */}
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSearchVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.fabIcon}>✏️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primary, // Changed to teal
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primary, // Changed to teal
    minHeight: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.white,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  groupButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  groupButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    color: Colors.primary, // Changed to teal
    fontSize: 28,
    fontWeight: '300',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
  },
});

