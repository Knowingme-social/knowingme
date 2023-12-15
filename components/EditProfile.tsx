/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
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
import React, {useEffect, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {
  collection,
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
import GoBackButton from './goback';
import { ThemedButton } from 'react-native-really-awesome-button';


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
  const [image, setImage] = useState(userData?.picture || null);

  const defaultPicture =
    'https://firebasestorage.googleapis.com/v0/b/knowingme-social.appspot.com/o/defaultPic%2FQuestion.png?alt=media&token=39ec7cd0-7b73-4b4d-b9d3-fd8d999141d1';

  const uid = FIREBASE_AUTH.currentUser?.uid;

  //to create photo library picker(for pictures from your device)
  const imagePicker = async () => {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
    })
      .then((res: any) => {
        handleUpload(res.assets[0].uri);
      })
      .catch(error => {
        console.log(error);
      });
  };

  //adding picture to firebase storage and get back a url for it.
  const handleUpload = async (imageUri: RequestInfo) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const reference = storageRef(FIREBASE_STORAGE, `images/${uid}`);

      uploadBytes(reference, blob)
        .then(snapshot => {
          getDownloadURL(snapshot.ref).then(downloadURL => {
            setImage(downloadURL);

            console.log(imageUri);
          });
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    // Check if uid exists before making the query
    if (uid) {
      const userInfoQuery = query(
        collection(FIRESTORE_DB, 'users'),
        where('userId', '==', uid),
      );

      // Ensure that you update state with the new data
      const subscriber = onSnapshot(userInfoQuery, snapshot => {
        const userInfo: oneUser[] = [];
        snapshot.forEach(doc => {
          userInfo.push({
            ...doc.data(),
          } as oneUser);
        });
        setUserData(userInfo[0] || null);
      });

      // Return the subscriber function to clean up when the component unmounts
      return () => subscriber();
    }
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
          firstName: newFirst.toLowerCase() || userData?.firstName,
          lastName: newLast.toLowerCase() || userData?.lastName,
          email: newEmail || userData?.email,
          displayName: userData?.displayName,
          phone: newPhone || userData?.phone,
          picture: image || userData?.picture,
        });

        console.log('Updated');
        Alert.alert('Updated successfully');
      } else {
        console.log('No document matches the query');
        Alert.alert('Document does not exist');
      }
    } catch (error) {
      console.error(error);
    }
  };
  let profilePic = {
    uri: userData?.picture || defaultPicture,
  };


  return (
    <View style={styles.container}>
      <View style={{margin: 20}}>
        <View style={{alignItems: 'center'}}>
        <View style={styles.header}>
        <TouchableOpacity onPress={imagePicker} style={styles.profilePicContainer}>
         <ImageBackground
          source={profilePic}
           style={styles.profilePic}
          imageStyle={styles.profilePicImage}>
          <Entypo name="camera" size={30} color="#fffff" style={styles.cameraIcon} /> 
         </ImageBackground>
        </TouchableOpacity>
        <Text style={styles.fullName}>{userData?.firstName} {userData?.lastName}</Text>
      </View>
     </View>
    <View style={styles.textInputBox}>
          <Text
            style={{
              paddingLeft: 0.71,
              color: 'black',
              marginVertical: 8,
              width: '25%',
            }}>
            First Name
          </Text>
          <TextInput
            autoCorrect={false}
            placeholder={userData?.firstName}
            onChangeText={text => {
              if (text.length >= 2) {
                setNewFirst(text);
              }
            }}
            placeholderTextColor={'grey'}
            style={{width: '80%'}}
          />
        </View>

        <View style={styles.textInputBox}>
          <Text
            style={{
              color: 'black',
              marginVertical: 8,
              width: '25%',
            }}>
            Last Name
          </Text>
          <TextInput
            autoCorrect={false}
            placeholder={userData?.lastName}
            onChangeText={text => {
              if (text.length >= 2) {
                setNewLast(text);
              }
            }}
            placeholderTextColor={'grey'}
            style={{width: '80%'}}
          />
        </View>

        <View style={styles.textInputBox}>
          <Text
            style={{
              
              color: 'black',
              marginVertical: 8,
              width: '15%',
            }}>
            Email
          </Text>
          <TextInput
            autoCorrect={false}
            placeholder={userData?.email}
            onChangeText={text => {
              if (text.length >= 2) {
                setNewEmail(text);
              }
            }}
            placeholderTextColor={'grey'}
            style={{width: '85%'}}
          />
        </View>

        <View style={styles.textInputBox}>
          <Text
            style={{
              paddingLeft: 1,
              color: 'black',
              marginVertical: 8,
              width: '17%',
            }}>
            Phone
          </Text>
          <TextInput
            autoCorrect={false}
            placeholder={userData?.phone}
            keyboardType="phone-pad"
            enablesReturnKeyAutomatically={true}
            onChangeText={text => {
              if (text.length >= 8) {
                setNewPhone(text);
              }
            }}
            placeholderTextColor={'grey'}
            style={{width: '83%'}}
          />
        </View>
        <View style={styles.commandButton}>
        <ThemedButton
      name="cartman"
      type="primary"
      progress
      onPress={async (next) => {
        await updateUser();
        next(); // Call this function when your update process is complete
      }}
    >
      Save
    </ThemedButton>
        </View>  
      </View>
      <View>
      <View style={{position: 'absolute', top: -15, left: 0}}>
          <GoBackButton navigation={navigation} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {  
    flex: 1,
    backgroundColor: '#fff',
  },
  textInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#ccc', // A light grey for subtle underlining
    marginVertical: 10, // Adds vertical spacing between each input box
    marginHorizontal: 20, // Side margins for the input boxes
  },
  inputLabel: {
    color: '#333', // A darker grey for the label for better readability
    width: '30%', // Width of the label, can adjust based on screen size
    fontSize: 16, // Slightly larger font size for readability
    fontWeight: '600', // Medium weight for the label text
    paddingVertical: 15, // Vertical padding for touch area and visual comfort
  },
  textInput: {
    flex: 1, // Take up remaining space
    fontSize: 16, // Matching the label size for consistency
    color: '#333', // Text color to match the label
    paddingHorizontal: 10, // Horizontal padding for the input area
    paddingVertical: 15, // Vertical padding for touch area and visual comfort
    // Remove the border and let the borderBottom of the container show through
  },
  appButtonContainer: {
    elevation: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12
  },
  appButtonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    textTransform: "uppercase"
  },
  screenContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  // Button styles
  commandButton: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    marginVertical: 20,
    marginHorizontal: 20,
    // Add any additional styling here for the Cartman theme
  },
  panelButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white', // Update if needed
    // Add any additional styling here for the Cartman theme
  },
  // Style for the back button if necessary
  backButton: {
    fontSize: 16,
    color: '#333', // Same as the text color for consistency
    textAlign: 'center', // Center the text if it's not already wrapped in a touchable
    marginVertical: 20, // Spacing from the bottom of the screen or element above
  },
  panel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    marginVertical: 7,
  },
  action: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingBottom: 5,
  },
  actionError: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FF0000',
    paddingBottom: 5,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#D6EAF8',
  },
  profilePicContainer: {
    height: 150,
    width: 150,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  profilePic: {
    height: '100%',
    width: '100%',
  },
  profilePicImage: {
    borderRadius: 60,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 3,
    right: 30,
    padding: 5,
    borderRadius: 15,
    color: '#fff',
  },
  fullName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50', // Dark text color for the name
    marginTop: 5,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#AED6F1', // Light blue color for the input bottom border
    paddingBottom: 5,
    marginBottom: 20,
  },
  inputIcon: {
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#3498DB', // A blue color for the save button
    borderRadius: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF', // White color for the save button text
    fontWeight: 'bold',
  },
  backButtonText: {
    fontSize: 16,
    color: '#3498DB', // Same blue color as the save button for consistency
  },
});