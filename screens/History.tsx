/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {useState, useEffect} from 'react';
import {StyleSheet, View, Text, FlatList, SafeAreaView} from 'react-native';
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
        <Text style={styles.AnswerText}>Answer: {item.usersAnswer}</Text>

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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Your History</Text>
        </View>
        {dailyData.length > 0 && (
          <FlatList
            data={dailyData}
            renderItem={item => renderData(item)}
            keyExtractor={(item) => item.id.toString()}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Match this with the header background color
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Updated to a lighter background
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '100%',
    padding: 20, // Reduced padding for a more minimalist header
    backgroundColor: '#ffffff', // White background for a clean look
    alignItems: 'center',
    justifyContent: 'center',
    height: 60, // Shorter header
    borderBottomWidth: 1, // Subtle border
    borderBottomColor: '#e0e0e0', // Soft border color
  },
  headerText: {
    fontSize: 24,
    color: '#333333', // Darker text for better contrast
    fontFamily: 'Roboto', // Maintained the font for consistency
    fontWeight: 'bold',
    marginTop: -20, // Added some bottom margin for hierarchy
  },
  QuestionText: {
    fontSize: 16, // Slightly reduced size for a cleaner look
    color: '#333333',
    fontFamily: 'Roboto',
    marginBottom: 4, // Space between question and answer
  },
  AnswerText: {
    fontSize: 14, // Smaller font size for the answer for hierarchy
    color: '#4f4f4f', // Slightly lighter color for contrast
    fontFamily: 'Roboto',
  },
  card: {
    backgroundColor: '#ffffff', // White cards for a clean design
    marginVertical: 8, // More vertical space between cards
    padding: 16, // Padding adjusted for content
    borderRadius: 12, // Rounded corners
    borderWidth: 0, // No border for a cleaner look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // Refined shadow for depth
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
