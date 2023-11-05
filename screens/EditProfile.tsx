/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-trailing-spaces */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
  import React, {useEffect, useState} from 'react';
  import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    TextInput,
    Pressable,
    Alert,
  } from 'react-native';
  import Entypo from 'react-native-vector-icons/Entypo';
  import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
  import {
    collection,
    deleteDoc,
    doc,
    where,
    onSnapshot,
    updateDoc,
    query,
    getDocs,
  } from 'firebase/firestore';
  import {storageRef, FIREBASE_STORAGE} from '../firebaseConfig';
  import {launchImageLibrary} from 'react-native-image-picker';
  import {uploadBytes, getDownloadURL} from 'firebase/storage';

  export interface oneUser {
    firstName: string;
    lastName: string;
    email: string;
    displayName: string;
    emailVerified: boolean;
    phone: string;
    userId: string;
    picture: string;
    created: object;
  }

  export default function EditProfile({navigation}) {
    const [userData, setUserData] = useState<oneUser | null>(null);
    const [newFirst, setNewFirst] = useState('');
    const [newLast, setNewLast] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [image, setImage] = useState(null || userData?.picture);

    const uid = FIREBASE_AUTH.currentUser?.uid;

    //to create photo library picker(for pictures from your device)
    const imagePicker = async () => {
      launchImageLibrary(
        {
          mediaType: 'photo',
          includeBase64: false,
          maxHeight: 200,
          maxWidth: 200,
        },
        response => {
          if (response.didCancel) {
            console.log('User cancelled image picker');
          } else if (response.error) {
            console.log('ImagePicker Error: ', response.error);
          } else {
            setImage(response.uri);
            handleUpload(response.uri);
          }
        },
      );
    };

    //adding picture to firebase storage and get back a url for it.
    const handleUpload = async (imageUri: RequestInfo) => {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const ref = storageRef.child(`images/${uid}/${new Date().toISOString()}`);
      await uploadBytes(ref, blob);
      const url = await getDownloadURL(ref);
      setImage(url);
    };

    useEffect(() => {
      const unsubscribe = onSnapshot(queryRef, querySnapshot => {
        const users: oneUser[] = [];
        querySnapshot.forEach(documentSnapshot => {
          users.push({
            ...documentSnapshot.data(),
            userId: documentSnapshot.id,
          } as oneUser);
        });
        setUserData(users[0]);
      });
      return () => unsubscribe();
    }, [uid]);

    const queryRef = query(
      collection(FIRESTORE_DB, 'users'),
      where('userId', '==', uid),
    );

    const updateUser = async () => {
      try {
        // Execute the query to get the matching documents
        const querySnapshot = await getDocs(queryRef);

        if (!querySnapshot.empty) {
          // Assuming there's only one matching document
          const docSnapshot = querySnapshot.docs[0];
          const docRef = doc(FIRESTORE_DB, 'users', docSnapshot.id);
          console.log(docRef);
          // Update the document
          await updateDoc(docRef, {
            firstName: newFirst || userData?.firstName,
            lastName: newLast || userData?.lastName,
            email: newEmail || userData?.email,
            displayName: userData?.displayName,
            phone: newPhone || userData?.phone,
            picture: image || userData?.picture,
          });

          console.log('Updated');
          Alert.alert('Updated successfully');
        } else {
          // Handle the case where no document matches the query
          console.log('No document matches the query');
          Alert.alert('Document does not exist');
        }
      } catch (error) {
        console.error(error);
      }
    };
    let profilePic = {
      uri:
        userData?.picture ||
        'https://firebasestorage.googleapis.com/v0/b/knowingme-social.appspot.com/o/defaultPic%2FQuestion.png?alt=media&token=39ec7cd0-7b73-4b4d-b9d3-fd8d999141d1',
    };

    return (
      <View style={styles.container}>
        <View style={styles.profileContainer}>
          <TouchableOpacity onPress={imagePicker}>
            <View style={styles.profileImageContainer}>
              <ImageBackground
                source={profilePic}
                style={styles.profileImage}
                imageStyle={styles.profileImageStyle}>
                <View style={styles.cameraIconContainer}>
                  <Entypo name="camera" size={35} color="white" />
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>
            {userData?.firstName} {userData?.lastName}
          </Text>
        </View>
<>
</>
        <View style={styles.formContainer}>
        <View style={styles.form}>
  <View style={styles.question}>
    <TextInput
      style={styles.input}
      placeholder="Display Name"
      placeholderTextColor="black"
      value={userData?.displayName} // Bind value to userData state
      onChangeText={(text) => setUserData(prevUserData => ({ ...prevUserData!, displayName: text }))} // Update the state variable when text changes
    />
  </View>
  <View style={styles.question}>
    <TextInput
      style={styles.input}
      placeholder="First Name"
      placeholderTextColor="black"
      value={newFirst} // Bind value to newFirst state
      onChangeText={setNewFirst} // Update the state variable when text changes
    />
  </View>
  <View style={styles.question}>
    <TextInput
      style={styles.input}
      placeholder="Last Name"
      placeholderTextColor="black"
      value={newLast} // Bind value to newLast state
      onChangeText={setNewLast} // Update the state variable when text changes
    />
  </View>
  <View style={styles.question}>
    <TextInput
      style={styles.input}
      placeholder="Email Address"
      placeholderTextColor="black"
      value={newEmail} // Bind value to newEmail state
      onChangeText={setNewEmail} // Update the state variable when text changes
      keyboardType="email-address" // Set keyboard type for emails
    />
  </View>
  <View style={styles.question}>
    <TextInput
      style={styles.input}
      placeholder="Phone Number"
      placeholderTextColor="black"
      value={newPhone} // Bind value to newPhone state
      onChangeText={setNewPhone} // Update the state variable when text changes
      keyboardType="phone-pad" // Set keyboard type for phone numbers
    />
  </View>
    </View>
          <TouchableOpacity style={styles.saveButton} onPress={updateUser}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goBackContainer}>
          <Pressable onPress={() => navigation.pop()}>
            <Text style={styles.goBackText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    form: {
      shadowColor: '#000',
      shadowOffset: { width: 1, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 10,
      borderRadius: 40,
      paddingVertical: 43.5,
      paddingHorizontal: 28,
      backgroundColor: '#e9ffe8',
      margin: 5,
    },
    header: {
      color: 'black',
      fontWeight: '300',
      marginBottom: 35,
      textTransform: 'uppercase',
    },
    question: {
      marginBottom: 20,
    },
    input: {
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 60,
      padding: 15,
      color: 'black',
      fontWeight: '100',
    },
    button: {
      marginTop: 35,
      backgroundColor: '#FFF',
      borderColor: 'black',
      borderWidth: 1,
      borderRadius: 60,
      padding: 20,
    },
    buttonText: {
      color: 'black',
      textAlign: 'center',
      fontWeight: '100',
    },
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    profileContainer: {
      margin: 20,
      alignItems: 'center',
    },
    profileImageContainer: {
      height: 100,
      width: 100,
      borderRadius: 50,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileImage: {
      height: 100,
      width: 100,
    },
    profileImageStyle: {
      borderRadius: 50,
    },
    cameraIconContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileName: {
      marginTop: 10,
      fontSize: 18,
      fontWeight: 'bold',
      color: 'black',
    },
    formContainer: {
      margin: 20,
    },
    formInputContainer: {
      marginVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    formInputLabel: {
      color: 'black',
      width: '25%',
    },
    formInput: {
      flex: 1,
      height: 40,
      color: 'black',
      borderBottomWidth: 1,
      borderBottomColor: 'black',
    },
    saveButton: {
      padding: 15,
      borderRadius: 10,
      backgroundColor: '#3CB371',
      alignItems: 'center',
      marginTop: 10,
    },
    saveButtonText: {
      fontSize: 17,
      fontWeight: 'bold',
      color: 'white',
    },
    goBackContainer: {
      // marginTop: -20,
      alignItems: 'center',
      color: 'black'
    },
    goBackText: {
      color: 'black',
    },
  });
