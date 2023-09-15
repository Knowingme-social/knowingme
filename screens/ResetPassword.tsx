/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable quotes */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable no-extra-semi */
/* eslint-disable prettier/prettier */

import {useState} from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  ActivityIndicator,
  Button,
} from 'react-native';

import {firebase} from '@react-native-firebase/auth';

export default function ResetPassword({navigation}) {
  //const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const resetPassword = () => {
    firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('reset email was sent');
        const backtologin = () => navigation.pop();
        backtologin();
      })
      .catch(error => {
        if (error.code === 'auth/invalid-email' || 'auth/user-not-found') {
          console.log(error);
          Alert.alert('Account does not exist');
        } else {
          console.log(error);
          Alert.alert('Something went wrong, please try again!');
        }
      });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <Text>Please Enter your email</Text>
        <TextInput
          value={email}
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={text => setEmail(text)}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Button
              disabled={!email}
              title="Reset Password"
              onPress={resetPassword}
            />
            <Pressable onPress={() => navigation.pop()}>
              <Text style={styles.textSignUp}> Go Back </Text>
            </Pressable>
          </>
        )}
      </KeyboardAvoidingView>
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
