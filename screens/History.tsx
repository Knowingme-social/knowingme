/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Button, TouchableOpacity } from 'react-native';
import React from 'react';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../firebaseConfig';
import {
  collection,
  deleteDoc,
  doc,
  where,
  onSnapshot,
  updateDoc,
  query,
} from 'firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';

export interface Daily {
  answer: string;
  created: Object;
  done: boolean;
  id: string;
  questionOfTheDay: string;
  user: string;
}

export default function History({ navigation }) {
  const [dailyData, setDailyData] = useState<Daily[]>([]);
  const uid = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    //create a reference for DB collection and query it by uid for
    //specific user only
    const dailyQuestionRef = query(
      collection(FIRESTORE_DB, 'DailyQuestionAnswer'),
      where('user', '==', uid),
    );

    // create a subscriber in order to get snapshots from DB
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
  }, [uid]);

  //render data for list and create delete function
  const renderData = ({ item }: any) => {
    const ref = doc(FIRESTORE_DB, `DailyQuestionAnswer/${item.id}`);

    const deleteItem = async () => {
      deleteDoc(ref);
    };

    return (
      <View style={styles.container}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>
            {item.questionOfTheDay}
          </Text>
        </View>
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>
            {item.answer}
          </Text>
          <TouchableOpacity onPress={deleteItem}>
            <Entypo name="trash" size={24} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, {marginBottom: 10}]}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Daily Answers</Text>
      </View>
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
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',

  },
  header: {
    backgroundColor: '#4B0082',
    width: '100%',
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
    borderRadius: 10,
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  answerContainer: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 20,
    borderRadius: 10,
  },
  answerText: {
    fontSize: 14,
    color: '#4B0082',
    flex: 1,
  },
});
