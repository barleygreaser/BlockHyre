import { withLayoutContext } from 'expo-router';
import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import { Search, Wrench, MessageCircle, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const NativeTabs = withLayoutContext(createNativeBottomTabNavigator().Navigator);

export default function TabLayout() {
  return (
    <NativeTabs
      translucent={true}
      hapticFeedbackEnabled={true}
      screenOptions={{
        tabBarActiveTintColor: '#FF6700',
      }}
      screenListeners={{
        tabPress: () => {
          // Native tabs handle haptics by default on iOS, but we can ensure consistency
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
          tabBarIcon: ({ color, focused }) =>
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
      <NativeTabs.Screen
        name="rentals"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) =>
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
      <NativeTabs.Screen
        name="messages"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color, focused }) =>
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
      <NativeTabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) =>
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
    </NativeTabs>
  );
}
