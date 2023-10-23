/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  TextInput,
  FlatList,
  Button,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import React, {useState} from 'react';

import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {collection, where, query, getDocs, addDoc} from 'firebase/firestore';
//import {oneUser} from './EditProfile';

export default function Search({navigation}) {
  // Use an array to store user data
  const [users, setUsers] = useState([]);
  const uid = FIREBASE_AUTH.currentUser?.uid;
  const email = FIREBASE_AUTH.currentUser?.email;

  const fetchUsers = async search => {
    try {
      const getUsers = query(
        collection(FIRESTORE_DB, 'users'),
        where('lastName', '>=', search.toLowerCase()),
      );

      const snapshot = await getDocs(getUsers);

      const userInfo = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => user.userId !== uid); // Exclude the currently signed-in user

      // Update the state with the fetched data
      setUsers(userInfo);
    } catch (error) {
      console.log(error);
    }
  };

  //console.log(users);

  const sendFriendRequest = async receiverId => {
    try {
      if (uid) {
        const friendRequestsCollection = collection(
          FIRESTORE_DB,
          'friendRequests',
        );

        // Check if a friend request already exists with the same senderId and receiverId
        const friendRequestQuery = query(
          friendRequestsCollection,
          where('senderId', '==', uid),
          where('receiverId', '==', receiverId),
        );

        const existingRequests = await getDocs(friendRequestQuery);

        if (existingRequests.size === 0) {
          // If no existing requests are found, send the friend request
          await addDoc(friendRequestsCollection, {
            senderId: uid,
            receiverId,
            status: 'pending',
            senderEmail: email,
          });
          console.log('Friend request sent');
        } else {
          Alert.alert('Friend request already sent');
          console.log('Friend request already sent');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <TextInput
        style={styles.textinputbox}
        placeholder="Type Friend's Name"
        onChangeText={search => {
          if (search.length >= 2) {
            fetchUsers(search);
          } else {
            setUsers([]);
          }
        }}
      />
      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        keyExtractor={users => users.userId} // Add a key extractor
        renderItem={({item}) => (
          <View>
            <Text>
              {item.firstName} {item.lastName}
            </Text>
            <Button
              title="Send Friend Request"
              onPress={() => {
                console.log('sent');
                sendFriendRequest(item.email);
                navigation.pop();
              }}
            />
          </View>
        )}
      />
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Pressable onPress={() => navigation.pop()}>
          <Text style={{color: 'blue'}}>Go Back</Text>
        </Pressable>
      </View>
    </View>
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
  textSignUp: {
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'blue',
  },
});
