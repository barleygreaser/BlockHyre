import { Tabs, withLayoutContext } from 'expo-router';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { Platform, View } from 'react-native';
import { Search, Wrench, MessageCircle, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// Use standard Tabs for Web (fallback/server) and NativeTabs for Mobile
const NativeTabs = Platform.OS === 'ios' || Platform.OS === 'android'
  ? withLayoutContext(createNativeBottomTabNavigator().Navigator)
  : null;

export default function TabLayout() {
  // --- WEB FALLBACK / Node.js Server SSR ---
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
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
    <NativeTabs
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
      <NativeTabs.Screen
        name="index"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }: { focused: boolean }) =>
            Platform.OS === 'ios' ? ({
              sfSymbol: focused ? 'house.fill' : 'house',
            } as any) : undefined,
        }}
      />
      <NativeTabs.Screen
        name="rentals"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ focused }: { focused: boolean }) =>
            Platform.OS === 'ios' ? ({
              sfSymbol: focused ? 'square.grid.2x2.fill' : 'square.grid.2x2',
            } as any) : undefined,
        }}
      />
      <NativeTabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ focused }: { focused: boolean }) =>
            Platform.OS === 'ios' ? ({
              sfSymbol: focused ? 'message.fill' : 'message',
            } as any) : undefined,
        }}
      />
      <NativeTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }: { focused: boolean }) =>
            Platform.OS === 'ios' ? ({
              sfSymbol: focused ? 'person.fill' : 'person',
            } as any) : undefined,
        }}
      />
    </NativeTabs>
  );
}
