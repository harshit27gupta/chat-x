import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from '../screens/Login';
import { NavigationContainer } from '@react-navigation/native';
import Register from '../screens/Register';
import EmailVerify from '../screens/emailverify';
import HomePage from '../screens/HomePage';
import Contacts from '../screens/Contacts';
import myinfo from '../screens/myinfo';
import Chatroom from '../screens/chatroom';
import DirectMessagesScreen from '../screens/DirectMessageScreen';
import CallComponent from '../screens/CallComponent';
import CreateGroup from '../screens/CreateGroup';
import ContactList from '../screens/ContactList';
import GroupChatRoom from '../screens/GroupChatRoom';
import Verifyemail from '../screens/Verifyemail';
import Passupdate from '../screens/Passupdate';
import EmailVerification from '../screens/EmailVerification';



const StackNavigator = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen
        name="Login"
        component={Login}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="register"
        component={Register}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="verify"
        component={EmailVerify}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="home"
        component={HomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="contact"
        component={Contacts}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="profile"
        component={myinfo}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="chat"
        component={Chatroom}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="dm"
        component={DirectMessagesScreen}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="call"
        component={CallComponent}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="group"
        component={CreateGroup}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Contactlist"
        component={ContactList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Groupchatroom"
        component={GroupChatRoom}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="emailverfiy"
        component={Verifyemail}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PassChange"
        component={Passupdate}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Emailotpverify"
        component={EmailVerification}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
    </NavigationContainer>
  );
};

export default StackNavigator;
