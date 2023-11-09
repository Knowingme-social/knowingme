/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {useState} from 'react';
import {StyleSheet, View, Text, TextInput, Button, Alert} from 'react-native';
import React from 'react';
import {FIRESTORE_DB} from '../firebaseConfig';
import {addDoc, collection, serverTimestamp} from 'firebase/firestore';

export default function Question({navigation}) {
  const [answer1, SetAnswer1] = useState('');
  const [answer2, SetAnswer2] = useState('');
  const [answer3, SetAnswer3] = useState('');
  const [answer4, SetAnswer4] = useState('');
  const [DailyQuestion, setDailyQuestion] = useState('');

  // Function for daily question answer in order to populate answer in DB
  const DailyAnswer = async () => {
    const currentdate = new Date();
    const dateString = currentdate.toISOString().split('T')[0];
    await addDoc(collection(FIRESTORE_DB, 'dailyQuestion'), {
      questionOfTheDay: DailyQuestion,
      answer1: answer1,
      answer2: answer2,
      answer3: answer3,
      answer4: answer4,
      date: dateString,
      created: serverTimestamp(),
    });
    ////clears answer box after submition
    //SetAnswer('');
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.QuestionText}>Enter Daily Question</Text>
        <TextInput
          value={DailyQuestion}
          style={styles.input}
          placeholder="Daily Question"
          autoCapitalize="none"
          onChangeText={(text: string) => setDailyQuestion(text)}></TextInput>
      </View>
      <View>
        <Text style={styles.QuestionText}>Answer 1</Text>
        <TextInput
          value={answer1}
          style={styles.input}
          placeholder="Answer"
          autoCapitalize="none"
          onChangeText={(text: string) => SetAnswer1(text)}></TextInput>
        <Text style={styles.QuestionText}>Answer 2</Text>
        <TextInput
          value={answer2}
          style={styles.input}
          placeholder="Answer"
          autoCapitalize="none"
          onChangeText={(text: string) => SetAnswer2(text)}></TextInput>

        <Text style={styles.QuestionText}>Answer 3</Text>
        <TextInput
          value={answer3}
          style={styles.input}
          placeholder="Answer"
          autoCapitalize="none"
          onChangeText={(text: string) => SetAnswer3(text)}></TextInput>

        <Text style={styles.QuestionText}>Answer 4</Text>
        <TextInput
          value={answer4}
          style={styles.input}
          placeholder="Answer"
          autoCapitalize="none"
          onChangeText={(text: string) => SetAnswer4(text)}></TextInput>
      </View>
      <View>
        <Button
          onPress={() => {
            DailyAnswer();
            Alert.alert('Question created');
            SetAnswer1('');
            SetAnswer2('');
            SetAnswer3('');
            SetAnswer4('');
            setDailyQuestion('');
          }}
          title="Answer"
        />
        {/* <Button title="Go Back" onPress={() => navigation.pop()} /> */}
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
