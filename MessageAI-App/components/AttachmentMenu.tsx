import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants';
import { useTheme } from '../contexts/ThemeContext';
import * as Haptics from 'expo-haptics';

interface MenuItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  disabled?: boolean;
}

interface AttachmentMenuProps {
  visible: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  visible,
  onClose,
  menuItems,
}) => {
  const { theme, isDark } = useTheme();

  const handleItemPress = (item: MenuItem) => {
    if (!item.disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onClose();
      // Small delay to allow modal to close smoothly
      setTimeout(() => {
        item.onPress();
      }, 100);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[
          styles.menuContainer,
          { backgroundColor: theme.surface }
        ]}>
          <TouchableOpacity activeOpacity={1}>
            {/* Header */}
            <View style={[
              styles.header,
              { borderBottomColor: theme.border }
            ]}>
              <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
                Add Attachment
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Menu Items Grid */}
            <ScrollView
              contentContainerStyle={styles.menuContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.menuGrid}>
                {menuItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.menuItem,
                      item.disabled && styles.menuItemDisabled
                    ]}
                    onPress={() => handleItemPress(item)}
                    disabled={item.disabled}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.iconContainer,
                      { backgroundColor: item.disabled ? theme.border : `${item.color}20` }
                    ]}>
                      <Ionicons
                        name={item.icon}
                        size={28}
                        color={item.disabled ? theme.textTertiary : item.color}
                      />
                    </View>
                    <Text style={[
                      styles.menuItemLabel,
                      { color: item.disabled ? theme.textTertiary : theme.textPrimary }
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: Platform.OS === 'android' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    padding: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  menuItem: {
    width: '25%',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

