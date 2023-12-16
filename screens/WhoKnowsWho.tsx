/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable no-catch-shadow */
import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';

export default function WhoKnowsWho({navigation}) {
  const [selectedTab, setSelectedTab] = useState('bestKnownByYou');
  const [user, setUser] = useState(null);
  const [bestFriend, setBestFriend] = useState('');
  const [leastKnownFriend, setLeastKnownFriend] = useState('');
  const [mostKnowledgeableFriend, setMostKnowledgeableFriend] = useState('');
  const [friendStatistics, setFriendStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const animation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(animation, {
      toValue: selectedTab === 'bestKnownByYou' ? 0 : 1,
      useNativeDriver: true,
    }).start();
  }, [selectedTab, animation]);

  const slideInterpolate = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-69, 74], // Adjust this based on your tab's width
  });

  const animatedIndicatorStyle = {
    transform: [{translateX: slideInterpolate}],
  };

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

  const renderStatistics = () => {
    // Sort the friends based on accuracy or another relevant metric
    const sortedFriends = Object.entries(friendStatistics).sort((a, b) => {
      return b[1].percentage - a[1].percentage; // Sorting in descending order of accuracy
    });

    // Render each friend's statistics in a sorted manner
    return sortedFriends.map(([friend, stats], index) => (
      <View key={friend} style={styles.statRow}>
        <Text style={styles.rankText}>{index + 1}</Text>
        <Text style={styles.friendText}>
          {friend}: Correct: {stats.correct}, Incorrect: {stats.incorrect},
          Accuracy: {stats.percentage.toFixed(2)}%
        </Text>
      </View>
    ));
  };

  const renderContent = () => {
    switch (selectedTab) {
      case 'bestKnownByYou':
        return <Text>you know {bestFriend} the best</Text>;
        {
          renderStatistics();
        }
        <Text>Statistics for 'Best Known you'</Text>;
      case 'bestKnownByOthers':
        return <Text> {mostKnowledgeableFriend} knows you the best {renderStatistics()}</Text>;
        {
          renderStatistics();
        }
        <Text>Statistics for 'Best Known By Others'</Text>;
      case 'leastKnownByOthers':
        return <Text> {leastKnownFriend} knows you the worst they suck {renderStatistics()}</Text>;
        {
          
        }
        <Text>Statistics for 'Least Known By Others'</Text>;
      default:
        return null;
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.contentContainer}>

    </View>
      <View style={styles.tabs}>
        {/* The tabs themselves stay the same color */}
        <TouchableOpacity
          style={[styles.tab, styles.leftTab]}
          onPress={() => setSelectedTab('bestKnownByYou')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'bestKnownByYou' && styles.activeTabText,
            ]}>
            Who You Know
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, styles.rightTab]}
          onPress={() => setSelectedTab('bestKnownByOthers')}>
          <Text
            style={[
              styles.tabText,
              selectedTab === 'bestKnownByOthers' && styles.activeTabText,
            ]}>
            Who Knows You
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          style={[styles.tab, styles.leftTab]}
          onPress={() => setSelectedTab('leastKnownByOthers')}
        >
          <Text style={[styles.tabText, selectedTab === 'bestKnownByYou' && styles.activeTabText]}>Who You Know the worst</Text>
        </TouchableOpacity> */}
        {/* Animated indicator */}
        <Animated.View style={[styles.indicator, animatedIndicatorStyle]} />
      </View>
      <View style={styles.content}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 5,
    backgroundColor: '#ffffff', // Use a white or off-white background for each row
    marginHorizontal: 10, // Add horizontal margin for each row
    marginTop: 10, // Add top margin for each row
    borderRadius: 6, // Rounded corners for the rows
    borderWidth: 1,
    borderColor: '#eaeaea', // A very light border for each row
    paddingHorizontal: 10, // Horizontal padding within the card
    justifyContent: 'space-around', // This will distribute space evenly
  },
  rankText: {
    fontWeight: 'bold',
    fontSize: 18, // Larger font size for rank
    color: 'white', // A distinct color for the rank
    marginRight: 12,
    backgroundColor: '#4a90e2', // Use a background color for the rank circle
    borderRadius: 15, // Make the rank a circle or rounded square
    width: 300, // Set width for the rank circle
    height: 30, // Set height for the rank circle
    textAlign: 'center', // Ensure the text is centered
    lineHeight: 30, // Center the text vertically
  },
  friendText: {
    fontSize: 16, // Readable font size
    color: '#333', // A neutral color for text
    flexShrink: 1, // This will allow the text to shrink and fit into the available space
    marginRight: 10, // Add some right margin if necessary
  },
  
  slider: {
    position: 'absolute',
    height: 20,
    width: '50%', // Assuming each tab is half the width of the container
    backgroundColor: 'black', // Active tab color
    borderRadius: 20, // Match your tabs' borderRadius
    // Add other styling if needed
  },
  card: {
    backgroundColor: '#fffff',
    fontFamily: 'Times New Roman',
    // marginHorizontal: 20, // Added horizontal margin to provide space on both sides
    marginTop: 100,
    shadowColor: '#000', // Added shadow for a nice elevation effect
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    height: 500,
    overflow: 'hidden',
    zIndex: -2,
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center', // Adjusted for center alignment
    backgroundColor: '#fff', // Corrected color from '#white' to '#fff'
    borderRadius: 30,
    overflow: 'hidden',
    marginHorizontal: 60,
  },
  tab: {
    flex: 1,
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
    // Tabs have their default color
    backgroundColor: 'grey',
  },
  activeTabText: {
    color: 'white', // Text color for active tab
    fontWeight: 'bold',
  },
  tabText: {
    color: '#ffe0de', // Default tab text color
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    height: 5,
    width: '50%', // Set this to match the width of your tabs
    backgroundColor: 'black', // Indicator color
    borderRadius: 2,
  },
  leftTab: {
    borderTopLeftRadius: 20, // Rounded corners for the left tab
    borderBottomLeftRadius: 20,
  },
  rightTab: {
    borderTopRightRadius: 20, // Rounded corners for the right tab
    borderBottomRightRadius: 20,
  },
  content: {
    padding: 20,
    paddingTop: 20, // Space between the top text and the leaderboard
    paddingBottom: 50, // Space at the bottom
    alignItems: 'center', // Center the leaderboard horizontally
    justifyContent: 'flex-end', // Align the leaderboard to the bottom
    flex: 1, // Takes up all available space
  },
});
