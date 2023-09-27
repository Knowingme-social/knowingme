/* eslint-disable react/react-in-jsx-scope */

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';

import LocalStorage from './screens/LocalStorage';
import CheckScreen from './screens/CheckScreen';

import {useEffect, useState} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();

export default function App() {
  const [answer, setAnswer] = useState<any | null>(null);

  useEffect(() => {
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
    };
    getData();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen
          name="TestScreen"
          component={EditProfile}
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
