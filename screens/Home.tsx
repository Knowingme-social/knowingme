import React, { useState } from 'react';
import {Text, View, Pressable, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign'; // Import the Icon component
import menuStyles from '../styles/menuStyles';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';

export default function Home({ navigation }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={menuStyles.container}>
      <Text>Welcome to KnowingMe!</Text>
      <Pressable style={menuStyles.menuButton} onPress={toggleMenu}>
        <Text style={menuStyles.menuText}>Menu</Text>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={toggleMenu}
      >
        <View style={menuStyles.centeredView}>
          <View style={menuStyles.modalView}>
          <Pressable
              style={[menuStyles.closeButton]}
              onPress={toggleMenu}>
              <Icon name="close" size={24} color="black" />
            </Pressable>
            <Pressable
              style={menuStyles.button}
              onPress={() => {
                navigation.push('History');
                toggleMenu();
              }}>
              <Text style={menuStyles.text}>Go to History</Text>
            </Pressable>
            <Pressable
              style={menuStyles.button}
              onPress={() => {
                navigation.push('Question');
                toggleMenu();
              }}>
              <Text style={menuStyles.text}>Go to Question creation</Text>
            </Pressable>
            
            <Pressable
              style={menuStyles.button}
              onPress={() => {
                navigation.push('User Screen');
                toggleMenu();
              }}>
              <Text style={menuStyles.text}>Go to User Screen</Text>
            </Pressable>
            <Pressable
              style={menuStyles.button}
              onPress={() => {
                navigation.push('Tests');
                toggleMenu();
              }}>
              <Text style={menuStyles.text}>Test</Text>
            </Pressable>
            <Pressable
             style={menuStyles.button}
            onPress={() => {
             FIREBASE_AUTH.signOut();
             // nextScreen();
            navigation.navigate('Login', {screen: 'Login'});
           }}>
        <Text style={menuStyles.text}>Sign Out</Text>
      </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
