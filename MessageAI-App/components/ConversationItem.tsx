import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../types';
import { COLORS } from '../utils/constants';
import { formatConversationTime } from '../utils/dateFormat';
import { Avatar } from './Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  otherUserName?: string;
  onPress: () => void;
}

const ConversationItemComponent: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  otherUserName,
  onPress
}) => {
  // Check if conversation is unread
  const isUnread = (() => {
    if (!conversation.lastMessage) return false;
    if (conversation.lastMessage.senderId === currentUserId) return false;
    
    const lastReadTimestamp = conversation.readStatus?.[currentUserId];
    if (!lastReadTimestamp) return true;
    
    // Convert to timestamps for comparison
    const lastReadTime = lastReadTimestamp instanceof Date 
      ? lastReadTimestamp.getTime() 
      : (typeof lastReadTimestamp === 'object' && 'toDate' in lastReadTimestamp)
        ? lastReadTimestamp.toDate().getTime()
        : new Date(lastReadTimestamp).getTime();
    
    const lastMessageTime = conversation.lastMessage.timestamp instanceof Date
      ? conversation.lastMessage.timestamp.getTime()
      : new Date(conversation.lastMessage.timestamp).getTime();
    
    return lastReadTime < lastMessageTime;
  })();

  const displayName = conversation.isGroup 
    ? conversation.groupName || 'Group Chat'
    : otherUserName || 'Loading...';

  const lastMessageText = conversation.lastMessage?.text || 'No messages yet';
  const timeText = conversation.lastMessage?.timestamp 
    ? formatConversationTime(conversation.lastMessage.timestamp)
    : '';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        <Avatar 
          name={displayName}
          size="medium"
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, isUnread && styles.boldText]}>
            {displayName}
          </Text>
          <Text style={styles.time}>{timeText}</Text>
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
  avatarContainer: {
    marginRight: 12,
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

// Memoize to prevent flicker when readStatus updates
export const ConversationItem = React.memo(
  ConversationItemComponent,
  (prevProps, nextProps) => {
    // Don't re-render if these key properties haven't changed
    const prevConv = prevProps.conversation;
    const nextConv = nextProps.conversation;
    
    // Check if the important properties are the same
    const sameId = prevConv.id === nextConv.id;
    const sameLastMessage = prevConv.lastMessage?.text === nextConv.lastMessage?.text &&
      prevConv.lastMessage?.timestamp?.getTime() === nextConv.lastMessage?.timestamp?.getTime();
    
    // Compare readStatus timestamps properly (handle Date objects and Firestore Timestamps)
    const prevReadStatus = prevConv.readStatus?.[prevProps.currentUserId];
    const nextReadStatus = nextConv.readStatus?.[nextProps.currentUserId];
    
    let sameReadStatus = false;
    if (prevReadStatus === nextReadStatus) {
      sameReadStatus = true;
    } else if (prevReadStatus && nextReadStatus) {
      // Convert to timestamps for comparison
      const prevTime = prevReadStatus instanceof Date 
        ? prevReadStatus.getTime()
        : (typeof prevReadStatus === 'object' && 'toDate' in prevReadStatus)
          ? prevReadStatus.toDate().getTime()
          : new Date(prevReadStatus).getTime();
      
      const nextTime = nextReadStatus instanceof Date
        ? nextReadStatus.getTime()
        : (typeof nextReadStatus === 'object' && 'toDate' in nextReadStatus)
          ? nextReadStatus.toDate().getTime()
          : new Date(nextReadStatus).getTime();
      
      // Consider same if within 1 second (to account for minor timestamp differences)
      sameReadStatus = Math.abs(prevTime - nextTime) < 1000;
    }
    
    const sameName = prevProps.otherUserName === nextProps.otherUserName;
    
    // Return true if nothing changed (skip re-render)
    return sameId && sameLastMessage && sameReadStatus && sameName;
  }
);
