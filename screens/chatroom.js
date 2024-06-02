import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, KeyboardAvoidingView } from 'react-native';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chatroom = ({ route }) => {
  const { contact } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState('');
  const [isRecipientConnected, setIsRecipientConnected] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [lastSeenAt, setLastSeenAt] = useState('');
  const [isTyping, setIsTyping] = useState(false);


  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const newSocket = io('http://192.168.29.252:3000');
    setSocket(newSocket);

    fetchEmailFromStorage();

    newSocket.on('receive_message', (data) => {
      console.log('receive_message event received:', data);
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on('user_status_update', ({ email, status, lastSeenTime }) => {
      console.log('user_status_update event received:', email, status, lastSeenTime);
      setLastSeenAt(lastSeenTime);
      if (email === contact.email) {
        setIsRecipientConnected(status === 'active');
        if (status === 'inactive') {
          setLastSeenAt(lastSeenTime);
        }
      }
      if (email === loggedInUserEmail && status === 'active') {
        setUnreadMessagesCount(0); // Reset unread messages count when the user becomes active
        // setShowUnreadBanner(true); // Show unread messages banner when user becomes active
      }
    });

    newSocket.on('unread_messages_count', ({ count }) => {
      console.log('unread_messages_count event received:', count);
      if (count > 0) {
        setUnreadMessagesCount(count);
        // setShowUnreadBanner(true); // Show unread messages banner
      }
    });

    newSocket.on('typing', (sender) => {
      console.log('typing event received:', sender);
      if (sender === contact.email) {
        setIsTyping(true);
      }
    });

    newSocket.on('stop_typing', (sender) => {
      console.log('stop_typing event received:', sender);
      if (sender === contact.email) {
        setIsTyping(false);
      }
    });

    return () => {
      if (loggedInUserEmail) {
        newSocket.emit('user_inactive', loggedInUserEmail);
        setLastSeenAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      newSocket.close();
    };
  }, [contact.email, loggedInUserEmail]);

  useEffect(() => {
    if (loggedInUserEmail && socket) {
      socket.emit('user_active', loggedInUserEmail);
    }
  }, [loggedInUserEmail, socket]);

  useEffect(() => {
    if (loggedInUserEmail) {
      fetchChatMessages();
    }
  }, [loggedInUserEmail]);

  const fetchEmailFromStorage = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) {
        setLoggedInUserEmail(storedEmail);
      }
    } catch (error) {
      console.error("Error fetching email from storage:", error);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await fetch(`http://192.168.29.252:3000/api/messages?loggedInUserEmail=${loggedInUserEmail}&contactEmail=${contact.email}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error("Failed to fetch chat messages");
      }
    } catch (error) {
      console.error("Error fetching chat messages:", error);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        message,
        sender: loggedInUserEmail,
        receiver: contact.email,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      console.log('Sending message:', newMessage);
      socket.emit('send_message', newMessage);
      setMessage('');
      socket.emit('stop_typing', { sender: loggedInUserEmail, receiver: contact.email });
    }
  };

  const handleTyping = (text) => {
    setMessage(text);
    if (!typingTimeoutRef.current) {
      console.log('Emitting typing event');
      socket.emit('typing', { sender: loggedInUserEmail, receiver: contact.email });
    }
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      console.log('Emitting stop_typing event');
      socket.emit('stop_typing', { sender: loggedInUserEmail, receiver: contact.email });
      typingTimeoutRef.current = null;
    }, 1000); // Stop typing after 1 second of inactivity
  };

  const renderItem = ({ item, index }) => {
    const isMyMessage = item.sender === loggedInUserEmail;
    const messageStyle = isMyMessage ? styles.myMessage : styles.theirMessage;
    const alignStyle = isMyMessage ? 'flex-end' : 'flex-start';

    return (
      <View style={[styles.messageContainer, { justifyContent: alignStyle }]}>
        <View style={[styles.message, messageStyle]}>
          <Text style={styles.messageText}>{item.message}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        
      </View>
    );
  };



  const markMessagesAsRead = async () => {
    try {
      await fetch('http://192.168.29.252:3000/api/messages/markAsRead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loggedInUserEmail, contactEmail: contact.email }),
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.contactName}>{contact.username}</Text>
        {isRecipientConnected ? (
          <Text style={styles.onlineText}>
            {isTyping ? 'typing...' : 'Online'}
          </Text>
        ) : (
          <Text style={styles.offlineText}>
            {lastSeenAt && `Last seen at ${lastSeenAt}`}
          </Text>
        )}
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={handleTyping}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={sendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  contactName: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  onlineText: {
    color: 'green',
    textAlign: 'center',
  },
  offlineText: {
    color: 'red',
    textAlign: 'center',
  },
  unreadBanner: {
    backgroundColor: 'white',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignSelf: 'center',
    position: 'absolute',
    top: 0,
    zIndex: 1,
  },
  unreadText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'black',
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  messageContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  message: {
    borderRadius: 8,
    padding: 10,
    maxWidth: '80%',
    marginBottom: 5,
  },
  myMessage: {
    backgroundColor: '#CBE1F7',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
  },
  onlineMessage: {
    borderColor: 'blue',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
});

export default Chatroom;
