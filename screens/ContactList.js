import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ContactList = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigation = useNavigation();
  const route = useRoute();
  const { groupName } = route.params;

  useEffect(() => {
    // Fetch contacts data
    axios.get('http://192.168.29.252:3000/contacts')
      .then(response => {
        setContacts(response.data);
      })
      .catch(error => {
        console.error(error);
      });

    // Fetch user email from AsyncStorage
    AsyncStorage.getItem('email').then(email => setUserEmail(email));
  }, []);

  const toggleContactSelection = (contact) => {
    const isSelected = selectedContacts.some(c => c.userId === contact.userId);
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.userId !== contact.userId));
    } else {
      setSelectedContacts([...selectedContacts, contact]);
    }
  };

  const handleCreateGroup = async () => {
    setLoading(true);
    try {
      // Send a POST request to create the group
      const response = await axios.post('http://192.168.29.252:3000/create-group', {
        name: groupName,
        members: [...selectedContacts, { username: 'You', email: userEmail }]
      });

      // Navigate to GroupChatRoom and pass the created group data
      navigation.navigate('Groupchatroom', {groups:response.data});
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <FlatList
            data={contacts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <View style={styles.contactContainer}>
                <Text style={styles.contactName}>{item.username}</Text>
                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    selectedContacts.includes(item) && styles.selectedButton
                  ]}
                  onPress={() => {
                    setSelectedContacts(prevState =>
                      prevState.includes(item)
                        ? prevState.filter(contact => contact !== item)
                        : [...prevState, item]
                    );
                  }}
                >
                  <Text style={styles.selectButtonText}>
                    {selectedContacts.includes(item) ? 'Deselect' : 'Select'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
            <Text style={styles.createButtonText}>Create Group</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  contactName: {
    fontSize: 18,
    color: '#333',
  },
  selectButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  selectedButton: {
    backgroundColor: '#007bff',
  },
  selectButtonText: {
    color: 'blue',
    fontSize: 14,
  },
  createButton: {
    paddingVertical: 15,
    borderRadius: 8,
    backgroundColor: '#28a745',
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ContactList;