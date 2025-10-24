import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { User } from '../types';
import { COLORS } from '../utils/constants';
import { searchUsers } from '../services/conversation.service';
import { useTheme } from '../contexts/ThemeContext';

interface UserSearchProps {
  visible: boolean;
  currentUserId: string;
  onClose: () => void;
  onUserSelect: (user: User) => void;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  visible,
  currentUserId,
  onClose,
  onUserSelect,
}) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(term, currentUserId);
      setUsers(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user: any) => {
    onUserSelect(user as User);
    setSearchTerm('');
    setUsers([]);
    onClose();
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const initial = item.displayName?.charAt(0).toUpperCase() || '?';
    
    return (
      <TouchableOpacity
        style={[styles.userItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
        onPress={() => handleUserSelect(item)}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={[styles.avatarText, { color: theme.textOnPrimary }]}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.textPrimary }]}>{item.displayName}</Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{item.email}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.divider }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={[styles.closeButtonText, { color: theme.primary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.textPrimary }]}>New Chat</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary }]}
            placeholder="Search by name or email..."
            placeholderTextColor={theme.textTertiary}
            value={searchTerm}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoFocus
          />
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : users.length > 0 ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.uid}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContainer}
          />
        ) : searchTerm.length >= 2 ? (
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No users found</Text>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Search for users by name or email
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor handled by theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    // borderBottomColor handled by theme
    paddingTop: 50, // Account for status bar
  },
  closeButton: {
    width: 60,
  },
  closeButtonText: {
    fontSize: 16,
    // color handled by theme
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    // color handled by theme
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    // backgroundColor and color handled by theme
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    // backgroundColor and borderColor handled by theme
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    // color handled by theme
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    // color handled by theme
  },
  userEmail: {
    fontSize: 14,
    // color handled by theme
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    // color handled by theme
  },
});

