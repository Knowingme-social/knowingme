/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';

export default function WhoKnowsWho({navigation}) {
  const [user, setUser] = useState(null);
  const [bestFriend, setBestFriend] = useState('');
  const [leastKnownFriend, setLeastKnownFriend] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        setBestFriend('');
        setLeastKnownFriend('');
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      setError('');
      fetchFriend('correct', setBestFriend);
      fetchFriend('incorrect', setLeastKnownFriend);
    }
  }, [user]);

  const fetchFriend = async (answerType, setFriendState) => {
    const friendsCollectionRef = collection(FIRESTORE_DB, 'friends');
    const friendsQuery = query(
      friendsCollectionRef,
      where('userId', '==', user?.email),
    );

    try {
      const friendsSnapshot = await getDocs(friendsQuery);
      if (friendsSnapshot.empty) {
        console.log('No friends found.');
        return;
      }

      const friendsData = friendsSnapshot.docs.map(doc => doc.data());
      const scoreCard = {};

      for (const friend of friendsData) {
        const friendsAnswersRef = collection(FIRESTORE_DB, 'friendsAnswers');
        const answersQuery = query(
          friendsAnswersRef,
          where('userId', '==', user.email),
          where('friendsId', '==', friend.friendId),
          where('usersAnswer', '==', answerType),
        );

        const answersSnapshot = await getDocs(answersQuery);
        scoreCard[friend.friendId] = answersSnapshot.docs.length;
      }

      if (Object.keys(scoreCard).length > 0) {
        const friendId = Object.keys(scoreCard).reduce((a, b) =>
          scoreCard[a] > scoreCard[b] ? a : b,
        );
        const friendData = friendsData.find(
          friend => friend.friendId === friendId,
        );
        setFriendState(friendData.friendId);
      } else {
        console.log(`No ${answerType} answers to compare.`);
      }
    } catch (error) {
      console.error(`Error finding ${answerType} friend:`, error);
      setError(`Error finding ${answerType} friend.`);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
        <Button title="Go Back" onPress={() => navigation.pop()} />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>You know {bestFriend} the best!</Text>
      <Text>You know {leastKnownFriend} the least.</Text>
      <Button title="Go Back" onPress={() => navigation.pop()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
