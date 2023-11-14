import Icon from 'react-native-vector-icons/Entypo';
import { TouchableOpacity, View } from 'react-native';
import React from 'react';

const GoBackButton = ({ navigation }) => {
  return (
    <View style={{ position: 'absolute', top: 22, left: 5, flexDirection: 'row' }}>
      <TouchableOpacity onPress={() => navigation.pop()}>
        <Icon name="back" size={54}/>
      </TouchableOpacity>
    </View>
  );
};

export default GoBackButton;
