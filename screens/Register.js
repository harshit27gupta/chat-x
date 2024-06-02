import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Dimensions,
  ActivityIndicator, // Import ActivityIndicator
  ScrollView,
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import WavyHeader from "../WavyHeader1";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [location, setLocation] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const user = {
    username: username,
    email: email,
    password: password,
    phoneNumber: phoneNumber,
    bio: bio,
    dateOfBirth: dateOfBirth,
    location: location,
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRegister = () => {
    if (!email || !username || !password || !confirmPassword || !phoneNumber || !dateOfBirth || !location) {
      alert("Please fill out all required fields");
      return;
    }

   

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true); // Show loader

    setTimeout(() => {
      axios.post("http://192.168.29.252:3000/register", {username,email})
        .then((res) => {
          console.log(res.data);
          alert("You are almost there,Please verify your email");
          axios.post("http://192.168.29.252:3000/send-otp", { email })
          .then((otpRes) => {
            console.log(otpRes.data);
            // Handle OTP sent successfully
          })
          .catch((otpError) => {
            console.error("Error sending OTP:", otpError);
            // Handle OTP sending failure
          });
        // Navigate to the verify screen
        navigation.navigate("verify", user );
        })
        .catch((error) => {
          console.log(error);
          alert("Failed to register user");
        })
        .finally(() => {
          setLoading(false); // Hide loader
        });
    }, 3000); // Delay axios request by 3 seconds
  };

  return (
    <View style={styles.container}>
      <WavyHeader
        customStyles={styles.svgCurve}
        headerText="Join Us Now!"
        headerTextStyle={styles.headerText}
      />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.welcomeMsg}></View>
        <View style={styles.inputContainer}>
          <View style={styles.inputWithIcon}>
            <FontAwesome
              name="user"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.inputWithIcon}>
            <MaterialIcons
              name="email"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputWithIcon}>
            <FontAwesome
              name="phone"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
          <View style={styles.inputWithIcon}>
            <FontAwesome
              name="calendar"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Date of Birth format(DD/MM/YYYY)"
              value={dateOfBirth}
              onChangeText={setDateOfBirth}
            />
          </View>
          <View style={styles.inputWithIcon}>
            <FontAwesome
              name="map-marker"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
            />
          </View>
          <View style={styles.inputWithIcon}>
            <FontAwesome
              name="info"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
            />
          </View>
          <View style={styles.inputWithIcon}>
            <MaterialIcons
              name="lock"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
            />
            <Pressable onPress={togglePasswordVisibility} style={styles.icon}>
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="black"
              />
            </Pressable>
          </View>

          <View style={styles.inputWithIcon}>
            <MaterialIcons
              name="lock"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isConfirmPasswordVisible}
            />
            <Pressable
              onPress={toggleConfirmPasswordVisibility}
              style={styles.icon}
            >
              <Ionicons
                name={isConfirmPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          {loading ? (
            <ActivityIndicator size="large" color="#FF6347" /> // Show loader
          ) : (
            <Pressable style={styles.signInButton} onPress={handleRegister}>
              <Text style={styles.signInButtonText}>Sign up</Text>
            </Pressable>
          )}
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.signUpText}>
              Already have an account?{" "}
              <Text style={styles.signUpLink}>Sign in </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFF00",
  },
  svgCurve: {
    width: Dimensions.get("window").width,
    height: 150, // Adjust this height to fit your wavy header
  },
  headerText: {
    fontSize: 30,
    color: "black",
    marginTop: 70,
    textAlign: "center", // Adjust this to position the text properly
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingTop: 10, // Adjust this value to avoid overlap with the wavy header
  },
  welcomeMsg: {
    marginTop: 50,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 30,
    color: "black",
  },
  inputContainer: {
    marginTop: 10,
    paddingHorizontal: 20,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 3,
    borderRadius: 5,
    borderColor: "lightgray",
    marginTop: 30,
    paddingHorizontal: 10,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  signInButton: {
    backgroundColor: "#FF6347", // Example color
    borderRadius: 4,
    paddingVertical: 8, // Adjust the padding here to make the button smaller
    paddingHorizontal: 20, // Adjust the padding here to make the button smaller
    alignItems: "center",
    alignSelf: "center", // Center the button horizontally
    marginTop: 40,
  },
  signInButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end", // Align the container to the right
    marginTop: 10,
    borderBottomColor: "black", // Underline color // Underline thickness
  },
  forgotPasswordText: {
    color: "black",
    textDecorationLine: "underline", // Underline style
  },
  signUpText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 20,
  },
  signUpLink: {
    textDecorationLine: "underline", // Underline style
    color: "blue", // Link color
  },
});

export default Register;
