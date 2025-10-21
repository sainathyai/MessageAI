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
        style={styles.userItem}
        onPress={() => handleUserSelect(item)}
      >
        <View style={[styles.avatar, { backgroundColor: COLORS.PRIMARY }]}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>New Chat</Text>
          <View style={styles.closeButton} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoFocus
          />
        </View>

        {/* Results */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
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
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
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
    backgroundColor: COLORS.WHITE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    paddingTop: 50, // Account for status bar
  },
  closeButton: {
    width: 60,
  },
  closeButtonText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    backgroundColor: COLORS.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
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
    color: COLORS.WHITE,
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

