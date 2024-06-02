import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator, Image, Pressable, TextInput, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Profile = () => {
  const [email, setEmail] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUserDetails, setEditedUserDetails] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const fetchEmailFromStorage = async () => {
      const storedEmail = await AsyncStorage.getItem("email");
      if (storedEmail) {
        setEmail(storedEmail);
      } else {
        setLoading(false); // Stop loading if no email found
      }
    };

    fetchEmailFromStorage();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (email) {
        try {
          const response = await fetch(`http://192.168.29.252:3000/api/user?email=${email}`);
          const data = await response.json();
          setUserDetails(data);
          setEditedUserDetails(data);
        } catch (error) {
          console.log("Error fetching user details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserDetails();
  }, [email]);

  

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    setLoading(true); // Start loading again while saving
    setUserDetails(editedUserDetails); // Optimistically update the state
  
    try {
      const response = await fetch("http://192.168.29.252:3000/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUserDetails),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      alert("Changes saved successfully");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("Failed to save changes");
    } finally {
      setLoading(false);
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    setTimeout(async () => {
      await AsyncStorage.removeItem("email");
      await AsyncStorage.removeItem("authToken");
      setLoggingOut(false);
      setModalVisible(false);
      navigation.navigate("Login");
    }, 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const profilePhoto = userDetails.profilePhoto ? { uri: userDetails.profilePhoto.toString() } : require("../assets/default.jpeg");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.profileIconContainer}>
        <Image
          source={profilePhoto}
          style={styles.profileIcon}
        />
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Username:</Text>
        {isEditing ? (
          <TextInput
            style={styles.value}
            value={editedUserDetails.username}
            onChangeText={(text) =>
              setEditedUserDetails((prev) => ({ ...prev, username: text }))
            }
          />
        ) : (
          <Text style={styles.value}>{userDetails.username}</Text>
        )}
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userDetails.email}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.passwordLabel}>Password:</Text>
        <Text style={styles.value}>{'*'.repeat(userDetails.password.length)}</Text>
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Phone Number:</Text>
        {isEditing ? (
          <TextInput
            style={styles.value}
            value={editedUserDetails.phoneNumber}
            onChangeText={(text) =>
              setEditedUserDetails((prev) => ({ ...prev, phoneNumber: text }))
            }
          />
        ) : (
          <Text style={styles.value}>{userDetails.phoneNumber}</Text>
        )}
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Bio:</Text>
        {isEditing ? (
          <TextInput
            style={styles.value}
            value={editedUserDetails.bio}
            onChangeText={(text) =>
              setEditedUserDetails((prev) => ({ ...prev, bio: text }))
            }
          />
        ) : (
          <Text style={styles.value}>{userDetails.bio}</Text>
        )}
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Date of Birth:</Text>
        {isEditing ? (
          <TextInput
            style={styles.value}
            value={editedUserDetails.dateOfBirth}
            onChangeText={(text) =>
              setEditedUserDetails((prev) => ({ ...prev, dateOfBirth: text }))
            }
          />
        ) : (
          <Text style={styles.value}>{userDetails.dateOfBirth}</Text>
        )}
      </View>
      <View style={styles.detailContainer}>
        <Text style={styles.label}>Location:</Text>
        {isEditing ? (
          <TextInput
            style={styles.value}
            value={editedUserDetails.location}
            onChangeText={(text) =>
              setEditedUserDetails((prev) => ({ ...prev, location: text }))
            }
          />
        ) : (
          <Text style={styles.value}>{userDetails.location}</Text>
        )}
      </View>
      <View style={styles.buttonContainer}>
        {isEditing ? (
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
        )}
      </View>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.logoutButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>
            {loggingOut ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <View style={styles.modalButtonContainer}>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonYes]}
                  onPress={handleLogout}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.modalButtonNo]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>No</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  profileIconContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  detailContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#555",
    flex: 1,
  },
  value: {
    fontSize: 18,
    color: "#666",
    flex: 2,
  },
  passwordLabel: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#555",
    flex: 1,
  },
  password: {
    fontSize: 18,
    color: "#666",
    flex: 2,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  editButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 18,
  },
  modalButtonContainer: {
    flexDirection: "row",
  },
  modalButton: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
  },
  modalButtonYes: {
    backgroundColor: "#28a745",
  },
  modalButtonNo: {
    backgroundColor: "#dc3545",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default Profile;
