/* eslint-disable @typescript-eslint/no-unused-vars */

// Import the functions you need from the SDKs you need
//import { getAnalytics } from "firebase/analytics";
import {initializeApp, getApp} from 'firebase/app';
import {getStorage} from 'firebase/storage';
import {ref as storageRef} from 'firebase/storage';

import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import {
  API_KEY,
  AUTH_DOMAIN,
  DATABASE_URL,
  PROJECT_ID,
  STORAGE_BUCKET,
  MEASURMENT_ID,
  MESSAGING_CENTER_ID,
  APP_ID,
} from '@env';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnQKBc5I70lm8VkfSZR_1e8J_Q4pcurYo",
  authDomain: `${AUTH_DOMAIN}`,
  databaseURL: `${DATABASE_URL}`,
  projectId: `${PROJECT_ID}`,
  storageBucket: `${STORAGE_BUCKET}`,
  messagingSenderId: `${MESSAGING_CENTER_ID}`,
  appId: `${APP_ID}`,
  measurementId: `${MEASURMENT_ID}`,
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
initializeAuth(FIREBASE_APP, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export const FIRESTORE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
//const analytics = getAnalytics(FIREBASE_APP);

export {storageRef};
