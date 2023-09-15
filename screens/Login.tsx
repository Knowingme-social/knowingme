/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable no-alert */
import React, {useState} from 'react';
import {
  Alert,
  Text,
  View,
  KeyboardAvoidingView,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {FIREBASE_AUTH} from '../firebaseConfig';
import {signInWithCredential, signInWithEmailAndPassword} from 'firebase/auth';
import {GoogleAuthProvider} from 'firebase/auth';

// //to ignore async storage warning.
//import {LogBox} from 'react-native';
//LogBox.ignoreAllLogs();

export default function Login({navigation}) {
  GoogleSignin.configure({
    webClientId:
      '431839111230-dflhmtt1elffh0cp5bfovh0hnj224n5b.apps.googleusercontent.com',
    //scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  });

  const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const signInWithGoogleAsync = async () => {
    try {
      // Check if your device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
      // Get the users ID token
      const {idToken} = await GoogleSignin.signIn();

      // Create a Google credential with the token
      const googleCredential = GoogleAuthProvider.credential(idToken);

      // Sign-in the user with the credential
      const user_sign_in = signInWithCredential(auth, googleCredential);

      user_sign_in
        .then(user => {
          console.log(user);
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      if (error === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };

  const signIn = async () => {
    setLoading(true);
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      console.log(response);
    } catch (error) {
      console.log(error);
      Alert.alert('Incorrect Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.textAccount}>No account?</Text>
        <Pressable onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.textSignUp}> Sign up </Text>
        </Pressable>
        <Text>Please login</Text>
        <TextInput
          value={email}
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          onChangeText={text => setEmail(text)}
        />
        <TextInput
          secureTextEntry={true}
          value={password}
          style={styles.input}
          placeholder="Password"
          autoCapitalize="none"
          onChangeText={text => setPassword(text)}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Pressable style={styles.button} onPress={signIn}>
              <Text style={styles.text}>Login</Text>
            </Pressable>
            <Pressable
              style={styles.googlebutton}
              onPress={signInWithGoogleAsync}>
              <Text style={styles.text}>Google Login</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('ResetPassword')}>
              <Text style={styles.textSignUp}> Forgot your password? </Text>
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
