import React, { useState, useEffect, useRef,useCallback } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, KeyboardAvoidingView, BackHandler, Modal } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const GroupChatRoom = ({ route }) => {
  const { groups } = route.params;
  const { name: groupName, members: selectedContacts, messages: initialMessages } = groups;
  const [messages, setMessages] = useState(initialMessages || []);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEmailFromStorage = async () => {
      try {
        const storedEmail = await AsyncStorage.getItem('email');
        if (storedEmail) {
          setUserEmail(storedEmail);
        }
      } catch (error) {
        console.error('Error fetching email from storage:', error);
      }
    };

    fetchEmailFromStorage();

    const handleBackPress = () => {
      navigation.navigate('home');
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    socketRef.current = io('http://192.168.29.252:3000', {
      query: { email: userEmail },
    });
    socketRef.current.emit('join_group', groupName);

    socketRef.current.on('receive_message1', (msg) => {
      console.log('Message received:', msg);
      if (msg.timestamp) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    socketRef.current.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      backHandler.remove();
    };
  }, [groupName, userEmail]);

  useEffect(() => {
    if (userEmail) {
      fetchMessages();
    }
  }, [userEmail]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('http://192.168.29.252:3000/group-messages', {
        params: { groupName },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const getDateLabel = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toDateString();
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const timestamp = Date.now();
      const msg = { text: message, sender: userEmail, groupName, timestamp };
      console.log('Sending message:', msg);
      socketRef.current.emit('send_message1', msg);
      setMessage('');
    }
  };

  const renderItem = useCallback(
    ({ item, index }) => {
      const showDateLabel =
        index === 0 ||
        new Date(item.timestamp).toDateString() !== new Date(messages[index - 1].timestamp).toDateString();

      return (
        <View>
          {showDateLabel && (
            <Text style={styles.dateLabel}>{getDateLabel(item.timestamp)}</Text>
          )}
          <View style={[styles.messageBubble, item.sender === userEmail ? styles.myMessage : styles.otherMessage]}>
            <Text style={styles.sender}>{item.sender === userEmail ? 'You' : item.sender}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </View>
        </View>
      );
    },
    [messages]
  );

  const handleGroupDetailsPress = () => {
    setModalVisible(true);
  };

  const handleMemberPress = (member) => {
    setModalVisible(false);
    navigation.navigate('chat', { contact: member });
  };

  const renderMember = ({ item }) => {
    const isOnline = onlineUsers.includes(item.email);
    return (
      <TouchableOpacity style={styles.memberItem} onPress={() => handleMemberPress(item)}>
        <Text style={styles.memberName}>{item.email}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: isOnline ? 'green' : 'red' }]} />
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('home')}>
          <Ionicons name="arrow-back" size={24} color="white" style={styles.backIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerText} onPress={handleGroupDetailsPress}>
          <Text style={styles.groupName}>{groupName}</Text>
          <Text style={styles.membersCount}>Members: {selectedContacts.length}</Text>
          <Text style={styles.onlineCount}>Online: {onlineUsers.length}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter message"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Group Details</Text>
            <Text style={styles.modalGroupName}>{groupName}</Text>
            <FlatList
              data={selectedContacts}
              keyExtractor={(item) => item.email}
              renderItem={renderMember}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#007bff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    flex: 1,
    alignItems: 'center',
  },
  backIcon: {
    marginRight: 10,
    color: '#fff',
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  membersCount: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 10,
  },
  onlineCount: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
  },
  timestamp: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    textAlign: 'right',
  },
  dateLabel: {
    alignSelf: 'center',
    backgroundColor: '#e1e1e1',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 10,
    marginVertical: 5,
    fontSize: 12,
    color: '#333',
  },
  messageList: {
    flexGrow: 1,
    padding: 10,
  },
  messageBubble: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 15,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: '#CBE1F7',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#e4e6eb',
    alignSelf: 'flex-start',
  },
  sender: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  messageText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007bff',
  },
  modalGroupName: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
    fontStyle: 'italic',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'stretch',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  memberName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
});



export default GroupChatRoom;
