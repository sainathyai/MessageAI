import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants';
import { useTheme } from '../contexts/ThemeContext';

interface MessageContextMenuProps {
  visible: boolean;
  onClose: () => void;
  onTranslate: () => void;
  onCulturalContext: () => void;
  onSlangDetection: () => void;
  onTranscribe?: () => void; // Only for voice messages
  position: { x: number; y: number };
  isOwnMessage: boolean;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  visible,
  onClose,
  onTranslate,
  onCulturalContext,
  onSlangDetection,
  onTranscribe,
  position,
  isOwnMessage,
}) => {
  const { theme, isDark } = useTheme();
  const { height: screenHeight } = Dimensions.get('window');
  
  // Calculate menu position (above or below the message)
  const menuHeight = 180; // Same height regardless (transcribe replaces translate)
  const showAbove = position.y > screenHeight / 2;

  const menuStyle = {
    position: 'absolute' as const,
    top: showAbove ? position.y - menuHeight - 10 : position.y + 10,
    left: isOwnMessage ? undefined : position.x,
    right: isOwnMessage ? 20 : undefined,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.3)' }]}>
          <TouchableWithoutFeedback>
            <View style={[styles.menu, menuStyle]}>
              {/* Transcribe - Only for voice messages (replaces Translate) */}
              {onTranscribe ? (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onTranscribe();
                      onClose();
                    }}
                  >
                    <Text style={styles.menuIcon}>🎯</Text>
                    <Text style={[styles.menuText, { color: theme.textPrimary }]}>Transcribe</Text>
                  </TouchableOpacity>

                  <View style={[styles.separator, { backgroundColor: theme.border }]} />
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => {
                      onTranslate();
                      onClose();
                    }}
                  >
                    <Text style={styles.menuIcon}>🌐</Text>
                    <Text style={[styles.menuText, { color: theme.textPrimary }]}>Translate</Text>
                  </TouchableOpacity>

                  <View style={[styles.separator, { backgroundColor: theme.border }]} />
                </>
              )}

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onCulturalContext();
                  onClose();
                }}
              >
                <Text style={styles.menuIcon}>🌍</Text>
                <Text style={[styles.menuText, { color: theme.textPrimary }]}>Cultural Context</Text>
              </TouchableOpacity>

              <View style={[styles.separator, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  onSlangDetection();
                  onClose();
                }}
              >
                <Text style={styles.menuIcon}>💬</Text>
                <Text style={[styles.menuText, { color: theme.textPrimary }]}>Explain Slang</Text>
              </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuText: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontSize: 16,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.divider,
    marginHorizontal: Spacing.md,
  },
});

