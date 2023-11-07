/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable eol-last */
/* eslint-disable semi */
/* eslint-disable no-trailing-spaces */
/* eslint-disable react/self-closing-comp */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  LogBox,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {oneUser} from './EditProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NavBar from '../components/bottomNav';

//need that to ignore annoying navigation console error/comment it out when need to test new additions
LogBox.ignoreAllLogs();

export default function UserScreen({navigation}) {
  const [userData, setUserData] = useState<oneUser | null>(null);
  const [question, setQuestion] = useState<any | null>(null);
  const [answer, setAnswer] = useState<any | null>(null);
  const [answerOP1, setAnswer1] = useState<any | null>(null);
  const [answerOP2, setAnswer2] = useState<any | null>(null);
  const [answerOP3, setAnswer3] = useState<any | null>(null);
  const [answerOP4, setAnswer4] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const uid = FIREBASE_AUTH.currentUser?.uid;

  //needs to be set to whatever the question of the day is.
  //let DailyQuestion = 'What is your NOT YOUR favorite Pizza topping';

  //pulls in answer of the day from the async storage.
  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const answerOftheDay = await AsyncStorage.getItem('answer');
        const answer1 = await AsyncStorage.getItem('answer1');
        const answer2 = await AsyncStorage.getItem('answer2');
        const answer3 = await AsyncStorage.getItem('answer3');
        const answer4 = await AsyncStorage.getItem('answer4');
        const questionOfTheDay = await AsyncStorage.getItem('question');

        // value previously stored
        const dailyAnswer = answerOftheDay;
        const dailyQuestion = questionOfTheDay;
        const answerOption1 = answer1;
        const answerOption2 = answer2;
        const answerOption3 = answer3;
        const answerOption4 = answer4;
        console.log('Answer:' + dailyAnswer);
        setAnswer(dailyAnswer);
        console.log('Answer1:' + answerOption1);
        setAnswer1(answerOption1);
        console.log('Answer2:' + answerOption2);
        setAnswer2(answerOption2);
        console.log('Answer3:' + answerOption3);
        setAnswer3(answerOption3);
        console.log('Answer4:' + answerOption4);
        setAnswer4(answerOption4);
        console.log('Question:' + dailyQuestion);
        setQuestion(dailyQuestion);
      } catch (error) {
        // error reading value
        console.error(`Error: ${error}`);
      }
    };
    getData();
    setLoading(false);
  }, [uid]);

  //checks if there is an answer of the day and
  //user is logged in before adding answer to DB

  useEffect(() => {
    const answerOfTheDayDatabase = async () => {
      try {
        // creating a collection for answer
        const currentDate = new Date();
        //Convert to 'YYYY-MM-DD' format
        const currentDateStr = currentDate.toISOString().split('T')[0];

        const userDocRef = doc(collection(FIRESTORE_DB, 'answers'), uid);
        const answersCollectionRef = collection(userDocRef, 'daily');
        const answerDateDocRef = doc(answersCollectionRef, currentDateStr);

        const friendsQuestions = doc(
          collection(FIRESTORE_DB, 'friendsQuestions'),
        );
        const addFriendsQuestion = await getDoc(friendsQuestions);

        const dateDoc = await getDoc(answerDateDocRef);
        //checks if document already exists
        if (dateDoc.exists() || addFriendsQuestion.exists()) {
          console.log(`Answer for ${currentDate} already exists.`);
          return;
        }
        // if (addFriendsQuestion.exists()) {
        //   console.log(`Answer for ${currentDate} already exists.`);
        //   return;
        // }

        // If the document doesn't exist, save the answer

        await setDoc(answerDateDocRef, {
          questionOfTheDay: question,
          usersAnswer: answer,
          answerOption1: answerOP1,
          answerOption2: answerOP2,
          answerOption3: answerOP3,
          answerOption4: answerOP4,
          alreadyAnswered: true,
          date: currentDateStr,
          timestamp: serverTimestamp(),
          email: FIREBASE_AUTH.currentUser?.email,
          userId: uid,
        });

        await setDoc(friendsQuestions, {
          questionOfTheDay: question,
          usersAnswer: answer,
          answerOption1: answerOP1,
          answerOption2: answerOP2,
          answerOption3: answerOP3,
          answerOption4: answerOP4,
          alreadyAnswered: true,
          date: currentDateStr,
          timestamp: serverTimestamp(),
          email: FIREBASE_AUTH.currentUser?.email,
          userId: uid,
        });
        console.log(`Answer for ${currentDate} saved.`);
      } catch (error) {
        console.error(`Error: ${error}`);
      }
    };

    if (
      uid &&
      question &&
      answer &&
      answerOP1 &&
      answerOP2 &&
      answerOP3 &&
      answerOP4 &&
      !answerSubmitted
    ) {
      answerOfTheDayDatabase();
      setAnswerSubmitted(true);
    } else {
      console.log('answer already exists or user is not logged in');
    }
  }, [
    answer,
    answerOP1,
    answerOP2,
    answerOP3,
    answerOP4,
    answerSubmitted,
    question,
    uid,
  ]);

  // pulls in user data from DB
  useEffect(() => {
    // Check if uid exists before making the query
    if (uid) {
      const userInfoQuery = query(
        collection(FIRESTORE_DB, 'users'),
        where('userId', '==', uid),
      );

      const subscriber = onSnapshot(userInfoQuery, snapshot => {
        // Ensure that you update state with the new data
        const userInfo: oneUser[] = [];
        snapshot.forEach(doc => {
          userInfo.push({
            ...doc.data(),
          } as oneUser);
        });
        setUserData(userInfo[0] || null); // Update userData state
      });

      // Return the subscriber function to clean up when the component unmounts
      return () => subscriber();
    }
  }, [uid]);

  let profilePic = {
    uri:
      userData?.picture ||
      'https://firebasestorage.googleapis.com/v0/b/knowingme-social.appspot.com/o/defaultPic%2FQuestion.png?alt=media&token=39ec7cd0-7b73-4b4d-b9d3-fd8d999141d1',
  };

  return (
    <>
      <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
          }}
          showsVerticalScrollIndicator={false}>
          <Image style={styles.userImg} source={profilePic} />
          <Text style={styles.userName}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          {/* <Text style={styles.aboutUser}>
            About: Just an average Joe who likes to hike and bike, like a Mike!
          </Text> */}
          <View style={styles.userBtnWrapper}>
            <TouchableOpacity
              style={styles.userBtn}
              onPress={() => navigation.push('Edit Profile')}>
              <Text style={styles.userBtnTxt}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.userBtn}
              onPress={() => {
                FIREBASE_AUTH.signOut();
                GoogleSignin.signOut();
                navigation.push('Login');
                // navigation.navigate(() => {
                //   Login;
                //});
              }}>
              <Text style={styles.userBtnTxt}>Sign Out</Text>
            </TouchableOpacity>
          </View>
          <View>
            {/* <Pressable onPress={() => navigation.pop()}>
              <Text style={{color: 'blue'}}> Go Back </Text>
            </Pressable> */}
          </View>

          <View style={styles.userInfoWrapper}>
            <View style={styles.userInfoItem}>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('MissedQuestionsOfTheDay');
                }}>
                <Text style={styles.userInfoTitle}>History</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.userInfoItem}>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('FriendsQuestions');
                }}>
                <Text style={styles.userInfoTitle}>Friends Questions</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.userInfoItem}>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('Search');
                }}>
                <Text style={styles.userInfoTitle}>Add</Text>
                <Text style={styles.userInfoSubTitle}>Friends</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.userInfoItem}>
              <TouchableOpacity
                onPress={() => {
                  navigation.push('FriendRequest');
                }}>
                <Text style={styles.userInfoTitle}> Friend</Text>
                <Text style={styles.userInfoSubTitle}>Requests</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View>
            {/* <Text
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 'bold',
                marginTop: 40,
                fontSize: 22,
              }}>
              Answer Calendar Or Graph {'\n'} for who you know Best?
            </Text> */}
            <TouchableOpacity
              onPress={() => {
                navigation.push('WhoKnowsWho');
              }}>
              <Text style={styles.userInfoTitle}>Best and Worst</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
      <NavBar navigation={navigation} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
  },
  aboutUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  userBtn: {
    borderColor: '#2e64e5',
    borderWidth: 2,
    borderRadius: 3,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 5,
  },
  userBtnTxt: {
    color: '#2e64e5',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  userInfoItem: {
    justifyContent: 'center',
  },
  userInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  userInfoSubTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
