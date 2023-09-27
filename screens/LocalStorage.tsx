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
      await AsyncStorage.removeItem('answer');

      console.log(`updated ${answer}`);
    } catch (error) {
      console.error(`Error: ${error}`);
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
      <Button title="Clear" onPress={clearDailyAnswer} />
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

// //for async data testing
// const getData = async () => {
//   try {
//     const answer = await AsyncStorage.getItem('answer');
//     if (answer !== null) {
//       console.log(answer);
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };
