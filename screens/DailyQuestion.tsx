/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/self-closing-comp */
/* eslint-disable semi */
/* eslint-disable prettier/prettier */
import { View, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FIRESTORE_DB } from '../firebaseConfig';
import { ThemedButton } from 'react-native-really-awesome-button';


export default function DailyQuestion({ navigation }) {
  const [currentQuestion, setcurrentQuestion] = useState([]);
  const [dailyAnswer, setDailyAnswer] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');

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

      if (dailyQuestions.length > 0) {
        const firstQuestion = dailyQuestions[0];
        setcurrentQuestion(firstQuestion);
      } else {
        console.log('No questions for today');
      }
    };
    loadQuestion();
  }, []);

  const questionofDay = currentQuestion ? currentQuestion.questionOfTheDay : null;
  const answer1 = currentQuestion ? currentQuestion.answer1 : null;
  const answer2 = currentQuestion ? currentQuestion.answer2 : null;
  const answer3 = currentQuestion ? currentQuestion.answer3 : null;
  const answer4 = currentQuestion ? currentQuestion.answer4 : null;
  const answers = [answer1, answer2, answer3, answer4];

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
      {answers.map((item, index) => (
        <ThemedButton
        name="cartman"
        type='primary'
        width={300}
          key={index}
          backgroundDarker="#0056b3"
          textColor="#fff"
          onPress={() => {
            setDailyAnswer(item);
            setSelectedAnswer(item);
          }}
          style={selectedAnswer === item ? styles.selectedAnswer : {}}
        >
          {item}
        </ThemedButton>
      ))}
    </View>
    <ThemedButton
    name="cartman"
    type='primary'
      backgroundDarker="#0056b3"
      textColor="#fff"
      onPress={() => {
        answerOfTheDay();
        nextScreen();
      }}
      disabled={!dailyAnswer}
    >
      Answer
    </ThemedButton>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  questionContainer: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: '#000', // Adding shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  questionText: {
    fontSize: 22,
    color: '#333333', // Dark color for text
    fontWeight: 'bold',
    marginBottom: 20,
  },
  answerText: {
    color: 'black', // White text on buttons
    fontSize: 18,
  },
  answerContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginVertical: 10,
  },
  selectedAnswer: {
    backgroundColor: '#34C759', // Green for selected answers
  },
});
