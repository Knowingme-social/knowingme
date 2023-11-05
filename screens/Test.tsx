/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { View, Text, TextInput, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Alert} from 'react-native';
import React, { useState } from 'react';

import { FIRESTORE_DB } from '../firebaseConfig';
import { collection, where, query, getDocs, doc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import { oneUser } from './EditProfile';
import { error } from 'firebase-functions/logger';

export default function Search() {
  const [users, setUsers] = useState<oneUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (search: string) => {
    if (search.trim() === "") {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const getUsersQuery = query(
        collection(FIRESTORE_DB, 'users'),
        where('displayName', '>=', search),
        where('displayName', '<=', search + '\uf8ff')
      );

      const snapshot = await getDocs(getUsersQuery);
      const fetchedUsers: oneUser[] = [];
      snapshot.forEach((doc) => {
        fetchedUsers.push(doc.data() as oneUser);
      });

      setUsers(fetchedUsers);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };
  // Firestore references
const friendRequestsRef = collection(FIRESTORE_DB, 'friendRequests');
const friendsRef = collection(FIRESTORE_DB, 'friends');

const handleAcceptedFriendRequest = async (requestId: string, senderId: string, receiverId: string) => {
  // Begin a batch write
  const batch = writeBatch(FIRESTORE_DB);

  // Get the friend request document
  const friendRequestDoc = doc(friendRequestsRef, requestId);

  // Update the status of the friend request to 'accepted'
  batch.update(friendRequestDoc, { status: 'accepted' });

  // Create new friend document for the sender
  const friendDocSender = doc(friendsRef);
  batch.set(friendDocSender, {
    userId: senderId,
    friendId: receiverId
  });

  // Create new friend document for the receiver
  const friendDocReceiver = doc(friendsRef);
  batch.set(friendDocReceiver, {
    userId: receiverId,
    friendId: senderId
  });

  // Commit the batch write
  try {
    await batch.commit();
    console.log('Friend request accepted and friends added.');
  } catch (error) {
    console.error('Error accepting friend request: ', error);
  }
};


  const addFriend = async (userId: string) => {
    const currentUserId = 'YOUR_CURRENT_USER_ID'; // Replace with actual current user ID

    const currentUserRef = doc(FIRESTORE_DB, 'users', currentUserId);
    const friendRef = doc(FIRESTORE_DB, 'users', userId);

    try {
      // Start a batch
      const batch = writeBatch(FIRESTORE_DB);

      // Update current user's friends list
      batch.update(currentUserRef, {
        friends: arrayUnion(userId) // Assuming 'friends' is an array of user IDs
      });

      // Update the new friend's friends list (optional, if you want to add current user to the friend's list)
      batch.update(friendRef, {
        friends: arrayUnion(currentUserId)
      });

      // Commit the batch
      await batch.commit();

      Alert.alert('Friend added successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Failed to add friend');
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search"
        onChangeText={fetchUsers}
      />
      {loading ? (
        <ActivityIndicator />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        keyExtractor={(item) => item.userId.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemContainer}>
            <Text style={styles.itemText}>
              {item.firstName} {item.lastName}
            </Text>
            <TouchableOpacity
                style={[styles.itemContainer, styles.addButton]}
              onPress={() => addFriend(item.userId)}>
              <Text>Add Friend</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
      
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  itemText: {
    fontSize: 18,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#fff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    width: 100,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,

    elevation: 5,
    flexDirection: 'row',
    backgroundGradient: {
      colors: ['#FFC371', '#FF5F6D'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 0 },
    },
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 5,
  },
});
