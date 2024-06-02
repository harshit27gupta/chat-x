import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

const EmailVerification = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpInputs = useRef([]);

  useEffect(() => {
    sendOtp();
  }, []);

  const sendOtp = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://192.168.29.252:3000/send-otp1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      setLoading(false);
      if (result.status !== 'success') {
        setError(result.message);
      }
    } catch (error) {
      setLoading(false);
      setError('Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://192.168.29.252:3000/verify-otp1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: enteredOtp })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setTimeout(() => {
          setLoading(false);
          navigation.navigate('PassChange', { email });
        }, 2000); // Delay of 2 seconds
      } else {
        setLoading(false);
        setError(result.message);
      }
    } catch (error) {
      setLoading(false);
      setError('Failed to verify OTP');
    }
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      otpInputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Email Verification</Text>
      <Text style={styles.subtitle}>Enter the 6-digit OTP sent to {email}</Text>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(el) => (otpInputs.current[index] = el)}
            style={styles.otpInput}
            keyboardType="numeric"
            maxLength={1}
            onChangeText={(value) => handleOtpChange(value, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            value={digit}
          />
        ))}
      </View>
      {loading ? <ActivityIndicator size="large" color="#0000ff" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : <Text style={styles.success}>OTP sent to your email</Text>}
      <TouchableOpacity style={styles.button} onPress={verifyOtp} disabled={loading}>
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={sendOtp} disabled={loading}>
        <Text style={styles.buttonText}>Resend OTP</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  otpInput: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    fontSize: 18,
    textAlign: 'center',
    width: 40,
    marginHorizontal: 5
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 16
  },
  error: {
    color: 'red',
    marginBottom: 10
  },
  success: {
    color: 'green',
    marginBottom: 10
  },
});

export default EmailVerification;
