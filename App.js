import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Home from './components/Home';
import Gameboard from './components/Gameboard';
import Scoreboard from './components/Scoreboard';
import styles from './style/style';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer >
      <Tab.Navigator
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Gameboard') {
              iconName = focused ? 'gamepad-variant' : 'gamepad-variant-outline';
            } else if (route.name === 'Scoreboard') {
              iconName = focused ? 'trophy' : 'trophy-outline';
            }

            return <MaterialCommunityIcons name={iconName} size={size} color={styles.icon.color} />;
          },
          tabBarActiveTintColor: styles.tabBarActive.color,
          tabBarInactiveTintColor: styles.tabBarInactive.color,
        })}
      >
        <Tab.Screen style={styles.text} name="Home" component={Home} />
        <Tab.Screen name="Gameboard" component={Gameboard} />
        <Tab.Screen name="Scoreboard" component={Scoreboard} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
