/* eslint-disable semi */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {View, Text, TouchableOpacity, StyleSheet, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import {addDoc, collection, getDocs, query, where} from 'firebase/firestore';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {onAuthStateChanged} from 'firebase/auth';

type Question = {
  id: string;
  questionOfTheDay: string;
  email: string;
  answerOption1: string;
  answerOption2: string;
  answerOption3: string;
  answerOption4: string;
  usersAnswer: string;
  date: string;
};

export default function FriendsQuestions({navigation}) {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [friendIds, setFriendIds] = useState([]);
  const [questions, setQuestions] = useState<Question[]>([]);
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

        const extractedFriendIds: string[] = friendsData.map(friend => friend.friendId);
        setFriendIds(extractedFriendIds);
        loadQuestionsForFriends(extractedFriendIds);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    }
  };

  const loadQuestionsForFriends = async (friendIds: string[]) => {
    const unansweredQuestions: Question[] = [];

    for (const friendId of friendIds) {
      const dailyCollectionRef = collection(FIRESTORE_DB, 'friendsQuestions');
      const questionsFriends = query(
        dailyCollectionRef,
        where('email', '==', friendId),
      );

      const dailySnapshot = await getDocs(questionsFriends);

      for (const doc of dailySnapshot.docs) {
        const question = {id: doc.id, ...doc.data()} as Question;
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

  const isQuestionAnswered = async (
    friendId: string,
    questionId: string,
    date: string,
  ) => {
    const friendsAnswerCollectionRef = collection(
      FIRESTORE_DB,
      'friendsAnswers',
    );
    const friendAnswerQuery = query(
      friendsAnswerCollectionRef,
      where('userId', '==', user?.email),
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F8FF', // A light azure that's easy on the eyes.
    alignItems: 'center',
    justifyContent: 'space-around', // Evenly distribute space among children.
    padding: 20, // Add padding to avoid content sticking to edges.
  },
  questionContainer: {
    backgroundColor: 'grey', // A blanched almond color for a soft look.
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000', // Add shadow for a subtle depth effect.
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold', // Make the question stand out.
    color: '#a0fc9d', // A dark grey that's softer than black.
    marginBottom: 10, // Add space below the question.
  },
  answerContainer: {
    backgroundColor: '#FFF', // White answer blocks to stand out from the question container.
    borderWidth: 1,
    borderColor: '#ADD8E6', // Light blue border for a subtle contrast.
    marginTop: 10,
    borderRadius: 8,
    padding: 10, // Padding inside the answer blocks.
  },
  answerText: {
    fontSize: 16, // Slightly smaller than the question for hierarchy.
    color: '#104E8B', // A navy blue for a bit of color.
    textAlign: 'center', // Center the answer text.
  },
  selectedAnswer: {
    backgroundColor: '#90EE90', // A light green to indicate selection.
  },
  button: {
    backgroundColor: '#1E90FF', // Dodger blue for a vibrant button.
    color: '#FFFFFF', // White text on the button for contrast.
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF', // White text for readability.
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
