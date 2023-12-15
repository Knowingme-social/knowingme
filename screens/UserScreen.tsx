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
  Share,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProgressBar, MD2Colors, MD3Colors} from 'react-native-paper';

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
  updateDoc,
} from 'firebase/firestore';
import {oneUser} from '../components/EditProfile';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedButton } from 'react-native-really-awesome-button';

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
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState([]);


  const uid = FIREBASE_AUTH.currentUser?.uid;
  const firstname = userData?.firstName;
  const lastname = userData?.lastName;
  const displayname = userData?.displayName;

  function shareInvite() {
    if (uid) {
      const referralLink = `https://Knowingme.io/invite?referral_uid=${uid}`;
      Share.share({
        message: `Join me on Knowingme! Use my link: ${referralLink}`,
      });
    }
  }

  const Tag = ({ text, onDelete }) => (
    <View style={styles.tag}>
      <Text style={styles.tagText}>{text}</Text>
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const addTag = () => {
    if (newTag.trim().length > 0) {
      setTags([...tags, newTag.trim()]);
      setNewTag(''); // Clear the input field after adding a tag
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, index) => index !== indexToRemove));
  };
  

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
        console.error(`Error: ${error}`);
      }
    };
    getData();
    setLoading(false);
  }, [uid]);

  useEffect(() => {
    // Assuming 'uid' is the current user's ID and 'FIRESTORE_DB' is your Firestore instance
    const userDocRef = doc(FIRESTORE_DB, 'users', uid);
    updateDoc(userDocRef, {
      tags: tags,
    }).catch((error) => {
      console.error("Error updating tags: ", error);
    });
  }, [tags]);
  
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
          firstName: firstname,
          lastName: lastname,
          displayName: displayname,
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
          firstName: firstname,
          lastName: lastname,
          displayName: displayname,
        });
        console.log(`Answer for ${currentDate} saved.`);
      } catch (error) {
        console.error(`Error: ${error}`);
      }
    };

    if (
      firstname &&
      lastname &&
      displayname &&
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
    firstname,
    lastname,
    displayname,
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
        setUserData(userInfo[0] || null);
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
      <SafeAreaView style={{flex: 1, backgroundColor: '#e5e6df'}}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.userBtn}
              onPress={() => {
                FIREBASE_AUTH.signOut();
                GoogleSignin.signOut();

                // navigation.navigate(() => {
                //   Login;
                //});
              }}>
              <Text style={styles.userBtnTxt}>Sign Out</Text>
            </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareInvite}>
            <Icon name="share-social" size={30} color="#4F8EF7" />
          </TouchableOpacity>
          <Image style={styles.userImg} source={profilePic} />
          <Text style={styles.userName}>
            {userData?.firstName} {userData?.lastName}
          </Text>
          <View style={styles.userBtnWrapper}>
            <ThemedButton
            name="cartman"
            type='primary'
            width={150}
              style={styles.editProfileBtn}
              onPress={() => navigation.push('Edit Profile')}>
              <Icon name="pencil" size={20} color="black" />
              <Text style={styles.userBtnTxt}>Edit Profile</Text>
            </ThemedButton>
            <ThemedButton
            name="cartman"
            type='primary'
            width={150}
              style={styles.friendsBtn}
              onPress={() => {
                navigation.push('FriendRequest');
              }}>
              <Icon name="people" size={20} color="black" />
              <Text style={styles.userInfoTitle}>Friends</Text>
            </ThemedButton>
          </View>
          <View style={{ alignItems: 'center', padding: 20 }}>
        {/* <Text style={{ fontSize: 16, color: '#333', textAlign: 'center' }}>
           “Life isn’t about finding yourself. Life is about creating yourself.” – George Bernard Shaw
       </Text> */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
  <TextInput
    style={styles.tagInput}
    placeholder="Add new interest..."
    value={newTag}
    onChangeText={setNewTag}
    onSubmitEditing={addTag} // Add the tag when the user submits the input
        />
           <TouchableOpacity style={styles.addButton} onPress={addTag}>
           <Text style={styles.addButtonText}>Add</Text>
           </TouchableOpacity>
          </View>
        </View>
        <View style={styles.tagsContainer}>
           {tags.map((tag, index) => (
           <Tag
            key={index}
            text={tag}
            onDelete={() => removeTag(index)}
        />
     ))}
        </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e6df',
  },
  contentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  shareButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  userImg: {
    height: 150,
    width: 150,
    borderRadius: 75,
    marginTop: 20,
    marginBottom: 10,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  userBtnWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBtnTxt: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
    fontWeight: '600',
  },
  userInfoTitle: {
    fontSize: 16,
    color: 'black',
    marginLeft: 10,
    fontWeight: '600',
  },
  tag: {
    backgroundColor: '#ddeeff', // Soft color for the tag
    borderRadius: 20,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 20, // Increase right padding to make room for the delete button
    margin: 4,
    flexDirection: 'row',
    alignItems: 'center', // Align tag text and delete button on the same line
  },
  tagText: {
    color: '#336699',
  },
  deleteButton: {
    position: 'absolute', // Position the button absolutely relative to its parent
    top: -5, // Adjust top position to align with the corner
    right: -5, // Adjust right position to align with the corner
    backgroundColor: 'rgba(255, 0, 0, 0.2)', // Semi-transparent red background
    borderRadius: 10, // Circular button
    width: 16, // Smaller width
    height: 16, // Smaller height
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ff0000', // Red text
    fontWeight: 'bold',
    fontSize: 14, // Smaller font size
    lineHeight: 16, // Ensure the text is centered in the button
  },
  tagInput: {
    backgroundColor: '#f7f7f7', // A soft background color
    borderColor: '#dcdcdc', // A light border color
    borderWidth: 1,
    borderRadius: 25, // Fully rounded corners
    paddingVertical: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333', // Soft text color for contrast
    marginVertical: 5,
    width: '90%', // Assuming you want it to take up most of the container width
    alignSelf: 'center', // Center the input field in the container
    shadowColor: "#000", // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Elevation for Android
  },
  addButton: {
    backgroundColor: '#758BFD', // Soft blue color for the button
    borderRadius: 25,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2, // Elevation for Android
    shadowOpacity: 0.2, // Shadow for iOS
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    marginTop: 10,
    marginLeft: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
