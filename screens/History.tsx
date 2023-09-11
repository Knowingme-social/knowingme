/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {useState, useEffect} from 'react';
import {StyleSheet, View, Text, FlatList, Button} from 'react-native';
import React from 'react';
import {FIRESTORE_DB} from '../firebaseConfig';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import TrashIcon from 'react-native-vector-icons/Entypo';

export interface Daily {
  answer: string;
  created: Object;
  done: boolean;
  id: string;
  questionOfTheDay: string;
}

export default function History({navigation}) {
  const [dailyData, setDailyData] = useState<Daily[]>([]);

  useEffect(() => {
    // create a reference for DB collection
    const dailyQuestionRef = collection(FIRESTORE_DB, 'DailyQuestionAnswer');

    // create a subscriber in order to get snapshots from DB without manualy pulling it
    const subscriber = onSnapshot(dailyQuestionRef, {
      next: snapshot => {
        //console.log("updated");

        const dailyData: Daily[] = [];
        snapshot.docs.forEach(doc => {
          dailyData.push({
            id: doc.id,
            ...doc.data(),
          } as Daily);
        });
        setDailyData(dailyData);
        //console.log(dailyData);
      },
    });
    // kill the loop for one iteration
    return () => subscriber();
  }, []);

  //render data for list and create delete function
  const renderData = ({item}: any) => {
    const ref = doc(FIRESTORE_DB, `DailyQuestionAnswer/${item.id}`);

    const deleteItem = async () => {
      deleteDoc(ref);
    };

    return (
      <View style={styles.container}>
        <Text style={styles.QuestionText}>
          Question: {item.questionOfTheDay}
        </Text>
        <Text style={styles.AnswerText}>Answer: {item.answer}</Text>

        <TrashIcon name="trash" size={24} color="red" onPress={deleteItem} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {dailyData.length >= 0 && (
        <FlatList
          data={dailyData}
          renderItem={item => renderData(item)}
          keyExtractor={(dailyData: Daily) => dailyData.id}
        />
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
  QuestionText: {
    flex: 1,
    padding: 10,
    fontSize: 17,
  },
  AnswerText: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    color: 'blue',
  },
});
