import React, {useState, useEffect} from 'react';
import {View, Text, Button, FlatList, Pressable, StyleSheet, ScrollView} from 'react-native';

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
import GoBackButton from './goback';

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
    //console.log(user?.id);
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
        //console.log(friendRequestsData);
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
        //console.log(friendsData);
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
      displayname: displayname,
    });
    await addDoc(friendsCollection, {
      friendId: receiverId,
      userId: senderEmail,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      displayName: userInfo.displayName,
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
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests:</Text>
          <FlatList
            data={friendRequests}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.senderEmail} wants to be your friend.</Text>
                <View style={styles.buttonContainer}>
                  <Button
                    title="Accept"
                    onPress={() => {
                      navigation.pop();
                      acceptFriendRequest(
                        item.id,
                        item.senderId,
                        item.senderEmail,
                        item.receiverId,
                      );
                    }}
                  />
                  <Button
                    title="Decline"
                    onPress={() => {
                      navigation.pop();
                      declineFriendRequest(item.id);
                    }}
                  />
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friends:</Text>
          <FlatList
            data={friends}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <View style={styles.item}>
                <Text style={styles.itemText}>{item.friendId} is your friend.</Text>
                <View style={styles.buttonContainer}>
                  <Button
                    title="Delete"
                    onPress={() => {
                      deleteFriend(item.friendId);
                    }}
                  />
                </View>
              </View>
            )}
          />
        </View>
      </ScrollView>
      <View style={{bottom: 820}}>
        <GoBackButton navigation={navigation} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f9c2ff',
    marginVertical: 5,
    borderRadius: 5,
  },
  itemText: {
    flex: 1,
    marginRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});