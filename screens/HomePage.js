import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Image
} from "react-native";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import { MaterialIcons, FontAwesome, } from 'react-native-vector-icons';
import { Modal, Portal, Provider, Button } from 'react-native-paper';
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const Tab = createBottomTabNavigator();

const Header = ({ openModal, showSearchBar }) => (
  <View style={styles.header}>
    <Text style={styles.headerText}>Messages</Text>
    <View style={styles.headerIcons}>
      <TouchableOpacity onPress={showSearchBar}>
        <FontAwesome name="search" size={20} color="black" />
      </TouchableOpacity>
      <TouchableOpacity onPress={openModal}>
        <MaterialIcons name="more-vert" size={24} color="black" />
      </TouchableOpacity>
    </View>
  </View>
);

const SearchBar = ({ searchText, setSearchText, hideSearchBar }) => (
  <View style={styles.searchBar}>
    <FontAwesome name="search" size={20} color="black" />
    <TextInput
      style={styles.searchInput}
      value={searchText}
      onChangeText={setSearchText}
      placeholder="Search..."
    />
    <TouchableOpacity onPress={hideSearchBar}>
      <MaterialIcons name="clear" size={20} color="black" />
    </TouchableOpacity>
  </View>
);

const EmptyMessage = ({ message }) => (
  <View style={styles.emptyMessage}>
    <Text>{message}</Text>
  </View>
);

const GroupsScreen = () =>{
  const [userEmail, setUserEmail] = useState('');
  const [userGroups, setUserGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation=useNavigation();
  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        // Retrieve user email from async storage
        const email = await AsyncStorage.getItem('email');
        setUserEmail(email);
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    };

    fetchUserEmail();
  }, []);
  const handleRefresh = () => {
    setLoading(true);
    if (userEmail) {
      const fetchUserGroups = async () => {
        try {
          // Fetch user's groups from the backend
          const response = await axios.get('http://192.168.29.252:3000/groups', {
            params: {
              userEmail: userEmail,
            },
          });
          setUserGroups(response.data);
        } catch (error) {
          console.error('Error fetching user groups:', error);
        }
      };

      fetchUserGroups();
    }
  };

  useEffect(() => {
    if (userEmail) {
      const fetchUserGroups = async () => {
        try {
          // Fetch user's groups from the backend
          const response = await axios.get('http://192.168.29.252:3000/groups', {
            params: {
              userEmail: userEmail,
            },
          });
          setUserGroups(response.data);
        } catch (error) {
          console.error('Error fetching user groups:', error);
        }
      };

      fetchUserGroups();
    }
  }, [userEmail]);
  const navigateToGroupChatRoom = (groups) => {
    navigation.navigate('Groupchatroom', { groups });
  };
 

  return (
    <View style={styles.container}>
    <TouchableOpacity style={styles. refreshButton} onPress={handleRefresh}>
    <Text style={styles.refreshButtonText}>Refresh</Text>
    </TouchableOpacity>
      {userGroups.length > 0 ? (
        <FlatList
          data={userGroups}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => navigateToGroupChatRoom(item)}>
            <View style={styles.groupContainer}>
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.membersCount}>{item.memberCount} members</Text>
            </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.emptyMessage}>No groups formed</Text>
      )}
    </View>
  );
};
const DirectMessagesScreen = () => {
  const [contacts, setContacts] = useState([]);
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const handlePress = (item) => {
    navigation.navigate('chat', { contact: item });
  };

  const fetchContacts = async () => {
    try {
      const response = await axios.get('http://192.168.29.252:3000/contacts');
      const contactsData = response.data;

      // Filter contacts to only include those with whom the user has chatted
      setContacts(contactsData);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
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

const CallHistoryScreen = () => {
  const [callHistory, setCallHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCallHistory();
  }, []);


  const handleRefresh = () => {
    setLoading(true);
    fetchCallHistory();
  };
 

  const fetchCallHistory = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('email');
      if (storedEmail) {
        const response = await axios.get(`http://192.168.29.252:3000/api/call-history-with-usernames?email=${storedEmail}`);
        setCallHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.callItem}>
      <View style={styles.callDetails}>
        <Ionicons name="call" size={24} color="black" style={styles.callIcon} />
        <View style={styles.callText}>
          <Text style={styles.caller}>Caller: {item.caller}</Text>
          <Text style={styles.receiver}>Receiver: {item.receiver}</Text>
          <Text style={styles.time}>Start Time: {item.startTime}</Text>
          <Text style={styles.duration}>Duration: {item.duration}</Text>
        </View>
      </View>
      <View style={styles.arrowContainer}>
        {item.isOutgoing ? (
         <Feather name="arrow-up-right" size={24} color="green" />
        ) : (
          <Feather name="arrow-down-left" size={24} color="red" />
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles. refreshButton} onPress={handleRefresh}>
      <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
      <FlatList
        data={callHistory}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text>No calls yet</Text>}
      />
    </View>
  );
};

const HomePage = () => {
  const navigation=useNavigation();
  const [searchText, setSearchText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isSearchBarVisible, setIsSearchBarVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);
  const showSearchBar = () => setIsSearchBarVisible(true);
  const hideSearchBar = () => {
    setSearchText('');
    setIsSearchBarVisible(false);
  };

  return (
    <Provider>
      <View style={styles.container}>
        {isSearchBarVisible ? (
          <SearchBar searchText={searchText} setSearchText={setSearchText} hideSearchBar={hideSearchBar} />
        ) : (
          <Header openModal={openModal} showSearchBar={showSearchBar} />
        )}
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'Groups') {
                iconName = 'group';
              } else if (route.name === 'Direct Messages') {
                iconName = 'message';
              }  else if (route.name === 'Call History') {
                iconName = 'call';
              }

              return <MaterialIcons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Groups" component={GroupsScreen} />
          <Tab.Screen name="Direct Messages" component={DirectMessagesScreen} />
          <Tab.Screen name="Call History" component={CallHistoryScreen} />
        </Tab.Navigator>
        <Portal>
          <Modal visible={modalVisible} onDismiss={closeModal}>
            <View style={styles.modalContent}>
              <Pressable
             onPress={()=>{
              navigation.navigate("group");
             }}
              
              >
                <Text  style={styles.modalicons}>
                  New group
                </Text>
              </Pressable>
              <Pressable
              onPress={()=>{
               navigation.navigate("contact");
              }}
              
              >
                <Text    style={styles.modalicons}>
                New Direct message
                </Text>
              </Pressable>
              <Pressable
                onPress={()=>{
                  navigation.navigate("profile");
                 }}
                 
              
              >
                <Text   style={styles.modalicons}>
                  profile
                </Text>
              </Pressable>
              <Pressable>
                <Text   style={styles.modalicons}>
                  settings
                </Text>
              </Pressable>
              <Button onPress={closeModal}>Close</Button>
            </View>
          </Modal>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  groupContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  membersCount: {
    fontSize: 16,
    color: '#666',
  },
  emptyMessage: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  callDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  refreshButton: {
    alignSelf: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  callIcon: {
    marginRight: 10,
  },
  callText: {
    flex: 1,
  },
  caller: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  receiver: {
    marginBottom: 5,
  },
  time: {
    marginBottom: 5,
  },
  duration: {
    marginBottom: 5,
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerText: {
    fontSize: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalicons:{
marginTop:10,
fontSize:20,
  },
  callItem: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
  },
  emptyMessage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  dmsList: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dmItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  dmText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  noDmsText: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noDmsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default HomePage;
