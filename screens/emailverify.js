import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const EmailVerify = ({ route }) => {
    const [otp, setOtp] = useState('');
    const user = route.params;
    const email=user.email;
    const navigation = useNavigation();
    const handleSendOTP = async () => {
      try {
        const response = await axios.post('http://192.168.29.252:3000/send-otp', { email });
        if (response.data.status === 'success') {
          Alert.alert('Success', 'OTP sent successfully');
        } else {
          Alert.alert('Error', 'Failed to send OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error sending OTP:', error);
        Alert.alert('Error', 'Failed to send OTP. Please try again later.');
      }
    };
  
    const handleVerify = async () => {
        try {
          const { username, email, password, phoneNumber, bio, dateOfBirth, location } = user;
          const response = await axios.post('http://192.168.29.252:3000/verify-otp', {
            username,
             email,
            password,
            phoneNumber,
            bio,
            dateOfBirth,
            location,
            otp
          });
          
          if (response.data.status === 'success') {
            Alert.alert('Success', 'registered successfully');
            // Navigate to next screen or perform necessary actions upon successful verification
            navigation.navigate("Login");
          } else {
            Alert.alert('Error', 'Incorrect OTP. Please try again.');
          }
        } catch (error) {
          console.error('Error verifying OTP:', error);
          Alert.alert('Error', 'Failed to verify OTP. Please try again later.');
        }
      };
      
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>An OTP has been sent to your email address. Please enter the OTP below:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
        />
        <Pressable style={styles.verifyButton} onPress={handleVerify}>
          <Text style={styles.verifyButtonText}>Verify</Text>
        </Pressable>
        <Pressable style={styles.resendButton} onPress={handleSendOTP}>
          <Text style={styles.resendButtonText}>Resend OTP</Text>
        </Pressable>
      </View>
    );
  };
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
  },
  verifyButton: {
    backgroundColor: 'blue',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
    marginBottom: 10,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 5,
  },
  resendButtonText: {
    color: 'blue',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EmailVerify;
