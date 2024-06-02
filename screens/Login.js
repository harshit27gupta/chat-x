import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import WavyHeader from "../WavyHeader1";
import { Fontisto } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState(""); // State for email
  const [password, setPassword] = useState(""); // State for password
  const [loading, setLoading] = useState(false); // Add loading state
  const navigation = useNavigation();

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");

        if (token) {
          navigation.replace("home");
        }
      } catch (err) {
        console.log("error message", err);
      }
    };
    checkLoginStatus();
  }, []);
  


  const handleLogin = () => {
    if (!email || !password) {
      alert("Please fill out all required fields");
      return;
    }

  
    setLoading(true); // Show loader
  
    axios
      .post("http://192.168.29.252:3000/logincheck", { email, password })
      .then((response) => {
        console.log(response);
        if (response.status === 200) {
          // Simulate a delay of 3 seconds before navigating to the home screen
          setTimeout(() => {
            setLoading(false); // Hide loader
            const token = response.data.token;
            AsyncStorage.setItem("authToken", token);
            AsyncStorage.setItem("email", email);
            navigation.replace("home");
          }, 3000);
        } else {
          setLoading(false); // Hide loader
          Alert.alert("Login Error", response.data.message);
        }
      })
      .catch((error) => {
        setLoading(false); // Hide loader
        Alert.alert("Login Error", "Failed to authenticate");
        console.error("Login Error:", error);
      });
  };
  
  

  return (
    <View style={styles.container}>
      <WavyHeader customStyles={styles.svgCurve} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.welcomeMsg}>
          <Text style={styles.welcomeText}>Hello there,</Text>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputWithIcon}>
            <Fontisto
              name="email"
              size={20}
              color="black"
              style={styles.icon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="gray"
              value={email} // Bind value to the state
              onChangeText={(text)=>setEmail(text)} // Update email state on change
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
              placeholder="Enter your password"
              placeholderTextColor="gray"
              secureTextEntry={!isPasswordVisible}
              value={password} // Bind value to the state
              onChangeText={(text)=>setPassword(text)} // Update password state on change
            />
            <Pressable onPress={togglePasswordVisibility} style={styles.icon}>
              <Ionicons
                name={isPasswordVisible ? "eye-off" : "eye"}
                size={24}
                color="black"
              />
            </Pressable>
          </View>
          <Pressable
  style={styles.forgotPasswordContainer}
  onPress={() => {
    navigation.navigate("emailverfiy");
  }}
>
  <Text style={styles.forgotPasswordText}>
    Forgot Password?
  </Text>
</Pressable>

          {loading ? (
            <ActivityIndicator size="large" color="#FF6347" /> // Show loader
          ) : (
            <Pressable style={styles.signInButton} onPress={handleLogin}>
              <Text style={styles.signInButtonText}>Sign in</Text>
            </Pressable>
          )}
          <Pressable onPress={() => navigation.navigate("register")}>
            <Text style={styles.signUpText}>
              New here? <Text style={styles.signUpLink}>Sign up </Text>
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
    marginTop: 30,
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

export default Login;
