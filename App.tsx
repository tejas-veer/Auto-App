import 'react-native-gesture-handler';
import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { GameScreen } from './src/screens/GameScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { COLORS } from './src/constants/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: COLORS.surface,
                borderTopColor: COLORS.primary + '44',
              },
              tabBarActiveTintColor: COLORS.primary,
              tabBarInactiveTintColor: COLORS.textMuted,
            }}
          >
            <Tab.Screen
              name="Game"
              component={GameScreen}
              options={{
                tabBarLabel: 'Restaurant',
                tabBarIcon: () => <Text style={{ fontSize: 22 }}>🍽️</Text>,
              }}
            />
            <Tab.Screen
              name="Shop"
              component={ShopScreen}
              options={{
                tabBarLabel: 'Catalog',
                tabBarIcon: () => <Text style={{ fontSize: 22 }}>🏪</Text>,
              }}
            />
            <Tab.Screen
              name="Stats"
              component={StatsScreen}
              options={{
                tabBarLabel: 'Stats',
                tabBarIcon: () => <Text style={{ fontSize: 22 }}>📊</Text>,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
