import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity, Alert, Button } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from '@react-navigation/native';
import * as Linking from 'expo-linking';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentCall, setCurrentCall] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    fetchEmailFromStorage();
  }, []);

  useEffect(() => {
    if (email) {
      fetchContacts();
    }
  }, [email]);

  const fetchEmailFromStorage = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setLoading(false); // Stop loading if no email found
      }
    } catch (error) {
      console.error("Error fetching email from storage:", error);
      setLoading(false);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://192.168.29.252:3000/contacts');
      setContacts(response.data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderProfilePhoto = (item) => {
    const source = item.profilePhoto ? { uri: item.profilePhoto.toString() } : require("../assets/default.jpeg");
    return (
      <Image
        source={source}
        style={styles.profilePhoto}
        resizeMode="cover"
      />
    );
  };

  const handlePress = (item) => {
    Alert.alert(
      "Choose an option",
      `Contact: ${item.username}`,
      [
        {
          text: "Chat",
          onPress: () => navigation.navigate('chat', { contact: item })
        },
        {
          text: "Call",
          onPress: () => initiateCall(item)
        },
        {
          text: "Cancel",
          style: "cancel"
        }
      ],
      { cancelable: true }
    );
  };

  const initiateCall = async (contact) => {
    if(email===contact.email){
      Alert.alert("cannot call yourself");
      return ;
    }
    const phoneNumber = contact.phoneNumber;
    const callUrl = `tel:${phoneNumber}`;

    const startTime = new Date().toISOString();

    // Log call history to backend
    await axios.post('http://192.168.29.252:3000/log-call', {
      caller: email,
      receiver: contact.email,
      startTime,
    });

    // Open phone dialer
    Linking.openURL(callUrl);

    // Set current call
    setCurrentCall(contact);
  };

  const endCall = async () => {
    if (currentCall) {
      const endTime = new Date().toISOString();

      // Log call end to backend
      await axios.post('http://192.168.29.252:3000/end-call', {
        caller: email,
        receiver: currentCall.email,
        endTime,
      });

      // Clear current call
      setCurrentCall(null);
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const seconds = time.getSeconds();
    const ampm = hours >= 12 ? 'pm' : 'am';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds} ${ampm}`;
  };

  const formatDuration = (durationString) => {
    const duration = durationString.split(':').map(Number);
    const hours = duration[0];
    const minutes = duration[1];
    const seconds = duration[2];
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <View style={styles.container}>
      {currentCall && (
        <View style={styles.endCallContainer}>
          <Text style={styles.endCallText}>In call with: {currentCall.username}</Text>
          <Button title="End Call" onPress={endCall} />
        </View>
      )}
      <FlatList
        data={contacts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.contactItem} onPress={() => handlePress(item)}>
            {renderProfilePhoto(item)}
            <View>
              <Text style={styles.contactName}>{item.username + (item.email === email ? ' (You)' : '')}</Text>
              <Text style={styles.phoneNumber}>{item.phoneNumber}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  contactName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  phoneNumber: {
    fontSize: 16,
    color: '#555',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endCallContainer: {
    padding: 20,
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 10,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  endCallText: {
    fontSize: 16,
    color: '#721c24',
  },
});

export default Contacts;
