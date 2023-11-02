/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import {View, Text, StyleSheet, TouchableOpacity, Button} from 'react-native';
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {collection, getDocs, query, where} from 'firebase/firestore';
import {FIRESTORE_DB} from '../firebaseConfig';

export default function DailyQuestion({navigation}) {
  const [currentQuestion, setcurrentQuestion] = useState([]);
  const [dailyAnswer, setDailyAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  // //in case we will need to keep score for multiple answers
  // const [score, setScore] = useState(0);

  useEffect(() => {
    const loadQuestion = async () => {
      const currentdate = new Date();
      const dateString = currentdate.toISOString().split('T')[0];

      const questionCollection = query(
        collection(FIRESTORE_DB, 'dailyQuestion'),
        where('date', '==', dateString),
      );

      const questionSnapshot = await getDocs(questionCollection);
      const dailyQuestions = questionSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check if there are daily questions for today
      if (dailyQuestions.length > 0) {
        // Access the first question (you may want to iterate over all if there are multiple)
        const firstQuestion = dailyQuestions[0];
        setcurrentQuestion(firstQuestion);
      } else {
        // Handle the case when there are no questions for today
        console.log('No questions for today');
      }
    };
    loadQuestion();
  }, []);

  const questionofDay = currentQuestion
    ? currentQuestion.questionOfTheDay
    : null;
  const answer1 = currentQuestion ? currentQuestion.answer1 : null;
  const answer2 = currentQuestion ? currentQuestion.answer2 : null;
  const answer3 = currentQuestion ? currentQuestion.answer3 : null;
  const answer4 = currentQuestion ? currentQuestion.answer4 : null;
  const answers = [answer1, answer2, answer3, answer4];
  //console.log(answer4);

  const answerOfTheDay = async () => {
    try {
      await AsyncStorage.setItem('answer', dailyAnswer);
      await AsyncStorage.setItem('question', questionofDay);
      await AsyncStorage.setItem('answer1', answer1);
      await AsyncStorage.setItem('answer2', answer2);
      await AsyncStorage.setItem('answer3', answer3);
      await AsyncStorage.setItem('answer4', answer4);

      console.log(`updated ${dailyAnswer}`);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  const nextScreen = async () => {
    navigation.push('CheckScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{questionofDay}</Text>
        {answers.map((item, index) => {
          return (
            <TouchableOpacity
              onPress={() => {
                setDailyAnswer(item);
                console.log(dailyAnswer);
                setSelectedAnswer(item);
              }}
              style={
                (styles.answerContainer,
                selectedAnswer === item ? styles.selectedAnswer : null)
              }
              key={index}>
              <Text style={styles.answerText}> {item} </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View>
        <Button
          title="Answer"
          disabled={!dailyAnswer}
          onPress={() => {
            answerOfTheDay();
            nextScreen();
          }}
        />
      </View>
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
    fontSize: 24,
    color: 'black',
  },
  answerText: {
    color: 'blue',
    padding: 5,
    fontSize: 18,
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

// //checking for answer comparasment(for later friends answers comparesment)
// //dailyAnswer is the answer that was chosen by user
// const checkAnswer = dailyAnswer => {
//   //users original answer
//   const answer = quizData[currentQuestion]?.answer;
//   if (answer === dailyAnswer) {
//      setScore((prevScore) => prevScore + 1);
//     Alert.alert('right answer');
//   } else {
//     Alert.alert('You missed it!');
//   }
// };
