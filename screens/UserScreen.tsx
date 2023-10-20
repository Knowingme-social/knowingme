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
  Pressable,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FIREBASE_AUTH, FIRESTORE_DB} from '../firebaseConfig';
import Icon from 'react-native-vector-icons/Ionicons';


import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {collection, onSnapshot, query, where} from 'firebase/firestore';
import {oneUser} from './EditProfile';
import { Share } from 'react-native';

export default function UserScreen({navigation}) {
  const uid = FIREBASE_AUTH.currentUser?.uid;
  const [userData, setUserData] = useState<oneUser | null>(null);

  function shareInvite() {
    if (uid) {
      const referralLink = `https://Knowingme.io/invite?referral_uid=${uid}`;
      Share.share({
        message: `Join me on Knowingme! Use my link: ${referralLink}`,
      });
    }
  }

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
          style={{
            position: 'absolute',
            top: -190, 
            right: 10, 
            zIndex: 1
          }}
          onPress={shareInvite}>
          <Icon name="share-sharp" size={30} color="black" />
          <Text>share</Text>
        </TouchableOpacity>
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
              navigation.navigate(() => navigation.popToTop());
            }}>
            <Text style={styles.userBtnTxt}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        
        <View>
          <Pressable onPress={() => navigation.pop()}>
            <Text style={{color: 'blue'}}> Go Back </Text>
          </Pressable>
        </View>

        <View style={styles.userInfoWrapper}>
          <View style={styles.userInfoItem}>
            <Text style={styles.userInfoTitle}>15</Text>
            <Text style={styles.userInfoSubTitle}>Friends</Text>
          </View>

          <View style={styles.userInfoItem}>
            <TouchableOpacity
              onPress={() => {
                navigation.push('History');
              }}>
              <Text style={styles.userInfoTitle}>Answer History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View>
          <Text
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              fontWeight: 'bold',
              marginTop: 40,
              fontSize: 22,
            }}>
            Answer Calendar Or Graph {'\n'} for who yo know Best?
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
