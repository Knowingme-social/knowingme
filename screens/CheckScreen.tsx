/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {createNativeStackNavigator} from '@react-navigation/native-stack';
//import Home from './Home';
import Login from './Login';

import {useEffect, useState} from 'react';
import {User, onAuthStateChanged} from 'firebase/auth';
import {FIREBASE_AUTH} from '../firebaseConfig';
import History from './History';
import SignUp from '../components/SignUp';
//import Question from './Question';
import UserScreen from './UserScreen';
import ResetPassword from '../components/ResetPassword';
import EditProfile from '../components/EditProfile';
import Search from '../components/Search';
// import Question from './Question';
import Home from '../components/Home';

import FriendRequest from '../components/FriendRequest';
import {ActivityIndicator} from 'react-native';
import MissedQuestionsOfTheDay from './MissedQuestionsOfTheDay';
import FriendsQuestions from './FriendsQuestions';
import WhoKnowsWho from './WhoKnowsWho';
import NavBar from '../components/bottomNav';

const LoginStack = createNativeStackNavigator();

export default function LoginFlow() {
  const [user, setUser] = useState<User | null>();
  const [loading, setLoading] = useState(false);

  //sets logged in user
  useEffect(() => {
    setLoading(true);
    onAuthStateChanged(FIREBASE_AUTH, user => {
      //uncomment to get the login scope list readable in console
      //console.log(JSON.stringify(user, null, 2));
      //console.log('user', user); // full user object
      console.log('user', user?.email);
      setUser(user);
    });
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  return (
    <>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <LoginStack.Navigator>
          {user ? (
            <>
              <LoginStack.Screen
                name="Home"
                component={NavBar}
                options={{headerShown: false}}
              />
              {/* <LoginStack.Screen
                name="Question"
                component={Question}
                options={{headerShown: false}}
              /> */}
              <LoginStack.Screen
                name="User Screen"
                component={UserScreen}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="History"
                component={History}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="MissedQuestionsOfTheDay"
                component={MissedQuestionsOfTheDay}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="FriendsQuestions"
                component={FriendsQuestions}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="WhoKnowsWho"
                component={WhoKnowsWho}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="Search"
                component={Search}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="FriendRequest"
                component={FriendRequest}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="Edit Profile"
                component={EditProfile}
                options={{headerShown: false}}
              />
            </>
          ) : (
            <>
              <LoginStack.Screen
                name="Login"
                component={Login}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="SignUp"
                component={SignUp}
                options={{headerShown: false}}
              />
              <LoginStack.Screen
                name="ResetPassword"
                component={ResetPassword}
                options={{headerShown: false}}
              />
            </>
          )}
        </LoginStack.Navigator>
      )}
    </>
  );
}