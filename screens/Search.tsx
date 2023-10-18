/* eslint-disable no-trailing-spaces */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {View, Text, TextInput, FlatList, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';

import {FIRESTORE_DB} from '../firebaseConfig';
import {collection, where, query, getDocs} from 'firebase/firestore';
import {oneUser} from './EditProfile';

export default function Search() {
  // Use an array to store user data
  const [users, setUsers] = useState<oneUser[]>([]);

  const fetchUsers = async search => {
    try {
      const getUsers = query(
        collection(FIRESTORE_DB, 'users'),
        where('lastName', '>=', search.toLowerCase()),
      );

      const snapshot = await getDocs(getUsers);

      const userInfo: oneUser[] = [];
      snapshot.forEach(doc => {
        userInfo.push({
          ...doc.data(),
        } as oneUser);
      });
      // Update the state with the fetched data
      setUsers(userInfo);
    } catch (error) {
      console.log(error);
    }
  };

  //console.log(users);

  return (
    <View>
      <TextInput
        placeholder="Search"
        onChangeText={search => fetchUsers(search)} // Update the search state
      />
      <FlatList
        numColumns={1}
        horizontal={false}
        data={users}
        keyExtractor={users => users.userId} // Add a key extractor
        renderItem={({item}) => (
          <TouchableOpacity>
            <Text>
              {item.firstName} {item.lastName}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
