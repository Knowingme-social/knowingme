import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Login from './Login';
import SignUp from './SignUp';

const AuthStack = createNativeStackNavigator();

export default function AuthenticationProcess() {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen
        name="SignUP"
        component={SignUp}
        options={{headerShown: false}}
      />
    </AuthStack.Navigator>
  );
}
