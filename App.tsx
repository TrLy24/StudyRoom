import React, { useEffect } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './src/screens/LoginScreen';
import BrowseRoomsScreen from './src/screens/BrowseRoomsScreen';
import MyBookingsScreen from './src/screens/MyBookingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RoomDetailScreen from './src/screens/RoomDetailScreen';
import { RootStackParamList } from './src/types';
import { colors, radius } from './src/theme';
import { getAndroidChannel, requestNotificationPermission } from './src/notifications';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient();

type TabIconProps = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFilled: keyof typeof Ionicons.glyphMap;
  color: string;
  size: number;
  focused: boolean;
};

function TabIcon({ name, icon, iconFilled, color, size, focused }: TabIconProps) {
  return (
    <View style={tabStyles.iconWrap}>
      {focused && <View style={tabStyles.activePill} />}
      <Ionicons name={focused ? iconFilled : icon} size={size} color={color} />
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.3,
        },
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          elevation: 20,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarIcon: ({ color, size, focused }) => {
          const map: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
            'Tìm phòng': ['business-outline', 'business'],
            'Lịch đặt': ['calendar-outline', 'calendar'],
            'Hồ sơ': ['person-outline', 'person'],
          };
          const [outline, filled] = map[route.name] ?? ['help-outline', 'help'];
          return (
            <TabIcon
              name={route.name}
              icon={outline}
              iconFilled={filled}
              color={color}
              size={22}
              focused={focused}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Tìm phòng" component={BrowseRoomsScreen} />
      <Tab.Screen name="Lịch đặt" component={MyBookingsScreen} />
      <Tab.Screen name="Hồ sơ" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    getAndroidChannel();
    requestNotificationPermission();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.bgCard },
              headerTintColor: colors.primary,
              headerTitleStyle: { fontWeight: '700', color: colors.textPrimary },
              headerShadowVisible: false,
            }}
          >
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Tabs"
              component={Tabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RoomDetail"
              component={RoomDetailScreen}
              options={{
                title: 'Chi tiết phòng',
                headerBackTitle: 'Quay lại',
                headerStyle: { backgroundColor: colors.bg },
                headerTintColor: colors.primary,
                headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 32,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    shadowColor: colors.primary,
    shadowOpacity: 0.8,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
});