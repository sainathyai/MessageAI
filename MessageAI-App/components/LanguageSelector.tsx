/**
 * Language Selector Component
 * Allows users to select their preferred language for translations
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { getSupportedLanguages } from '../services/translation.service';
import { useTheme } from '../contexts/ThemeContext';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelect: (languageCode: string) => void;
  label?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelect,
  label = 'Select Language',
}) => {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const languages = getSupportedLanguages();
  const selectedLang = languages.find(l => l.code === selectedLanguage);

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onSelect(code);
    setModalVisible(false);
    setSearchQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.selector, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.selectorContent}>
          {label ? <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text> : null}
          <View style={styles.selectedValue}>
            <Text style={[styles.selectedText, { color: theme.textPrimary }]} numberOfLines={1}>
              {selectedLang ? selectedLang.nativeName : 'Select...'}
            </Text>
            <Text style={[styles.arrow, { color: theme.textTertiary }]}>▼</Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
                <View style={[styles.modalHeader, { borderBottomColor: theme.divider }]}>
                  <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{label}</Text>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={[styles.closeButton, { backgroundColor: theme.surfaceSecondary }]}
                  >
                    <Text style={[styles.closeButtonText, { color: theme.textSecondary }]}>✕</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={[styles.searchInput, { backgroundColor: theme.surfaceSecondary, color: theme.textPrimary }]}
                  placeholder="Search languages..."
                  placeholderTextColor={theme.textTertiary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />

                <FlatList
                  data={filteredLanguages}
                  keyExtractor={item => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.languageItem,
                        item.code === selectedLanguage && { backgroundColor: theme.primaryFaded },
                      ]}
                      onPress={() => handleSelect(item.code)}
                    >
                      <View style={styles.languageInfo}>
                        <Text style={[styles.languageNative, { color: theme.textPrimary }]}>{item.nativeName}</Text>
                        <Text style={[styles.languageName, { color: theme.textSecondary }]}>{item.name}</Text>
                      </View>
                      {item.code === selectedLanguage && (
                        <Text style={[styles.checkmark, { color: theme.primary }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: theme.divider }]} />}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selector: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    // backgroundColor and borderColor handled by theme
  },
  selectorContent: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    // color handled by theme
  },
  selectedValue: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedText: {
    fontSize: 15,
    flex: 1,
    // color handled by theme
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
    // color handled by theme
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    // backgroundColor handled by theme
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
    // backgroundColor handled by theme
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    // borderBottomColor handled by theme
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    // color handled by theme
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    // backgroundColor handled by theme
  },
  closeButtonText: {
    fontSize: 18,
    // color handled by theme
  },
  searchInput: {
    margin: 20,
    marginTop: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    // backgroundColor and color handled by theme
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  languageInfo: {
    flex: 1,
  },
  languageNative: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    // color handled by theme
  },
  languageName: {
    fontSize: 13,
    // color handled by theme
  },
  checkmark: {
    fontSize: 20,
    marginLeft: 12,
    // color handled by theme
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
    // backgroundColor handled by theme
  },
});

export default LanguageSelector;

