/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable semi */
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
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';

export default function SignUp({navigation}) {
  const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const createUser = async () => {
    try {
      const newUserCredentials = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log('User account created & signed in!');
      Alert.alert('User account created & signed in!');
      await addDoc(collection(FIRESTORE_DB, 'users'), {
        firstName: null,
        lastName: null,
        email: email,
        emailVerified: false,
        picture: null,
        displayName: null,
        created: serverTimestamp(),
      });
      await sendEmailVerification(newUserCredentials.user);
      console.log('Verification Email has been sent');
      Alert.alert('Verification Email has been sent');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('That email address is already in use!');
        Alert.alert('account already exists');
      } else if (error.code === 'auth/invalid-email') {
        console.log('No email Entered');
        Alert.alert('Please enter email');
      } else if (error.code === 'auth/missing-password') {
        console.log('Please enter Password');
        Alert.alert('Please enter Password!');
      } else if (error.code === 'auth/weak-password') {
        console.log('Weak password. Please choose a stronger one.');
        Alert.alert('Please choose a stronger password.');
      } else {
        console.error('An error occured', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView>
        <Text>Please Sign Up</Text>
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
            <Pressable style={styles.button} onPress={createUser}>
              <Text style={styles.text}>Sign Up</Text>
            </Pressable>
            <Button title="Go Back" onPress={() => navigation.pop()} />
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
});

// {loading ? (
//   <ActivityIndicator size="large" color="#0000ff" />
// ) : (
//   <>
//     <Pressable style={styles.button} onPress={createUser}>
//       <Text style={styles.text}>Sign Up</Text>
//     </Pressable>
//     <Pressable style={styles.button} onPress={signIn}>
//       <Text style={styles.text}>Login</Text>
//     </Pressable>
//     <Pressable
//       style={styles.googlebutton}
//       onPress={signInWithGoogleAsync}>
//       <Text style={styles.text}>Google Login</Text>
//     </Pressable>
//     <Button
//       title="Sign Out"
//       onPress={() => {
//         GoogleSignin.signOut();
//       }}
//     />
//   </>
// )}
// {/* <Button title="Clear" onPress={clearEntry} /> */}

// try {
//   const newUserCredentials = await createUserWithEmailAndPassword(
//     auth,
//     email,
//     password,
//   );
//   const userProfileRef = doc(
//     FIRESTORE_DB,
//     `users/${newUserCredentials.user.uid}`,
//   );
//   await setDoc(userProfileRef, {email});
//   await sendEmailVerification(newUserCredentials.user);
//   return newUserCredentials;
// } catch (error) {
//   throw error;
// }
