/* eslint-disable semi */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {View, Text, TouchableOpacity, StyleSheet, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import {addDoc, collection, getDocs, query, where} from 'firebase/firestore';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';

export default function FriendsQuestions({navigation}) {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [questionDate, setQuestionDate] = useState('');
  const [friendsEmail, setFriendsEmail] = useState('');
  const [questionId, setQuestionId] = useState('');
  useEffect(() => {
    onAuthStateChanged(FIREBASE_AUTH, user => {
      setUser(user);
    });
  }, []);

  useEffect(() => {
    if (user) {
      getFriends();
    }
  }, [user]);

  const getFriends = async () => {
    if (user) {
      const friendsCollection = collection(FIRESTORE_DB, 'friends');
      const friendsQuery = query(
        friendsCollection,
        where('userId', '==', user.email),
      );

      try {
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsData = friendsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFriends(friendsData);

        const extractedFriendIds = friendsData.map(friend => friend.friendId);
        setFriendIds(extractedFriendIds);
        loadQuestionsForFriends(extractedFriendIds);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    }
  };

  const loadQuestionsForFriends = async friendIds => {
    const unansweredQuestions = [];

    for (const friendId of friendIds) {
      const dailyCollectionRef = collection(FIRESTORE_DB, 'friendsQuestions');
      const questionsFriends = query(
        dailyCollectionRef,
        where('email', '==', friendId),
      );

      const dailySnapshot = await getDocs(questionsFriends);

      for (const doc of dailySnapshot.docs) {
        const question = {id: doc.id, ...doc.data()};
        console.log(`Checking question: ${question.id}`);
        const isAnswered = await isQuestionAnswered(
          friendId,
          question.id,
          question.date,
        );
        console.log(`Question ID: ${question.id}, Answered: ${isAnswered}`);
        if (!isAnswered) {
          unansweredQuestions.push(question);
        }
      }
    }

    setQuestions(unansweredQuestions);
  };

  const isQuestionAnswered = async (friendId, questionId, date) => {
    const friendsAnswerCollectionRef = collection(
      FIRESTORE_DB,
      'friendsAnswers',
    );
    const friendAnswerQuery = query(
      friendsAnswerCollectionRef,
      where('userId', '==', user.email),
      where('questionID', '==', questionId),
      where('date', '==', date),
    );

    const friendAnswerSnapshot = await getDocs(friendAnswerQuery);
    return !friendAnswerSnapshot.empty;
  };
  const selectAnswer = async () => {
    await addDoc(collection(FIRESTORE_DB, 'friendsAnswers'), {
      usersAnswer: selectedAnswer,
      userId: user.email,
      date: questionDate,
      friendsId: friendsEmail,
      questionID: questionId,
    });
    if (friendIds.length > 0) {
      loadQuestionsForFriends(friendIds);
    }
  };
  useEffect(() => {
    if (selectedAnswer && questionDate && friendsEmail && questionId) {
      selectAnswer();
    } else {
      console.log('still waiting');
    }
  }, [selectedAnswer, questionDate, friendsEmail, questionId]);

  // console.log(friendIds);
  // console.log(questions);
  //console.log(individualQuestion);
  const questionsToDisplay = questions.slice(0, 1);

  return (
    <View style={styles.container}>
      {questionsToDisplay.length > 0 ? (
        questionsToDisplay.map((item, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{item.questionOfTheDay}</Text>
            <Text style={styles.questionText}>{item.email}</Text>

            {[
              'answerOption1',
              'answerOption2',
              'answerOption3',
              'answerOption4',
            ].map((answer, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  if (item[answer] === item.usersAnswer) {
                    setSelectedAnswer('correct');
                    setQuestionDate(item.date);
                    setFriendsEmail(item.email);
                    setQuestionId(item.id);
                  } else {
                    setSelectedAnswer('incorrect');
                    setQuestionDate(item.date);
                    setFriendsEmail(item.email);
                    setQuestionId(item.id);
                  }

                  // selectAnswer(item[answer], item.email, item.date);
                  // console.log('I was pressed');
                }}
                style={[
                  styles.answerContainer,
                  selectedAnswer === item[answer]
                    ? styles.selectedAnswer
                    : null,
                ]}>
                <Text style={styles.answerText}>{item[answer]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      ) : (
        <Text>No more questions available at the moment.</Text>
      )}

      <Button title="Go Back" onPress={() => navigation.pop()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionContainer: {
    backgroundColor: '@DDDDDD',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  questionText: {
    fontSize: 16,
    color: 'black',
  },
  dateText: {
    fontSize: 12,
    color: 'black',
    alignItems: 'center',
    justifyContent: 'center',
  },
  answerText: {
    color: 'blue',
    padding: 5,
    fontSize: 14,
  },
  answerContainer: {
    borderBlockColor: 'black',
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 8,
  },
  selectedAnswer: {
    backgroundColor: 'green',
  },
});
