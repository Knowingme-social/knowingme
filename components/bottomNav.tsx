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
      })}
    >
      <Tab.Screen name="User" component={UserScreen} options={{headerShown: false}} />
      <Tab.Screen name="History" component={History} options={{headerShown: false}} />
      <Tab.Screen name="FriendsQuestions" component={FriendsQuestions} options={{headerShown: false}} />
      
      {/* Replace LoginScreen with the actual component you navigate to on sign out */}
      <Tab.Screen name="WhoKnowsWho" component={WhoKnowsWho} options={{headerShown: false}} />
    </Tab.Navigator>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 20,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '90%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingVertical: 10,
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: 'black',
  },
  button: {
    height: 45,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
  },
});