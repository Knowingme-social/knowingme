/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';

export default function WhoKnowsWhoCard (){
  const [selectedTab, setSelectedTab] = useState('bestKnownByYou');
  const [user, setUser] = useState(null);
  const [bestFriend, setBestFriend] = useState('');
  const [leastKnownFriend, setLeastKnownFriend] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const renderContent = () => {
    switch (selectedTab) {
      case 'bestKnownByYou':
        return <Text>you know {bestFriend} the best</Text>;
      case 'bestKnownByOthers':
        return <Text> {leastKnownFriend} knows you the best</Text>;
      default:
        return null;
    }
  };

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
    <View style={styles.card}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'bestKnownByYou' && styles.activeTab, styles.leftTab]}
          onPress={() => setSelectedTab('bestKnownByYou')}
        >
          <Text style={styles.tabText}>Who You Know the Best</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'bestKnownByOthers' && styles.activeTab, styles.rightTab]}
          onPress={() => setSelectedTab('bestKnownByOthers')}
        >
          <Text style={styles.tabText}>Who Knows You the Best</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    fontFamily: 'Times New Roman',
    // marginHorizontal: 20, // Added horizontal margin to provide space on both sides
    marginTop: 100,
    shadowColor: '#000', // Added shadow for a nice elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 700,
    overflow: 'hidden',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center', // Adjusted for center alignment
    backgroundColor: '#fff', // Corrected color from '#white' to '#fff'
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 20,
  },
  tab: {
    flex: 1, // Makes the tabs fill the container equally
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center', // Center the text vertically and horizontally
  },
  leftTab: {
    borderTopLeftRadius: 20, // Rounded corners for the left tab
    borderBottomLeftRadius: 20,
  },
  rightTab: {
    borderTopRightRadius: 20, // Rounded corners for the right tab
    borderBottomRightRadius: 20,
  },
  activeTab: {
    backgroundColor: 'black',
  },
  tabText: {
    color: '#ffe0de',
    fontWeight: 'bold',
  },
  content: {
    padding: 20,
  },
});
