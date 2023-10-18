/* eslint-disable no-dupe-keys */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
/* eslint-disable no-trailing-spaces */
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
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';

export default function SignUp({navigation}) {
  const auth = FIREBASE_AUTH;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  //const [loading, setLoading] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);

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
        userId: auth.currentUser?.uid,
        firstName: firstName,
        lastName: lastName,
        email: FIREBASE_AUTH.currentUser?.email,
        emailVerified: FIREBASE_AUTH.currentUser?.emailVerified,
        picture:
          'https://firebasestorage.googleapis.com/v0/b/knowingme-social.appspot.com/o/defaultPic%2FQuestion.png?alt=media&token=39ec7cd0-7b73-4b4d-b9d3-fd8d999141d1',
        displayName: firstName + ' ' + lastName,
        phone: FIREBASE_AUTH.currentUser?.phoneNumber,
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
        Alert.alert('Please enter valid email');
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
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View style={{flex: 1, marginHorizontal: 22}}>
        <View style={{marginVertical: 11}}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              marginVertical: 8,
              color: 'black',
            }}>
            Please Sign Up
          </Text>
        </View>

        <View style={{marginBottom: 4}}>
          <Text style={styles.textinputtitle}>Email address</Text>

          <View style={styles.textinputbox}>
            <TextInput
              value={email}
              placeholder="Email"
              autoCapitalize="none"
              onChangeText={text => setEmail(text)}
              keyboardType="email-address"
              style={{
                width: '100%',
              }}
            />
          </View>
        </View>

        <View style={{marginBottom: 4}}>
          <Text style={styles.textinputtitle}>First Name</Text>

          <View style={styles.textinputbox}>
            <TextInput
              value={firstName}
              placeholder="First Name"
              onChangeText={text => setFirstName(text)}
              keyboardType="email-address"
              style={{
                width: '100%',
              }}
            />
          </View>
        </View>

        <View style={{marginBottom: 4}}>
          <Text style={styles.textinputtitle}>Last Name</Text>

          <View style={styles.textinputbox}>
            <TextInput
              value={lastName}
              placeholder="Last Name"
              onChangeText={text => setLastName(text)}
              keyboardType="email-address"
              style={{
                width: '100%',
              }}
            />
          </View>
        </View>

        <View style={{marginBottom: 4}}>
          <Text style={styles.textinputtitle}>Password</Text>

          <View style={styles.textinputbox}>
            <TextInput
              value={password}
              placeholder="Enter your password"
              secureTextEntry={!isPasswordShown}
              onChangeText={text => setPassword(text)}
              style={{
                width: '100%',
              }}
            />

            <TouchableOpacity
              onPress={() => setIsPasswordShown(!isPasswordShown)}
              style={{
                position: 'absolute',
                right: 12,
              }}>
              {isPasswordShown === true ? (
                <Entypo name="eye-with-line" size={24} color="black" />
              ) : (
                <Entypo name="eye" size={24} color="black" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <>
          <Pressable style={styles.button} onPress={createUser}>
            <Text style={styles.text}>Sign Up</Text>
          </Pressable>
          <Button title="Go Back" onPress={() => navigation.pop()} />
        </>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textinputtitle: {
    fontSize: 16,
    marginVertical: 4,
    color: 'black',
  },
  textinputbox: {
    width: '100%',
    height: 48,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 22,
  },
  button: {
    marginVertical: 6,
    height: 45,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
    backgroundColor: '#3CB371',
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
