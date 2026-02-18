import { Tabs, withLayoutContext } from 'expo-router';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { SymbolView } from 'expo-symbols';
import { Platform, View } from 'react-native';
import { Search, Wrench, MessageCircle, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Use standard Tabs for Web (fallback) and NativeTabs for Mobile
const NativeTabs = Platform.OS !== 'web'
  ? withLayoutContext(createNativeBottomTabNavigator().Navigator)
  : null;

export default function TabLayout() {
  // --- WEB FALLBACK ---
  if (Platform.OS === 'web') {
    return (
      <Tabs screenOptions={{ tabBarActiveTintColor: '#FF6700', headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{ title: 'Explore', tabBarIcon: ({ color }) => <Search size={22} color={color} /> }}
        />
        <Tabs.Screen
          name="rentals"
          options={{ title: 'Dashboard', tabBarIcon: ({ color }) => <Wrench size={22} color={color} /> }}
        />
        <Tabs.Screen
          name="messages"
          options={{ title: 'Inbox', tabBarIcon: ({ color }) => <MessageCircle size={22} color={color} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: 'Profile', tabBarIcon: ({ color }) => <User size={22} color={color} /> }}
        />
      </Tabs>
    );
  }

  // --- NATIVE MOBILE LAYOUT ---
  if (!NativeTabs) return <View />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF6700',
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'ios') {
            Haptics.selectionAsync();
          }
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) =>
            Platform.OS === 'ios' ? (
              <SymbolView
                name={focused ? 'house.fill' : 'house'}
                size={24}
                tintColor={color}
              />
            ) : (
              <Search size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="rentals"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) =>
            Platform.OS === 'ios' ? (
              <SymbolView
                name={focused ? 'square.grid.2x2.fill' : 'square.grid.2x2'}
                size={24}
                tintColor={color}
              />
            ) : (
              <Wrench size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) =>
            Platform.OS === 'ios' ? (
              <SymbolView
                name={focused ? 'message.fill' : 'message'}
                size={24}
                tintColor={color}
              />
            ) : (
              <MessageCircle size={24} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) =>
            Platform.OS === 'ios' ? (
              <SymbolView
                name={focused ? 'person.fill' : 'person'}
                size={24}
                tintColor={color}
              />
            ) : (
              <User size={24} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
