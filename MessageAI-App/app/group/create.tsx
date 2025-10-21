import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { createGroup } from '../../services/group.service';
import { searchUsers } from '../../services/conversation.service';
import { COLORS } from '../../utils/constants';

interface User {
  uid: string;
  displayName: string;
  email: string;
}

export default function CreateGroupScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (term.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const users = await searchUsers(term, user!.uid);
      setSearchResults(users as User[]);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const toggleUserSelection = (selectedUser: User) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.uid === selectedUser.uid);
      if (isSelected) {
        return prev.filter(u => u.uid !== selectedUser.uid);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedUsers.length < 2) {
      Alert.alert('Error', 'Please select at least 2 members to create a group');
      return;
    }

    try {
      setLoading(true);
      const participantIds = selectedUsers.map(u => u.uid);
      const groupId = await createGroup(groupName, participantIds, user!.uid);
      
      Alert.alert('Success', 'Group created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            router.replace(`/chat/${groupId}`);
          }
        }
      ]);
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Error', 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResult = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.some(u => u.uid === item.uid);
    
    return (
      <TouchableOpacity
        style={[styles.userItem, isSelected && styles.userItemSelected]}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.displayName?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.displayName}</Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSelectedUser = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.selectedChip}
      onPress={() => toggleUserSelection(item)}
    >
      <Text style={styles.selectedChipText}>{item.displayName}</Text>
      <Text style={styles.selectedChipRemove}> ×</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Group</Text>
          <TouchableOpacity
            onPress={handleCreateGroup}
            disabled={loading || !groupName.trim() || selectedUsers.length < 2}
            style={styles.createButton}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.PRIMARY} />
            ) : (
              <Text
                style={[
                  styles.createButtonText,
                  (!groupName.trim() || selectedUsers.length < 2) && styles.createButtonTextDisabled
                ]}
              >
                Create
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Group Name Input */}
        <View style={styles.groupNameSection}>
          <TextInput
            style={styles.groupNameInput}
            placeholder="Group Name"
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />
        </View>

        {/* Selected Members */}
        {selectedUsers.length > 0 && (
          <View style={styles.selectedSection}>
            <Text style={styles.sectionTitle}>
              Selected ({selectedUsers.length})
            </Text>
            <FlatList
              horizontal
              data={selectedUsers}
              renderItem={renderSelectedUser}
              keyExtractor={item => item.uid}
              showsHorizontalScrollIndicator={false}
              style={styles.selectedList}
            />
          </View>
        )}

        {/* Search Input */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email..."
            placeholderTextColor={COLORS.TEXT_SECONDARY}
            value={searchTerm}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
          {searching && <ActivityIndicator style={styles.searchLoader} />}
        </View>

        {/* Search Results */}
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={item => item.uid}
          style={styles.resultsList}
          ListEmptyComponent={
            searchTerm.length >= 2 && !searching ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No users found</Text>
              </View>
            ) : searchTerm.length < 2 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  Type at least 2 characters to search
                </Text>
              </View>
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  createButton: {
    padding: 4,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.PRIMARY,
  },
  createButtonTextDisabled: {
    color: COLORS.TEXT_SECONDARY,
  },
  groupNameSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  groupNameInput: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  selectedSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 8,
  },
  selectedList: {
    flexGrow: 0,
  },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedChipText: {
    fontSize: 14,
    color: COLORS.WHITE,
  },
  selectedChipRemove: {
    fontSize: 18,
    color: COLORS.WHITE,
    marginLeft: 4,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
    padding: 12,
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.LIGHT_GRAY,
  },
  searchLoader: {
    marginLeft: 8,
  },
  resultsList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  userItemSelected: {
    backgroundColor: COLORS.LIGHT_BLUE,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.WHITE,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.SUCCESS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
  },
});


