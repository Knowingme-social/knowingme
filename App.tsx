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

const Stack = createNativeStackNavigator();

export default function App() {
  const [answer, setAnswer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

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
          name="LocalStorage"
          component={LocalStorage}
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
                name="Daily Question"
                component={LocalStorage}
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
