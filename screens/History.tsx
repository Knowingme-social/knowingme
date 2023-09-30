import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Calendar, CalendarList, Agenda } from 'react-native-calendars';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB, FIREBASE_AUTH } from '../firebaseConfig';

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
  const [selectedDate, setSelectedDate] = useState<string>('');
  const uid = FIREBASE_AUTH.currentUser?.uid;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    //create a reference for DB collection and query it by uid for
    //specific user only
    const dailyQuestionRef = query(
      collection(FIRESTORE_DB, 'DailyQuestionAnswer'),
      where('user', '==', uid),
    );

    // create a subscriber in order to get snapshots from DB
    const unsubscribe = onSnapshot(dailyQuestionRef, (querySnapshot) => {
      const dailyData: Daily[] = [];
      querySnapshot.forEach((doc) => {
        dailyData.push({ ...doc.data(), id: doc.id } as Daily);
      });
      setDailyData(dailyData);
    });

    return () => unsubscribe();
  }, []);

  const handleDateSelect = (date: any) => {
    setSelectedDate(date.dateString);
  };

  const markedDates = dailyData.reduce((acc, curr) => {
    const date = new Date(curr.created.seconds * 1000);
    const dateString = date.toISOString().split('T')[0];
    if (curr.questionOfTheDay) {
      acc = {
        ...acc,
        [dateString]: {
          marked: true,
          dotColor: 'blue',
          question: curr.questionOfTheDay,
        },
      };
    }
    return acc;
  }, {});

  const renderItem = ({ item }: { item: Daily }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.itemText}>{item.questionOfTheDay}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <CalendarList
        markedDates={markedDates}
        onDayPress={handleDateSelect}
        pastScrollRange={50}
        futureScrollRange={50}
        scrollEnabled={true}
        style={styles.calendar}
        theme={{
          selectedDayBackgroundColor: '#007AFF',
          selectedDayTextColor: '#FFFFFF',
          todayTextColor: '#007AFF',
          dotColor: '#007AFF',
          arrowColor: '#007AFF',
        }}
      />
      <FlatList
        ref={flatListRef}
        data={dailyData.filter(
          (item) =>
            new Date(item.created.seconds * 1000)
              .toISOString()
              .split('T')[0] === selectedDate,
        )}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  calendar: {
    marginBottom: 10,
  },
  list: {
    flex: 1,
  },
  itemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  itemText: {
    fontSize: 16,
  },
});