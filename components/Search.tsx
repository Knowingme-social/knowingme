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
  TouchableOpacity,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';

import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {collection, where, query, getDocs, addDoc} from 'firebase/firestore';
import GoBackButton from './goback';
//import {oneUser} from './EditProfile';

export default function Search({navigation}) {
  // Use an array to store user data
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const uid = FIREBASE_AUTH.currentUser?.uid;
  const email = FIREBASE_AUTH.currentUser?.email;

  const fetchUsers = async search => {
    try {
      const normalizedSearch = search?.toLowerCase();
      const getUsers = query(
        collection(FIRESTORE_DB, 'users'),
        where('searchLastName', '>=', normalizedSearch),
      );

      const snapshot = await getDocs(getUsers);

      const userInfo = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        // Exclude the currently signed-in user
        .filter(user => user.userId !== uid)
        .filter(user =>
          user.searchLastName.startsWith(normalizedSearch.substring(0, 3)),
        ); // Filter by the first 3 letters
      // Sort users alphabetically
      userInfo.sort((a, b) => a.searchLastName.localeCompare(b.searchLastName));
      // Update the state with the fetched data
      setUsers(userInfo);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchCurrentUserDetails = async () => {
    try {
      const getUserData = query(
        collection(FIRESTORE_DB, 'users'),
        where('userId', '==', uid),
      );

      const snapshot = await getDocs(getUserData);
      if (!snapshot.empty) {
        // Assuming only one document will match
        const userData = snapshot.docs[0].data();
        setUserInfo(userData);
      } else {
        console.log('No user with the given details found');
        setUserInfo(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCurrentUserDetails();
  }, []);

  const sendFriendRequest = async (receiverId, userId) => {
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
            // senderId: uid,
            receiverId,
            status: 'pending',
            senderEmail: email,
            receiverUid: userId,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            displayName: userInfo.displayName,
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
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Entypo name="magnifying-glass" size={24} color="black" />
        <TextInput
          style={{
            flex: 1,
            paddingLeft: 10,
            color: 'black',
            fontFamily: 'HelveticaNeue-Light',
          }}
          placeholder="Type Friend's Name"
          placeholderTextColor="#BFBFBF"
          onChangeText={search => {
            if (search.length >= 4) {
              fetchUsers(search);
            } else {
              setUsers([]);
            }
          }}
        />
        <View style={{position: 'absolute', top: -90, left: -15}}>
          <GoBackButton navigation={navigation} />
        </View>
      </View>
      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        keyExtractor={users => users.userId} // Add a key extractor
        renderItem={({item}) => (
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {item.firstName} {item.lastName}
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                console.log('sent');
                sendFriendRequest(item.email, item.userId);
                navigation.pop();
              }}>
              <Text style={styles.buttonText}>Send Friend Request</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    width: '100%',
    height: 48,
    borderColor: '#BFBFBF',
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 22,
    marginBottom: 25,
    backgroundColor: 'white',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'HelveticaNeue-Light',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#3CB371',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontFamily: 'HelveticaNeue-Light',
  },
  textinputtitle: {
    fontSize: 16,
    marginVertical: 4,
    color: 'black',
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
