/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  Pressable,
  StyleSheet,
  Image,  // Added import for Image
  TouchableOpacity, // Added import for TouchableOpacity
} from 'react-native';

import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc, // Added import for updateDoc
} from 'firebase/firestore';
import {onAuthStateChanged} from 'firebase/auth';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import Search from './Search'; // Added import for Search component
import Icon from 'react-native-vector-icons/FontAwesome'; // Make sure to install this package
import { ThemedButton } from 'react-native-really-awesome-button';


export default function FriendRequest({navigation}) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [userInfo, setUserInfo] = useState([]);

  const uid = FIREBASE_AUTH.currentUser?.uid;

  //check for authenticated user
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, user => {
      setUser(user);
    });
  }, []);

  const fetchCurrentUserDetails = async () => {
    try {
      const getUserData = query(
        collection(FIRESTORE_DB, 'users'),
        where('userId', '==', uid),
      );

      const snapshot = await getDocs(getUserData);
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data(); // Assuming only one document will match
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

  // bring in Users and friend Requests and friends in order to mutate the data
  useEffect(() => {
    const loadUsers = async () => {
      if (user) {
        const usersCollection = collection(FIRESTORE_DB, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
      }
    };

    const loadFriendRequests = async () => {
      if (user) {
        const friendRequestsCollection = collection(
          FIRESTORE_DB,
          'friendRequests',
        );
        const friendRequestsQuery = query(
          friendRequestsCollection,
          where('receiverId', '==', user.email),
          where('status', '==', 'pending'),
        );
        const friendRequestsSnapshot = await getDocs(friendRequestsQuery);
        const friendRequestsData = friendRequestsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriendRequests(friendRequestsData);
      }
    };

    const loadFriends = async () => {
      if (user) {
        const friendsCollection = collection(FIRESTORE_DB, 'friends');
        const friendsQuery = query(
          friendsCollection,
          where('userId', '==', user.email),
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsData = friendsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriends(friendsData);
      }
    };

    loadUsers();
    loadFriendRequests();
    loadFriends();
  }, [user]);

  const acceptFriendRequest = async (
    requestId,
    senderId,
    senderEmail,
    receiverId,
    firstname,
    lastname,
    displayname,
    picture,
  ) => {
    // Update the friend request status to "accepted"
    const friendRequestsCollection = collection(FIRESTORE_DB, 'friendRequests');
    const requestDoc = doc(friendRequestsCollection, requestId);
    await updateDoc(requestDoc, {status: 'accepted'});

    // Add both users as friends (you can create a separate collection for friends)
    const friendsCollection = collection(FIRESTORE_DB, 'friends');
    await addDoc(friendsCollection, {
      requestId,
      friendId: senderEmail,
      userId: receiverId,
      firstName: firstname,
      lastName: lastname,
      displayName: displayname,
      picture: picture,
    });
    await addDoc(friendsCollection, {
      friendId: receiverId,
      userId: senderEmail,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      displayName: userInfo.displayName,
      picture: userInfo.picture,
    });
  };

  const declineFriendRequest = async requestId => {
    // Update the friend request status to "declined"
    const friendRequestsCollection = collection(FIRESTORE_DB, 'friendRequests');
    const requestDoc = doc(friendRequestsCollection, requestId);
    await updateDoc(requestDoc, {status: 'declined'});
  };

  const deleteFriend = async friendId => {
    // Remove the friend relationship from the "friends" collection
    const friendsCollection = collection(FIRESTORE_DB, 'friends');

    // Find and delete the relationship where the user is the userId and friendId is friendId
    const userFriendQuery = query(
      friendsCollection,
      where('userId', '==', user.email),
      where('friendId', '==', friendId),
    );
    const userFriendSnapshot = await getDocs(userFriendQuery);
    userFriendSnapshot.forEach(async document => {
      const docId = document.id;
      await deleteDoc(doc(friendsCollection, docId));
    });

    // Find and delete the relationship where the user is the friendId and friendId is the userId
    const friendUserQuery = query(
      friendsCollection,
      where('userId', '==', friendId),
      where('friendId', '==', user.email),
    );
    const friendUserSnapshot = await getDocs(friendUserQuery);
    friendUserSnapshot.forEach(async document => {
      const docId = document.id;
      await deleteDoc(doc(friendsCollection, docId));
    });
  };

  return (
    <View style={styles.Searchcontainer}>
      <Search navigation={navigation} />
      <FlatList
        data={friendRequests}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image source={{ uri: item.picture }} style={styles.profileImage} />
            <View style={styles.itemTextContainer}>
              <Text style={styles.requestText}>
               Accept {item.firstName + ' ' + item.lastName}?
              </Text>
              <View style={styles.buttonContainer}>
                <ThemedButton
                name="bruce"
                type='secondary'
                width={100} 
                style={{ marginRight: 40 }}
                  onPress={() => {
                    acceptFriendRequest(
                      item.id,
                      item.senderId,
                      item.senderEmail,
                      item.receiverId,
                      item.firstName,
                      item.lastName,
                      item.displayName,
                      item.picture,
                    );
                  }}
                >
                  Accept
                  </ThemedButton>
                <ThemedButton
                name="bruce"
                type='secondary'
                width={100} 
                style={{ marginRight: 220 }}
                  title="Decline"
                  onPress={() => {
                    declineFriendRequest(item.id);
                  }}
                >
                  Decline
                  </ThemedButton>
              </View>
            </View>
          </View>
        )}
        // ListHeaderComponent={() => (
        //   <Text style={styles.sectionTitle}>Friend Requests:</Text>
        // )}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <FlatList
            data={friends}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <View style={styles.item}>
               <Image source={{ uri: item.picture }} style={styles.profileImage} />
              <Text style={styles.itemText}>
                {item.firstName + ' ' + item.lastName}
              </Text>
                <ThemedButton
                name="bruce"
                type="secondary"
                  onPress={() => {
                    deleteFriend(item.friendId);
                  }}
                  width={100}  // Set the width as needed
                  height={50}  // Set the height as needed
                >
                   <Text style={styles.deleteButtonText}>Delete</Text>
                  </ThemedButton>
              </View>
          )}
        />
      </View>
      <View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
requestText: {
fontSize: 18,
fontFamily: 'American Typewriter',
fontWeight: 'bold',
},
  deleteButtonText: {
    color: 'black',
    fontWeight: 'bold',
    fontFamily: 'HelveticaNeue-Light',
  },
  item: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Center items vertically within the card
    justifyContent: 'space-between', // Space between the profile and the button
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    flex: 1,
    marginRight: 50,
    fontSize: 18,            
    fontWeight: 'bold',         
    textAlign: 'center',        
    paddingVertical: 5,       
    backgroundColor: '#ffffff', 
  },
  buttonContainer: {
    flexDirection: 'row',
      borderRadius: 8,
      paddingVertical: 15,
      paddingHorizontal: 105,
      alignItems: 'center',
      justifyContent: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  sectionTitle: {
    padding: 10,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
   marginLeft: 142,
  },
  friendRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
    borderRadius: 8,
  },
  friendRequestTextContainer: {
    flex: 1,
  },
  friendRequestText: {
    fontSize: 16,
  },
  section:{
    padding: 10,
  }
});
