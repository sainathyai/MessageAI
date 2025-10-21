import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../types';
import { COLORS } from '../utils/constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  otherUserName?: string;
  onPress: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  otherUserName,
  onPress
}) => {
  const isUnread = conversation.lastMessage && 
    conversation.lastMessage.senderId !== currentUserId &&
    (!conversation.readStatus[currentUserId] || 
     conversation.readStatus[currentUserId] < conversation.lastMessage.timestamp);

  const displayName = conversation.isGroup 
    ? conversation.groupName || 'Group Chat'
    : otherUserName || 'Unknown User';

  const lastMessageText = conversation.lastMessage?.text || 'No messages yet';
  const timeAgo = conversation.lastMessage?.timestamp 
    ? dayjs(conversation.lastMessage.timestamp).fromNow()
    : '';

  // Get initial for avatar
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: conversation.isGroup ? COLORS.SECONDARY : COLORS.PRIMARY }]}>
        <Text style={styles.avatarText}>{conversation.isGroup ? '👥' : initial}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, isUnread && styles.boldText]}>
            {displayName}
          </Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        
        <Text 
          style={[styles.lastMessage, isUnread && styles.boldText]} 
          numberOfLines={1}
        >
          {lastMessageText}
        </Text>
      </View>

      {/* Unread indicator */}
      {isUnread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.LIGHT_GRAY,
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    color: COLORS.TEXT_PRIMARY,
  },
  time: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
  },
  lastMessage: {
    fontSize: 14,
    color: COLORS.TEXT_SECONDARY,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.PRIMARY,
    marginLeft: 8,
  },
});

