/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {Button, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {options} from '@react-native-community/cli-platform-android/build/commands/buildAndroid';

export default function MissedQuestionsOfTheDay({navigation}) {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState({
    answer: '',
    question: '',
    date: '',
  });
  const [answerOption1, setAnsweroption1] = useState('');
  const [answerOption2, setAnsweroption2] = useState('');
  const [answerOption3, setAnsweroption3] = useState('');
  const [answerOption4, setAnsweroption4] = useState('');
  const uid = FIREBASE_AUTH.currentUser?.uid;

  const loadQuestions = async () => {
    const answerDate = async item => {
      const docRef = doc(FIRESTORE_DB, `answers/${uid}/daily/${item.date}`);
      const docSnap = await getDoc(docRef);

      return docSnap.exists() ? docSnap.data().date : null;
    };

    const questionCollection = collection(FIRESTORE_DB, 'dailyQuestion');
    const questionSnapshot = await getDocs(questionCollection);

    const dailyQuestions = await Promise.all(
      questionSnapshot.docs.map(async doc => {
        const item = {id: doc.id, ...doc.data()};
        const dateFromAnswer = await answerDate(item);
        return dateFromAnswer !== item.date ? item : null;
      }),
    );

    setQuestions(dailyQuestions.filter(q => q !== null));
  };

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const selectAnswer = (answer, question, date) => {
    setSelectedAnswer(answer);
    setSelectedQuestion({answer, question, date});
  };

  // const answerOption1 = `${item.answer1}`;
  // console.log(answerOption1);
  const answerOfTheDayDatabase = async () => {
    try {
      const {question, answer, date} = selectedQuestion;

      const userDocRef = doc(FIRESTORE_DB, 'answers', uid, 'daily', date);
      const dateDoc = await getDoc(userDocRef);
      const friendsQuestions = doc(
        collection(FIRESTORE_DB, 'friendsQuestions'),
      );
      const addFriendsQuestion = await getDoc(friendsQuestions);

      if (dateDoc.exists()) {
        console.log(`Answer for ${date} already exists.`);
        return;
      }
      if (addFriendsQuestion.exists()) {
        console.log(`Answer for ${date} already exists.`);
        return;
      }

      await setDoc(userDocRef, {
        questionOfTheDay: question,
        usersAnswer: answer,
        answerOption1: answerOption1,
        answerOption2: answerOption2,
        answerOption3: answerOption3,
        answerOption4: answerOption4,
        alreadyAnswered: true,
        date: date,
        timestamp: serverTimestamp(),
        email: FIREBASE_AUTH.currentUser?.email,
        userId: uid,
      });
      await setDoc(friendsQuestions, {
        questionOfTheDay: question,
        usersAnswer: answer,
        answerOption1: answerOption1,
        answerOption2: answerOption2,
        answerOption3: answerOption3,
        answerOption4: answerOption4,
        alreadyAnswered: true,
        date: date,
        timestamp: serverTimestamp(),
        email: FIREBASE_AUTH.currentUser?.email,
        userId: uid,
      });
      console.log(`Answer for ${date} saved.`);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  const questionsToDisplay = questions.slice(0, 1);

  return (
    <View style={styles.container}>
      {questionsToDisplay.length > 0 ? (
        questionsToDisplay.map((item, index) => (
          <View key={index} style={styles.questionContainer}>
            <Text style={styles.questionText}>{item.questionOfTheDay}</Text>
            <Text style={styles.dateText}>{item.date}</Text>

            {['answer1', 'answer2', 'answer3', 'answer4'].map((answer, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setAnsweroption1(item.answer1);
                  setAnsweroption2(item.answer2);
                  setAnsweroption3(item.answer3);
                  setAnsweroption4(item.answer4);
                  selectAnswer(item[answer], item.questionOfTheDay, item.date);
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
      <View>
        <Button
          title="Answer"
          disabled={!selectedQuestion.answer}
          onPress={answerOfTheDayDatabase}
        />
      </View>
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
