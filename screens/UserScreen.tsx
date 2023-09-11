/* eslint-disable eol-last */
/* eslint-disable no-lone-blocks */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import React from 'react';
import {
  Text,
  View,
  Button,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {FIREBASE_AUTH} from '../firebaseConfig';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

export default function User({navigation}) {
  // //for async data testing
  // const getData = async () => {
  //   try {
  //     const answer = await AsyncStorage.getItem('answer');
  //     if (answer !== null) {
  //       console.log(answer);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  //delete daily answer from local storage  with button(for testing)
  const clearEntry = async () => {
    try {
      await AsyncStorage.removeItem('answer');

      console.log(`updated ${answer}`);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <Text>Welcome to user page</Text>
      <Button title="Clear Answer" onPress={clearEntry} />

      {/* <Button title="Print Answer in console log" onPress={getData} /> */}

      <Pressable
        style={styles.button}
        onPress={() => {
          FIREBASE_AUTH.signOut();
          GoogleSignin.signOut();
          navigation.navigate('Login', {screen: 'Login'});
        }}>
        <Text style={styles.text}>Sign Out</Text>
      </Pressable>
    </KeyboardAvoidingView>
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
  googlebutton: {
    marginVertical: 4,
    height: 45,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#4682B4',
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  textAccount: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'black',
  },
  textSignUp: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'blue',
  },
});

//   <Button
//   title="Sign Out"
//   onPress={() => {
//     GoogleSignin.signOut();
//   }}
// />

{
  /* <Pressable
style={styles.button}
onPress={() => {
FIREBASE_AUTH.signOut();
// nextScreen();
navigation.navigate('Login', {screen: 'Login'});
}}> */
}

// const nextScreen = async () => {
//     navigation.push('Login');

//     console.log('I worked');
//   };
