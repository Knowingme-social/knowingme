import {StyleSheet, Text, View, Pressable, Button} from 'react-native';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import React from 'react';

import Icon from 'react-native-vector-icons/MaterialIcons';

export default function NavBar({navigation}: any) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.push('History')}>
          <Icon name="history" size={24} color="white" />
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.push('FriendsQuestions')}>
          <Text style={styles.text}>Question</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.push('User Screen')}>
          <Text style={styles.text}>User Screen</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            FIREBASE_AUTH.signOut();
            navigation.navigate('Login', {screen: 'Login'});
          }}>
          <Text style={styles.text}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderRadius: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
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
    backgroundColor: '#fff',
  },
  button: {
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
