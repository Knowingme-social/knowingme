/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {View, Text, Button, FlatList, Pressable} from 'react-native';

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

export default function FriendRequest({navigation}) {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);

  //check for authenticated user
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, user => {
      setUser(user);
    });
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
  ) => {
    // Update the friend request status to "accepted"
    const friendRequestsCollection = collection(FIRESTORE_DB, 'friendRequests');
    const requestDoc = doc(friendRequestsCollection, requestId);
    await updateDoc(requestDoc, {status: 'accepted'});

    // Add both users as friends (you can create a separate collection for friends)
    const friendsCollection = collection(FIRESTORE_DB, 'friends');
    await addDoc(friendsCollection, {
      friendId: senderEmail,
      userId: receiverId,
    });
    await addDoc(friendsCollection, {
      friendId: receiverId,
      userId: senderEmail,
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
    <View>
      <Text>Friend Requests:</Text>
      <FlatList
        data={friendRequests}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View>
            <Text>{item.senderEmail} wants to be your friend.</Text>
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
        )}
      />

      <View>
        <Pressable onPress={() => navigation.pop()}>
          <Text style={{color: 'blue'}}> Go Back </Text>
        </Pressable>
      </View>
      <Text>Friends:</Text>
      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View>
            <Text>{item.friendId} is your friend.</Text>
            <Button
              title="Delete"
              onPress={() => {
                deleteFriend(item.friendId);
              }}
            />
          </View>
        )}
      />
    </View>
  );
}
