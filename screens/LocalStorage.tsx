/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */

import {StyleSheet, Text, View, Button, TextInput} from 'react-native';
import React, {useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LocalStorage({navigation}) {
  const [answer, setAnswer] = useState('');

  let questionOfTheDay = 'I am a question!';

  //Collects answer of the day
  const answerOfTheDay = async () => {
    try {
      await AsyncStorage.setItem('answer', answer);
      //setAnswer('');

      console.log(`updated ${answer}`);
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  //takes you to login screen on answer submission
  const nextScreen = async () => {
    navigation.push('CheckScreen');

    //console.log("I worked");
  };

  //clears answer of the day from Async storage
  const clearDailyAnswer = async () => {
    try {
      // Get the current date and time
      const currentTime = new Date().getTime();

      // Calculate the time until midnight (in milliseconds)
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = midnight.getTime() - currentTime;

      // Schedule the function to run at midnight
      setTimeout(async () => {
        // Clear the answer
        await AsyncStorage.removeItem('answer');

        // Update the last clear time
        await AsyncStorage.setItem('lastClearTime', currentTime.toString());

        console.log('Answer cleared at midnight.');

        // Schedule the function to run again for the next midnight
        clearDailyAnswer();
      }, timeUntilMidnight);

      console.log('Clear function scheduled for midnight.');
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  // Call the function to start the process
  clearDailyAnswer();

  // Run the function initially
  clearDailyAnswer();

  // Set up a setInterval to run the function every 24 hours
  setInterval(clearDailyAnswer, 24 * 60 * 60 * 1000);

  const clearAnswerForTesting = async () => {
    try {
      await AsyncStorage.multiRemove([
        'answer',
        'question',
        'answer1',
        'answer2',
        'answer3',
        'answer4',
      ]);
      console.log('Cleared answer and question from AsyncStorage');
    } catch (error) {
      console.error('Error clearing items:', error);
    }
  };
  return (
    <View style={styles.container}>
      <Text>{questionOfTheDay}</Text>
      <TextInput
        style={styles.input}
        placeholder="answer"
        onChangeText={(text: string) => setAnswer(text)}
        value={answer}
      />
      <Button
        title="Answer"
        disabled={!answer}
        onPress={() => {
          answerOfTheDay();
          nextScreen();
        }}
      />
      <Button title="Clear" onPress={clearAnswerForTesting} />
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
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
});
