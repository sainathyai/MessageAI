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

interface GroupMembersModalProps {
  visible: boolean;
  onClose: () => void;
  participantIds: string[];
  currentUserId: string;
  onMemberPress: (userId: string) => void;
}

interface MemberInfo extends User {
  isOnline?: boolean;
}

export const GroupMembersModal: React.FC<GroupMembersModalProps> = ({
  visible,
  onClose,
  participantIds,
  currentUserId,
  onMemberPress,
}) => {
  const [members, setMembers] = useState<MemberInfo[]>([]);
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
        (member): member is MemberInfo => member !== null
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

  const renderMember = ({ item }: { item: MemberInfo }) => {
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
            <Text style={styles.memberName}>
              {item.displayName}
            </Text>
            {isCurrentUser && (
              <Text style={styles.youBadge}>You</Text>
            )}
          </View>
          <Text style={styles.memberEmail}>{item.email}</Text>
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
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Group Members</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Member Count */}
          <View style={styles.countContainer}>
            <Text style={styles.countText}>
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </Text>
          </View>

          {/* Members List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            </View>
          ) : (
            <FlatList
              data={members}
              renderItem={renderMember}
              keyExtractor={(item) => item.uid}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.WHITE,
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
    borderBottomColor: COLORS.LIGHT_GRAY,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.GRAY,
  },
  countContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  countText: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
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
    color: COLORS.TEXT_PRIMARY,
  },
  youBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.PRIMARY,
    backgroundColor: COLORS.LIGHT_GRAY,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  memberEmail: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
  chatIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.LIGHT_GRAY,
    marginLeft: 62, // Align with text (avatar width + margin)
  },
});

