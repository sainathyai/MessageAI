import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { getUserData } from '../services/auth.service';
import { Avatar } from './Avatar';
import { User } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { Colors } from '../constants';

interface GroupMembersModalProps {
  visible: boolean;
  onClose: () => void;
  participantIds: string[];
  currentUserId: string;
  onMemberPress: (userId: string) => void;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  visible,
  onClose,
  participantIds,
  currentUserId,
  onMemberPress,
}) => {
  const { theme, isDark } = useTheme();
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      loadMembers();
    }
  }, [visible, participantIds]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const memberPromises = participantIds.map(async (userId) => {
        const userData = await getUserData(userId);
        return userData;
      });

      const loadedMembers = (await Promise.all(memberPromises)).filter(
        (member): member is User => member !== null
      );

      // Sort: current user first, then by name
      loadedMembers.sort((a, b) => {
        if (a.uid === currentUserId) return -1;
        if (b.uid === currentUserId) return 1;
        return a.displayName.localeCompare(b.displayName);
      });

      setMembers(loadedMembers);
    } catch (error) {
      console.error('Error loading group members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberPress = (userId: string) => {
    if (userId !== currentUserId) {
      onMemberPress(userId);
      onClose();
    }
  };

  const renderMember = ({ item }: { item: User }) => {
    const isCurrentUser = item.uid === currentUserId;

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => handleMemberPress(item.uid)}
        disabled={isCurrentUser}
      >
        <Avatar name={item.displayName} size="medium" isOnline={item.isOnline} />
        
        <View style={styles.memberInfo}>
          <View style={styles.memberNameRow}>
            <Text style={[styles.memberName, { color: theme.textPrimary }]}>
              {item.displayName}
            </Text>
            {isCurrentUser && (
              <Text style={[styles.youBadge, { color: Colors.primary, backgroundColor: theme.border }]}>You</Text>
            )}
          </View>
          <Text style={[styles.memberEmail, { color: theme.textSecondary }]}>{item.email}</Text>
        </View>

        {!isCurrentUser && (
          <Text style={styles.chatIcon}>💬</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Group Members</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Member Count */}
          <View style={styles.countContainer}>
            <Text style={[styles.countText, { color: theme.textSecondary }]}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>

          {/* Members List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={(item) => item.uid}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.border }]} />}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
  },
  countContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 14,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  youBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  memberEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  chatIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  separator: {
    height: 1,
    marginLeft: 62, // Align with text (avatar width + margin)
  },
});

