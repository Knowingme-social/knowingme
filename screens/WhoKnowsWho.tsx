/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';

export default function WhoKnowsWho({navigation}) {
  const [user, setUser] = useState(null);
  const [bestFriend, setBestFriend] = useState('');
  const [leastKnownFriend, setLeastKnownFriend] = useState('');
  const [mostKnowledgeableFriend, setMostKnowledgeableFriend] = useState('');
  const [friendStatistics, setFriendStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, currentUser => {
      setUser(currentUser);
      if (!currentUser) {
        resetStates();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      resetStates();
      fetchFriendData();
    }
  }, [user]);

  const resetStates = () => {
    setBestFriend('');
    setLeastKnownFriend('');
    setMostKnowledgeableFriend('');
    setFriendStatistics({});
    setLoading(false);
  };

  const fetchFriendData = async () => {
    setLoading(true);
    setError('');

    try {
      // Query for friends
      const friendsCollectionRef = collection(FIRESTORE_DB, 'friends');
      const friendsQuery = query(
        friendsCollectionRef,
        where('userId', '==', user?.email),
      );
      const friendsSnapshot = await getDocs(friendsQuery);
      if (friendsSnapshot.empty) {
        console.log('No friends found.');
        return;
      }

      const friendsData = friendsSnapshot.docs.map(doc => doc.data());
      const scoreCard = {};
      const friendStats = {};
      let mostCorrectAnswersCount = 0;

      // Collect data for each friend
      for (const friend of friendsData) {
        const friendsAnswersRef = collection(FIRESTORE_DB, 'friendsAnswers');
        // Query for correct and incorrect answers separately
        const correctAnswersQuery = query(
          friendsAnswersRef,
          where('userId', '==', user.email),
          where('friendsId', '==', friend.friendId),
          where('usersAnswer', '==', 'correct'),
        );
        const incorrectAnswersQuery = query(
          friendsAnswersRef,
          where('userId', '==', user.email),
          where('friendsId', '==', friend.friendId),
          where('usersAnswer', '==', 'incorrect'),
        );

        const [correctSnapshot, incorrectSnapshot] = await Promise.all([
          getDocs(correctAnswersQuery),
          getDocs(incorrectAnswersQuery),
        ]);

        const correctCount = correctSnapshot.docs.length;
        const incorrectCount = incorrectSnapshot.docs.length;

        scoreCard[friend.friendId] = correctCount - incorrectCount;
        friendStats[friend.firstName + ' ' + friend.lastName] = {
          correct: correctCount,
          incorrect: incorrectCount,
          percentage:
            correctCount + incorrectCount > 0
              ? (correctCount / (correctCount + incorrectCount)) * 100
              : 0,
        };

        // Find the most knowledgeable friend
        if (correctCount > mostCorrectAnswersCount) {
          mostCorrectAnswersCount = correctCount;
          setMostKnowledgeableFriend(friend.firstName + ' ' + friend.lastName);
        }
      }

      // Determine the best and least known friends
      if (Object.keys(scoreCard).length > 0) {
        setBestFriend(findFriendWithHighestScore(scoreCard, friendsData));
        setLeastKnownFriend(findFriendWithLowestScore(scoreCard, friendsData));
      }

      setFriendStatistics(friendStats);
    } catch (error) {
      console.error('Error fetching friend data:', error);
      setError('Error fetching friend data.');
    } finally {
      setLoading(false);
    }
  };

  const findFriendWithHighestScore = (scores, friendsData) =>
    findFriendWithExtremeScore(
      scores,
      friendsData,
      (a, b) => scores[a] > scores[b],
    );

  const findFriendWithLowestScore = (scores, friendsData) =>
    findFriendWithExtremeScore(
      scores,
      friendsData,
      (a, b) => scores[a] < scores[b],
    );

  const findFriendWithExtremeScore = (scores, friendsData, comparator) => {
    const friendId = Object.keys(scores).reduce((a, b) =>
      comparator(a, b) ? a : b,
    );
    const friendData = friendsData.find(friend => friend.friendId === friendId);
    return friendData.firstName + ' ' + friendData.lastName;
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

  // Create a function to render statistics for each friend
  const renderStatistics = () => {
    return Object.entries(friendStatistics).map(([friend, stats]) => (
      <View key={friend}>
        <Text>
          {friend}: Correct: {stats.correct}, Incorrect: {stats.incorrect},
          Accuracy: {stats.percentage.toFixed(2)}%
        </Text>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <Text>You know {bestFriend} the best!</Text>
      <Text>You know {leastKnownFriend} the least.</Text>
      <Text>{mostKnowledgeableFriend} knows you the best!</Text>
      {renderStatistics()}
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
