import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Conversation, User } from '../../types';
import { COLORS } from '../../utils/constants';
import { 
  subscribeToConversations, 
  getOrCreateConversation 
} from '../../services/conversation.service';
import { getUserData } from '../../services/auth.service';
import { ConversationItem } from '../../components/ConversationItem';
import { UserSearch } from '../../components/UserSearch';

export default function ChatsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchVisible, setSearchVisible] = useState(false);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;

    // Subscribe to conversations
    const unsubscribe = subscribeToConversations(user.uid, async (convos) => {
      setConversations(convos);
      setLoading(false);

      // Fetch user names for all conversations
      const names: Record<string, string> = {};
      for (const convo of convos) {
        if (!convo.isGroup) {
          const otherUserId = convo.participants.find(id => id !== user.uid);
          if (otherUserId && !names[otherUserId]) {
            const userData = await getUserData(otherUserId);
            if (userData) {
              names[otherUserId] = userData.displayName;
            }
          }
        }
      }
      setUserNames(names);
    });

    return () => unsubscribe();
  }, [user]);

  const handleConversationPress = (conversation: Conversation) => {
    // Navigate to chat screen (will be implemented in PR #4)
    router.push(`/chat/${conversation.id}`);
  };

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

  const renderConversationItem = ({ item }: { item: Conversation }) => {
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
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptySubtitle}>
        Tap the + button to start a new chat
      </Text>
    </View>
  );

  if (loading && conversations.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  return (
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingTop: 50, // Account for status bar
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
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
    backgroundColor: COLORS.LIGHT_BLUE,
  },
  groupButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newChatButtonText: {
    color: COLORS.WHITE,
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
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

