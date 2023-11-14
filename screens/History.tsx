/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {useState, useEffect} from 'react';
import {StyleSheet, View, Text, FlatList, Button} from 'react-native';
import React from 'react';
import {FIRESTORE_DB, FIREBASE_AUTH} from '../firebaseConfig';
import {collection, deleteDoc, doc, onSnapshot} from 'firebase/firestore';
import Entypo from 'react-native-vector-icons/Entypo';

export interface Daily {
  answer: string;
  date: Object;
  timestamp: Object;

  email: string;
  questionOfTheDay: string;
  userId: string;
}

export default function History({navigation}) {
  const [dailyData, setDailyData] = useState<Daily[]>([]);
  const uid = FIREBASE_AUTH.currentUser?.uid;

  useEffect(() => {
    //create a reference for DB collection and query it by uid for
    //specific user only
    const userDocRef = doc(collection(FIRESTORE_DB, 'answers'), uid);
    const answersCollectionRef = collection(userDocRef, 'daily');

    // create a subscriber in order to get snapshots from DB
    const subscriber = onSnapshot(answersCollectionRef, {
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
  const renderData = ({item}: any) => {
    const ref = doc(FIRESTORE_DB, `answers/${uid}/daily/${item.id}`);
    //console.log(item.id);
    const deleteItem = async () => {
      deleteDoc(ref);
    };

    return (
      <View style={styles.card}>
        <Text style={styles.QuestionText}>
          Question: {item.questionOfTheDay}
        </Text>
        <Text style={styles.AnswerText}>Answer: {item.useranswer}</Text>
  
        <Entypo
          name="trash"
          size={24}
          color="red"
          onPress={deleteItem}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
          }}
        />
      </View>
    );
  };

  return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Your History</Text>
        </View>
        {dailyData.length >= 0 && (
          <FlatList
            data={dailyData}
            renderItem={item => renderData(item)}
            keyExtractor={(dailyData: Daily) => dailyData.id}
          />
        )}
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f0', // Parchment-like background
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%', // Make the header full-width
    padding: 80,
    backgroundColor: '#c0b283', // Gold-like background
    borderTopEndRadius: 20, // Rounded top right corner
    borderTopStartRadius: 20, // Rounded top left corner
    borderBottomEndRadius: 20, // Rounded bottom right corner (optional)
    borderBottomStartRadius: 20, // Rounded bottom left corner (optional)
    marginTop: 0, // Add some margin at the top
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center', // Center the text horizontally
    justifyContent: 'center', // Center the text vertically
   height: 100,
  },
  headerText: {
    fontSize: 24,
    color: '#003300', // Deep green color
    fontFamily: 'Roboto', // Consider using a custom vintage font
    fontWeight: 'bold',
    marginBottom: -40,
  },
  QuestionText: {
    flex: 1,
    padding: 10,
    fontSize: 17,
    color: '#003300', // Deep green color
    fontFamily: 'Roboto', // Consider a font like 'Times New Roman' or a custom vintage font
  },
  AnswerText: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    color: '#003300',
    fontFamily: 'Roboto',
  },
  card: {
    backgroundColor: '#eae8df', // Card color
    margin: 10,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c0b283', // Gold-like border
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: '#c0b283', // Gold-like button
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    fontFamily: 'Roboto',
    fontSize: 15,
    color: '#003300',
  },
});