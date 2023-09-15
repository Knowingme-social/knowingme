/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {StyleSheet, Text, View, Pressable, Button} from 'react-native';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
//import {useEffect, useState} from 'react';
//import Login from './Login';
import React from 'react';

export default function Home({navigation}: any) {
  return (
    <View style={styles.container}>
      <Text>Welcome to KnowingMe App</Text>
      <Pressable
        style={styles.button}
        onPress={() => navigation.push('History')}>
        <Text style={styles.text}>Go to History</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => navigation.push('Question')}>
        <Text style={styles.text}>Go to Question creation</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => navigation.push('User Screen')}>
        <Text style={styles.text}>Go to User Screen</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => {
          FIREBASE_AUTH.signOut();
          // nextScreen();
          navigation.navigate('Login', {screen: 'Login'});
        }}>
        <Text style={styles.text}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  button: {
    marginVertical: 4,
    height: 45,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#3CB371',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
});
