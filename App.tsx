/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

import LocalStorage from './screens/LocalStorage';
import CheckScreen from './screens/CheckScreen';

import {useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {ActivityIndicator} from 'react-native';
import DailyQuestion from './screens/DailyQuestion';
import Question from './components/Question';
import MissedQuestionsOfTheDay from './screens/MissedQuestionsOfTheDay';
import FriendsQuestions from './screens/FriendsQuestions';
import WhoKnowsWho from './screens/WhoKnowsWho';

const Stack = createNativeStackNavigator();

export default function App() {
  const [answer, setAnswer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  //clears answer of the day from Async storage
  const clearDailyAnswer = async () => {
    try {
      // Get the current date and time
      const currentTime = new Date().getTime();

      // Calculate the time until midnight (in milliseconds)
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const timeUntilMidnight = midnight.getTime() - currentTime;

      // Schedule the function to run at midnight
      setTimeout(async () => {
        // Clear the answer
        await AsyncStorage.removeItem('answer');
        await AsyncStorage.removeItem('question');

        // Update the last clear time
        await AsyncStorage.setItem('lastClearTime', currentTime.toString());

        console.log('Answer cleared at midnight.');

        // Schedule the function to run again for the next midnight
        clearDailyAnswer();
      }, timeUntilMidnight);

      console.log('Clear function scheduled for midnight.');
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  };

  // Call the function to start the process
  clearDailyAnswer();

  // Run the function initially
  clearDailyAnswer();

  // Set up a setInterval to run the function every 24 hours
  setInterval(clearDailyAnswer, 24 * 60 * 60 * 1000);

  //pulls in answer of the day from the async storage.
  useEffect(() => {
    setLoading(true);
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem('answer');
        if (value !== null) {
          // value previously stored
          const dailyAnswer = value;
          console.log('Answer:' + dailyAnswer);
          setAnswer(dailyAnswer);
        } else {
          console.log('no daily answer');
        }
      } catch (error) {
        // error reading value
        console.error(`Error: ${error}`);
      }
      setLoading(false);
    };
    getData();
  }, []);

  return (
    <NavigationContainer>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Stack.Navigator>
          {/* <Stack.Screen
            name="Quiz"
            component={WhoKnowsWho}
            options={{headerShown: false}}
          /> */}

          {answer ? (
            <Stack.Screen
              name="Flow"
              component={CheckScreen}
              options={{headerShown: false}}
            />
          ) : (
            <>
              <Stack.Screen
                name="DailyQuestion"
                component={DailyQuestion}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="CheckScreen"
                component={CheckScreen}
                options={{headerShown: false}}
              />
            </>
          )}
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },
// });
