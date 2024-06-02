import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DirectMessagesScreen = () => {
  const [dms, setDMs] = useState([]);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchEmailFromStorage = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) {
        setLoggedInUserEmail(storedEmail);
        fetchDMs(storedEmail); // Pass storedEmail directly to fetchDMs
      }
    } catch (error) {
      console.error("Error fetching email from storage:", error);
    }
  };
  
  useEffect(()=>{
    fetchEmailFromStorage();
  },[])


  const fetchDMs = async (email) => {
    try {
      const response = await fetch(
        `http://192.168.29.252:3000/api/dms?loggedInUserEmail=${email}`
      );
      const data = await response.json();
      setDMs(data);
    } catch (error) {
      console.error("Error fetching direct messages:", error);
    } finally {
      setLoading(false); // Update loading state after data fetching is completed
    }
  };
  

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dmItem}
      onPress={() => navigation.navigate("Chatroom", { dm: item })}
    >
      <Text style={styles.dmText}>{item.message}</Text>
    </TouchableOpacity>
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
      <FlatList
        data={dms}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={dms.length === 0 ? styles.noDmsContainer : null}
        ListEmptyComponent={() => (
          <Text style={styles.noDmsText}>No direct messages yet</Text>
        )}
      />
    </View>
  );
  
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  
});

export default DirectMessagesScreen;
