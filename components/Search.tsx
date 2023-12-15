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
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Entypo from 'react-native-vector-icons/Entypo';

import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {collection, where, query, getDocs, addDoc} from 'firebase/firestore';
import GoBackButton from './goback';
import FriendRequest from './FriendRequest';
import { ThemedButton } from 'react-native-really-awesome-button';

export default function Search({navigation}) {
  const [users, setUsers] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const uid = FIREBASE_AUTH.currentUser?.uid;
  const email = FIREBASE_AUTH.currentUser?.email;

  const fetchUsers = async search => {
    try {
      const normalizedSearch = search?.toLowerCase();
      const getUsers = query(
        collection(FIRESTORE_DB, 'users'),
        where('searchDisplayName' || 'email', '>=', normalizedSearch),
      );

      const snapshot = await getDocs(getUsers);

      const userInfo = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => user.userId !== uid)
        .filter(
          user =>
            user.searchDisplayName.startsWith(
              normalizedSearch.substring(0, 2),
            ) || user.email.startsWith(normalizedSearch.substring(0, 2)),
        );
      userInfo.sort(
        (a, b) =>
          a.searchDisplayName.localeCompare(b.searchDisplayName) ||
          a.email.localeCompare(b.email),
      );
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

        const friendRequestQuery = query(
          friendRequestsCollection,
          where('senderId', '==', uid),
          where('receiverId', '==', receiverId),
        );

        const existingRequests = await getDocs(friendRequestQuery);

        if (existingRequests.size === 0) {
          await addDoc(friendRequestsCollection, {
            senderId: uid,
            receiverId,
            status: 'pending',
            senderEmail: email,
            receiverUid: userId,
            firstName: userInfo.firstName,
            lastName: userInfo.lastName,
            displayName: userInfo.displayName,
            picture: userInfo.picture,
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
        {/* <FriendRequest navigation={navigation} /> */}
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
            if (search.length >= 2) {
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
        keyExtractor={users => users.userId}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.profilePicContainer}>
              <Image
                source={{ uri: item.picture }}
                style={styles.profilePic}
              />
              <Text style={styles.nameWithPic}>
                {item.firstName} {item.lastName}
              </Text>
            </View>
            <ThemedButton
            name="bruce"
            type='secondary'
            width={100}  // Set the width as needed
                  height={50}  // Set the height as needed
              style={styles.addButton}
              onPress={() => {
                console.log('add request sent');
                sendFriendRequest(item.email, item.userId);
                navigation.pop();
                
              }}> 
              <Text style={styles.addButtonText}>Add</Text>
            </ThemedButton>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profilePicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  nameWithPic: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  container: {
    paddingTop: 100,
    paddingHorizontal: 15,
    backgroundColor: '#F5F5F5',
  },
  searchContainer: {
    width: '100%',
    height: 40,
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
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addButton: {
    flexDirection: 'row',
      backgroundColor: 'grey',
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 25,
      alignItems: 'center',
      justifyContent: 'center',
  },
  addButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'HelveticaNeue-Light',
  },
});
