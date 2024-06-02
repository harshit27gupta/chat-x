import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();

  const handleVerify = async () => {
    if(email===''){
        Alert.alert("please enter email");
        return ;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://192.168.29.252:3000/api/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setVerified(true);
        setLoading(false);
        setTimeout(() => {
          navigation.navigate('Emailotpverify', { email });
          setEmail('');
          setVerified(false);
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message);
        setLoading(false);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hold on champ, we've got you!</Text>
      <Text style={styles.note}>Enter the email you used during registration. After verifying your email, you can reset your password.</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Pressable style={styles.verifyButton} onPress={handleVerify} disabled={loading || verified}>
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Verify Email'}</Text>
      </Pressable>
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />}
      {verified && (
        <View style={styles.verifiedContainer}>
          <Ionicons name="checkmark-circle" size={50} color="green" />
          <Text style={styles.verifiedText}>Email Verified!</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
    textAlign: 'center',
  },
  note: {
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#007bff',
    borderWidth: 2,
    borderRadius: 5,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  verifyButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  verifiedText: {
    marginTop: 10,
    fontSize: 18,
    color: 'green',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  loader: {
    marginTop: 10,
  },
});

export default VerifyEmail;
