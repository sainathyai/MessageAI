import { Tabs } from 'expo-router';
import { View, Platform, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRef } from 'react';
import { COLORS } from '../../utils/constants';
import { Colors } from '../../constants'; // New teal theme

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  // Capture initial bottom inset ONCE using ref (never changes)
  const fixedBottomInsetRef = useRef<number | null>(null);
  if (fixedBottomInsetRef.current === null) {
    fixedBottomInsetRef.current = Platform.OS === 'android' ? Math.max(insets.bottom, 20) : 0;
  }

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary, // Teal accent
          tabBarInactiveTintColor: Colors.textSecondary, // Gray for inactive
          tabBarStyle: {
            backgroundColor: Colors.white,
            borderTopColor: Colors.divider,
            borderTopWidth: 1,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 20 : 12,
            height: Platform.OS === 'ios' ? 85 : 65,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginBottom: 4,
          },
          headerStyle: {
            backgroundColor: Colors.primary, // Teal header
          },
          headerTintColor: Colors.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarLabel: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              <View style={styles.iconContainer}>
                <View style={[styles.chatBubble, { borderColor: color }]}>
                  <View style={[styles.chatDots, { backgroundColor: color }]} />
                </View>
              </View>
            </View>
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              <View style={[styles.profileCircle, { borderColor: color }]}>
                <View style={[styles.profileHead, { backgroundColor: color }]} />
                <View style={[styles.profileBody, { backgroundColor: color }]} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
    
    {/* Blue footer below tabs */}
    {Platform.OS === 'android' && (
      <View style={[styles.bottomSafeArea, { height: fixedBottomInsetRef.current }]} />
    )}
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary, // Teal background
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    width: 24,
    height: 20,
    borderWidth: 2.5,
    borderRadius: 12,
    borderBottomLeftRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatDots: {
    width: 12,
    height: 3,
    borderRadius: 1.5,
  },
  profileCircle: {
    width: 24,
    height: 24,
    borderWidth: 2.5,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  profileHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 2,
  },
  profileBody: {
    width: 14,
    height: 8,
    borderRadius: 7,
    marginTop: 1,
  },
  bottomSafeArea: {
    backgroundColor: Colors.primary, // Teal footer
  },
});

