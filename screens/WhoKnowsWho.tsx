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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, setUser);
    return unsubscribe; // Remember to unsubscribe on component unmount
  }, []);

  useEffect(() => {
    if (user) {
      fetchBestFriend();
    }
  }, [user]);

  const fetchBestFriend = async () => {
    const friendsCollectionRef = collection(FIRESTORE_DB, 'friends');
    const friendsQuery = query(
      friendsCollectionRef,
      where('userId', '==', user.email),
    );

    try {
      const friendsSnapshot = await getDocs(friendsQuery);
      if (!friendsSnapshot.empty) {
        const friendsData = friendsSnapshot.docs.map(doc => doc.data());

        const scoreCard = {}; // This object will hold the scores

        for (const friend of friendsData) {
          const friendsAnswersRef = collection(FIRESTORE_DB, 'friendsAnswers');
          const correctAnswersQuery = query(
            friendsAnswersRef,
            where('userId', '==', user.email),
            where('friendsId', '==', friend.friendId),
            where('usersAnswer', '==', 'correct'),
          );

          const correctAnswersSnapshot = await getDocs(correctAnswersQuery);
          if (!correctAnswersSnapshot.empty) {
            scoreCard[friend.friendId] = correctAnswersSnapshot.docs.length;
          } else {
            console.log(
              `No correct answers found for friendId: ${friend.friendId}`,
            );
          }
        }

        if (Object.keys(scoreCard).length > 0) {
          const bestFriendId = Object.keys(scoreCard).reduce((a, b) =>
            scoreCard[a] > scoreCard[b] ? a : b,
          );
          const bestFriendData = friendsData.find(
            friend => friend.friendId === bestFriendId,
          );
          setBestFriend(bestFriendData.name); // Assuming there is a 'name' field in friend's data
        } else {
          console.log('No scores to compare.');
        }
      } else {
        console.log('No friends found.');
      }
    } catch (error) {
      console.error('Error finding best friend:', error);
    }
  };

  return (
    <View style={styles.container}>
      {bestFriend ? (
        <Text>You know {bestFriend} the best!</Text>
      ) : (
        <Text>Calculating who you know best...</Text>
      )}
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
