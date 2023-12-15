import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { FIREBASE_AUTH } from '../firebaseConfig';
import {StyleSheet, Text, View, Pressable, Button} from 'react-native';
import History from '../screens/History'; // Import your HistoryScreen
import FriendsQuestions from '../screens/FriendsQuestions';
import Login from '../screens/Login';
import UserScreen from '../screens/UserScreen';
import WhoKnowsWho from '../screens/WhoKnowsWho';

const Tab = createBottomTabNavigator();

export default function NavBar() {
  return (
    <Tab.Navigator
      initialRouteName="User"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'History') {
            iconName = focused ? 'history' : 'history';
            return <MaterialIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'FriendsQuestions') {
            iconName = focused ? 'progress-question' : 'progress-question';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'User') {
            iconName = focused ? 'user-astronaut' : 'user-astronaut';
            return <FontAwesome5 name={iconName} size={size} color={color} />;
          }else if (route.name === 'WhoKnowsWho') {
            iconName = focused ? 'users-rays' : 'users-rays';
            return <FontAwesome6 name={iconName} size={size} color={color} />;
          }

          // You can return any component that you like here!
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'rgba(89, 89, 86 0.2)', // Semi-transparent white
          borderRadius: 20, // Rounded corners
          marginHorizontal: 10, // Space from edges
          position: 'absolute', // Ensures the style is applied correctly
          bottom: 5, // Adjust as needed
          left: 15,
          right: 15,
          elevation: 0, // Removes shadow on Android
          shadowOpacity: 0, // Removes shadow on iOS
          height: 80, // Adjust height as needed
        },
      })}
    >
      <Tab.Screen name="User" component={UserScreen} options={{headerShown: false}} />
      <Tab.Screen name="History" component={History} options={{headerShown: false}} />
      <Tab.Screen name="FriendsQuestions" component={FriendsQuestions} options={{headerShown: false}} />
      <Tab.Screen name="WhoKnowsWho" component={WhoKnowsWho} options={{headerShown: false}} />
    </Tab.Navigator>
  );
}
