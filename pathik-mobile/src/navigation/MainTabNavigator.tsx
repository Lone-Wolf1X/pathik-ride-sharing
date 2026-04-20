import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CustomerDashboard from '../screens/main/CustomerDashboard';
import RiderDashboard from '../screens/main/RiderDashboard';
import RatingsHistoryScreen from '../screens/main/RatingsHistoryScreen';
import RoleSwitcher from '../components/common/RoleSwitcher';
import { Theme } from '../theme/theme';
import { Home, User, History } from 'lucide-react-native';

const Tab = createBottomTabNavigator();

// Placeholder screens
const ProfileScreen = () => <View style={styles.center}><Text>Profile</Text></View>;

export default function MainTabNavigator() {
  const [role, setRole] = useState<'customer' | 'rider'>('customer');

  return (
    <View style={styles.container}>
      <Tab.Navigator
        id="MainTabs"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Theme.colors.primary,
          tabBarInactiveTintColor: Theme.colors.textLight,
          tabBarStyle: {
            height: 90,
            paddingBottom: 30,
            paddingTop: 10,
            backgroundColor: Theme.colors.background,
            borderTopWidth: 1,
            borderTopColor: Theme.colors.border,
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={role === 'customer' ? CustomerDashboard : RiderDashboard}
          options={{
            tabBarIcon: ({ color }: { color: string }) => <Home size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="History"
          component={RatingsHistoryScreen}
          options={{
            tabBarIcon: ({ color }: { color: string }) => <History size={24} color={color} />,
          }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarIcon: ({ color }: { color: string }) => <User size={24} color={color} />,
          }}
        />
      </Tab.Navigator>


      {/* Floating Role Switcher on Dashboard */}
      <View style={styles.switcherContainer}>
        <RoleSwitcher currentRole={role} onRoleChange={(newRole) => setRole(newRole)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  switcherContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    zIndex: 100,
    alignItems: 'center',
  },
});
