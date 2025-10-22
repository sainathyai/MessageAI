/**
 * AI Context Menu Component
 * Context menu for AI-powered features on messages
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback } from 'react-native';

export interface AIMenuAction {
  id: string;
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}

interface AIContextMenuProps {
  visible: boolean;
  onClose: () => void;
  actions: AIMenuAction[];
  position?: { x: number; y: number };
}

export const AIContextMenu: React.FC<AIContextMenuProps> = ({
  visible,
  onClose,
  actions,
  position,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.menu,
                position && {
                  position: 'absolute',
                  top: position.y,
                  left: position.x,
                },
              ]}
            >
              <View style={styles.header}>
                <Text style={styles.headerIcon}>🤖</Text>
                <Text style={styles.headerText}>AI Features</Text>
              </View>
              
              {actions.map((action) => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.action, action.disabled && styles.actionDisabled]}
                  onPress={() => {
                    if (!action.disabled) {
                      action.onPress();
                      onClose();
                    }
                  }}
                  disabled={action.disabled}
                >
                  <Text style={styles.actionIcon}>{action.icon}</Text>
                  <Text
                    style={[styles.actionText, action.disabled && styles.actionTextDisabled]}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: 'white',
    borderRadius: 12,
    minWidth: 220,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  actionDisabled: {
    opacity: 0.4,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  actionText: {
    fontSize: 15,
    color: '#333',
    flex: 1,
  },
  actionTextDisabled: {
    color: '#999',
  },
});

export default AIContextMenu;

