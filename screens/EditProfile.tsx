/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-trailing-spaces */
/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
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
    await launchImageLibrary({
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
            //console.log('File available at', downloadURL);
            setImage(downloadURL);
            //return downloadURL;
            //console.log(image);
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
  //console.log(image);
  useEffect(() => {
    // Check if uid exists before making the query
    if (uid) {
      const userInfoQuery = query(
        collection(FIRESTORE_DB, 'users'),
        where('userId', '==', uid),
      );

      const subscriber = onSnapshot(userInfoQuery, snapshot => {
        // Ensure that you update state with the new data
        const userInfo: oneUser[] = [];
        snapshot.forEach(doc => {
          userInfo.push({
            ...doc.data(),
          } as oneUser);
        });
        setUserData(userInfo[0] || null); // Update userData state
      });

      // Return the subscriber function to clean up when the component unmounts
      return () => subscriber();
    }
  }, [uid]);
  //console.log(userData);
  //console.log(image);
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
      <View style={{margin: 20}}>
        <View style={{alignItems: 'center'}}>
          <TouchableOpacity onPress={imagePicker}>
            <View
              style={{
                height: 100,
                width: 100,
                borderRadius: 15,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ImageBackground
                source={profilePic}
                style={{height: 100, width: 100}}
                imageStyle={{borderRadius: 15}}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Entypo name="camera" size={35} color="black" />
                </View>
              </ImageBackground>
            </View>
          </TouchableOpacity>
          <Text
            style={{
              marginTop: 10,
              fontSize: 18,
              fontWeight: 'bold',
              color: 'black',
            }}>
            {userData?.firstName} {userData?.lastName}
            {/* {userData?.firstName || ''} {userData?.lastName || ''}{' '}
            {userData?.displayName ? ` ${userData.displayName}` : ''} */}
          </Text>
        </View>

        <View style={styles.textInputBox}>
          <Text
            style={{
              paddingLeft: 10,
              color: 'black',
              marginVertical: 8,
              width: '25%',
            }}>
            First Name :
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
              paddingLeft: 10,
              color: 'black',
              marginVertical: 8,
              width: '25%',
            }}>
            Last Name :
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
              paddingLeft: 10,
              color: 'black',
              marginVertical: 8,
              width: '15%',
            }}>
            Email :
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
              paddingLeft: 10,
              color: 'black',
              marginVertical: 8,
              width: '17%',
            }}>
            Phone :
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
        <TouchableOpacity style={styles.commandButton} onPress={updateUser}>
          <Text style={styles.panelButtonTitle}>Save</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Pressable onPress={() => navigation.pop()}>
          <Text style={{color: 'blue'}}> Go Back </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  textInputBox: {
    marginVertical: 8,
    width: '100%',
    height: 40,
    borderBlockColor: 'black',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#3CB371',
    alignItems: 'center',
    marginTop: 10,
  },
  panel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
    // shadowColor: '#000000',
    // shadowOffset: {width: 0, height: 0},
    // shadowRadius: 5,
    // shadowOpacity: 0.4,
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.4,
    // elevation: 5,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
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
  textInput: {
    flex: 1,

    paddingLeft: 10,
    color: '#05375a',
  },
});
