/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {useState} from 'react';
import {StyleSheet, View, Text, TextInput, Button} from 'react-native';
import React from 'react';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';

export default function Question({navigation}) {
  const [answer, SetAnswer] = useState('');

  let DailyQuestion = 'What is your favorite Pizza topping';

  // Function for daily question answer in order to populate answer in DB
  const DailyAnswer = async () => {
    await addDoc(collection(FIRESTORE_DB, 'DailyQuestionAnswer'), {
      questionOfTheDay: DailyQuestion,
      answer: answer,
      done: true,
      created: serverTimestamp(),
      user: FIREBASE_AUTH.currentUser?.uid,
    });
    //clears answer box after submition
    SetAnswer('');
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.QuestionText}>{DailyQuestion}</Text>
        <TextInput
          value={answer}
          style={styles.input}
          placeholder="Answer"
          autoCapitalize="none"
          onChangeText={(text: string) => SetAnswer(text)}></TextInput>
        <Button onPress={() => DailyAnswer()} title="Answer" />
        <Button title="Go Back" onPress={() => navigation.pop()} />
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
  input: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  QuestionText: {
    padding: 10,
    fontSize: 20,
  },
});
