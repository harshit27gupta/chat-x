require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const port = 3000;
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


console.log("MONGODB_URI:", process.env.MONGODB_URI); // Check if the variable is loaded

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const User = mongoose.model("User", {
  username: String,
  email: String,
  password: String,
  phoneNumber: String,
  bio: String,
  dateOfBirth: String,
  location: String,
  profilephoto: String
});

app.post("/register", async (req, res) => {
  const { username, email } = req.body;

  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      return res.status(400).json({ status: "error", message: "Email already registered!" });
    }

    const oldUser2 = await User.findOne({ username });
    if (oldUser2) {
      return res.status(400).json({ status: "error", message: "Username already taken!" });
    }
    res.status(200).json({ status: "success", message: "OTP sent " });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ status: "error", message: "Failed to register user", error: error.message });
  }
});

const otpMap = {};
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "harshit.raj2023@gmail.com",
    pass: "jabm wxak qzvu ugux",
  },
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

app.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const OTP = generateOTP();

  try {
    const info = await transporter.sendMail({
      from: "harshit.raj2023@gmail.com",
      to: email,
      subject: "OTP for verification",
      text: `Your OTP for verification is: ${OTP}`,
    });
    otpMap[email] = OTP;
    console.log("Email sent: " + info.response);
    res.status(200).json({ status: "success", message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ status: "error", message: "Failed to send OTP", error: error.message });
  }
});

app.post("/verify-otp", async (req, res) => {
  const { username, email, password, phoneNumber, bio, dateOfBirth, location, otp } = req.body;

  if (!otpMap[email]) {
    return res.status(400).json({ status: "error", message: "OTP not found. Please request a new OTP." });
  }

  if (parseInt(otpMap[email]) !== parseInt(otp)) {
    return res.status(400).json({ status: "error", message: "Incorrect OTP" });
  }

  delete otpMap[email];

  const newUser = new User({ username, email, password, phoneNumber, bio, dateOfBirth, location });
  await newUser.save();
  res.status(200).json({ status: "success", message: "OTP verified and registered successfully" });
});

const generateSecretKey = () => {
  const secretKey = crypto.randomBytes(32).toString("hex");
  return secretKey;
};

app.post("/logincheck", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email" });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const secretKey = generateSecretKey();
    const token = jwt.sign({ userId: user._id }, secretKey);
    console.log(token)
    res.status(200).json({ message: "Authentication successful", token });
  } catch (error) {
    console.error("Login Failed:", error);
    res.status(500).json({ message: "Login Failed" });
  }
});
app.post('/api/verify-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      res.status(200).json({ message: 'Email verified' });
    } else {
      res.status(404).json({ message: 'Email not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
const otpMap1 = {};
app.post("/send-otp1", async (req, res) => {
  const { email } = req.body;
  const OTP = generateOTP();

  try {
    const info = await transporter.sendMail({
      from: "harshit.raj2023@gmail.com",
      to: email,
      subject: "Email verification",
      text: `Please verify your email using the otp: ${OTP}`,
    });
    otpMap1[email] = OTP;
    console.log("Email sent: " + info.response);
    res.status(200).json({ status: "success", message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ status: "error", message: "Failed to send OTP", error: error.message });
  }
});
app.post("/verify-otp1", async (req, res) => {
  const {email,otp } = req.body;

  if (!otpMap1[email]) {
    return res.status(400).json({ status: "error", message: "OTP not found. Please request a new OTP." });
  }

  if (parseInt(otpMap1[email]) !== parseInt(otp)) {
    return res.status(400).json({ status: "error", message: "Incorrect OTP" });
  }
  delete otpMap1[email];
  res.status(200).json({ status: "success", message: "email verified" });
});
app.post('/api/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      user.password = newPassword; // Ideally, hash the password before saving it
      await user.save();
      res.status(200).json({ message: 'Password updated successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get("/contacts", async (req, res) => {
  try {
    const contacts = await User.find({}, "username email phoneNumber profilephoto");
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ message: "Failed to fetch contacts" });
  }
});

// Endpoint to fetch user profile data by email
app.get('/api/user', async (req, res) => {
  const email = req.query.email;
  try {
    const user = await User.findOne({ email: email });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

app.post('/update', async (req, res) => {
  try {
    const { email, ...updatedDetails } = req.body; // Assuming email is sent with other user details
    const user = await User.findOneAndUpdate({ email }, updatedDetails, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User details updated successfully', user });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
const Chat = mongoose.model("Chat", {
  sender: String,
  receiver: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

// User status map
let  userStatus = {};
let socketToUser = {};
let unreadMessagesCount = {};
let lastSeenTimes = {};
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('user_active', (email) => {
    userStatus[email] = 'active';
    socketToUser[socket.id] = email;
    io.emit('user_status_update', { email, status: 'active' });
    console.log(`${email} is active`);

    // Notify the new user about all other users' statuses
    for (const [userEmail, status] of Object.entries(userStatus)) {
      if (userEmail !== email) {
        socket.emit('user_status_update', { email: userEmail, status, lastSeenTime: lastSeenTimes[userEmail] });
      }
    }

    // Reset unread messages count for the user and send count
    unreadMessagesCount[email] = 0;
    socket.emit('unread_messages_count', { count: 0 });
  });

  socket.on('user_inactive', (email) => {
    userStatus[email] = 'inactive';
    const lastSeenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lastSeenTimes[email] = lastSeenTime;
    io.emit('user_status_update', { email, status: 'inactive', lastSeenTime });
    console.log(`${email} is inactive`);
  });

  socket.on('send_message', async (data) => {
    console.log('Message received:', data);
    const { sender, receiver } = data;

    io.emit('receive_message', {
      ...data,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    try {
      const chat = new Chat({
        sender,
        receiver,
        message: data.message,
        timestamp: new Date(),
      });
      await chat.save();

      if (userStatus[receiver] !== 'active') {
        unreadMessagesCount[receiver] = (unreadMessagesCount[receiver] || 0) + 1;
        io.emit('unread_messages_count', { email: receiver, count: unreadMessagesCount[receiver] });
      }
    } catch (error) {
      console.error("Error saving chat message:", error);
    }
  });

  socket.on('typing', (data) => {
    const { sender, receiver } = data;
    console.log(`${sender} is typing...`);
    socket.broadcast.to(receiver).emit('typing', { sender });
  });

  socket.on('stop_typing', (data) => {
    const { sender, receiver } = data;
    console.log(`${sender} stopped typing.`);
    socket.broadcast.to(receiver).emit('stop_typing', { sender });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    const email = socketToUser[socket.id];
    if (email) {
      userStatus[email] = 'inactive';
      const lastSeenTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      lastSeenTimes[email] = lastSeenTime;
      io.emit('user_status_update', { email, status: 'inactive', lastSeenTime });
      delete socketToUser[socket.id];
    }
  });
});

app.get("/api/messages", async (req, res) => {
  const { loggedInUserEmail, contactEmail } = req.query;

  try {
    const messages = await Chat.find({
      $or: [
        { sender: loggedInUserEmail, receiver: contactEmail },
        { sender: contactEmail, receiver: loggedInUserEmail }
      ]
    }).sort({ timestamp: 1 });

    const formattedMessages = messages.map(msg => ({
      ...msg._doc,
      timestamp: msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

app.post("/api/messages/markAsRead", async (req, res) => {
  const { loggedInUserEmail, contactEmail } = req.body;

  try {
    await Chat.updateMany(
      { sender: contactEmail, receiver: loggedInUserEmail, isRead: false },
      { isRead: true }
    );
    unreadMessagesCount[loggedInUserEmail] = 0;
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Failed to mark messages as read" });
  }
});


app.get("/api/dms", async (req, res) => {
  const loggedInUserEmail = req.query.loggedInUserEmail;
  
  try {
    const userDMs = await Chat.find({
      sender: loggedInUserEmail,
    }).sort({ timestamp: 1 });

    res.json(userDMs);
  } catch (error) {
    console.error("Error fetching direct messages:", error);
    res.status(500).json({ message: "Failed to fetch direct messages" });
  }
});
const callHistorySchema = new mongoose.Schema({
  caller: String,
  receiver: String,
  startTime: String,
  endTime: String,
  duration: String,
});

const CallHistory = mongoose.model('CallHistory', callHistorySchema);

// Function to format time as hh:mm am/pm
const formatTime = (date) => {
  const hours = date.getHours() % 12 || 12; // Convert hours to 12-hour format
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? 'am' : 'pm';
  return `${hours}:${minutes}:${seconds} ${ampm}`;
};

// Function to calculate duration in hh:mm:ss
const calculateDuration = (startTime, endTime) => {
  // Convert start and end times to Date objects
  let start = new Date('1970-01-01T' + convertTo24Hour(startTime) + 'Z');
  let end = new Date('1970-01-01T' + convertTo24Hour(endTime) + 'Z');
  console.log("Start Time:", start);
  console.log("End Time:", end);
  // Calculate the difference in milliseconds
  let difference = end - start;

  // If the difference is negative, it means end time is on the next day
  if (difference < 0) {
    difference += 24 * 60 * 60 * 1000;
  }

  // Convert difference to hours, minutes, and seconds
  const diffInSeconds = Math.floor(difference / 1000);
  const hours = Math.floor(diffInSeconds / 3600);
  const minutes = Math.floor((diffInSeconds % 3600) / 60);
  const seconds = diffInSeconds % 60;

  // Format the result as hh:mm:ss
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// Helper function to pad single digits with leading zero
const pad = (number) => {
  return number < 10 ? '0' + number : number;
};
function convertTo24Hour(time) {
  let [hours, minutes, seconds, period] = time.match(/(\d+):(\d+):(\d+)\s(AM|PM)/i).slice(1);
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);
  seconds = parseInt(seconds, 10);

  if (period.toUpperCase() === 'PM' && hours < 12) {
    hours += 12;
  } else if (period.toUpperCase() === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
  // Function to calculate duration in hh:mm:ss
// Function to calculate duration in hh:mm:ss




app.post('/log-call', async (req, res) => {
  const { caller, receiver, startTime } = req.body;

  const formattedStartTime = formatTime(new Date(startTime));

  const newCallHistory = new CallHistory({
    caller,
    receiver,
    startTime: formattedStartTime,
    endTime: null,
    duration: null,
  });

  try {
    await newCallHistory.save();
    res.status(200).json({ message: 'Call logged successfully' });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/end-call', async (req, res) => {
  const { caller, receiver, endTime } = req.body;

  try {
    const callHistory = await CallHistory.findOne({ caller, receiver }).sort({ startTime: -1 });
    if (callHistory) {
      const formattedEndTime = formatTime(new Date(endTime));
      callHistory.endTime = formattedEndTime;
      callHistory.duration = calculateDuration(callHistory.startTime, formattedEndTime);
      await callHistory.save();
      res.status(200).json({ message: 'Call end logged successfully' });
    } else {
      res.status(404).json({ message: 'Call history not found' });
    }
  } catch (error) {
    res.status(500).send(error);
  }
});
// API endpoint to fetch call history for a specific user
app.get('/api/call-history-with-usernames', async (req, res) => {
  const email = req.query.email;
  try {
    const callHistory = await CallHistory.find({ $or: [{ caller: email }, { receiver: email }] });
    const callHistoryWithUsernames = await Promise.all(callHistory.map(async (record) => {
      const callerUser = await User.findOne({ email: record.caller }).select('username');
      const receiverUser = await User.findOne({ email: record.receiver }).select('username');
      const isOutgoing = record.caller === email;
      return {
        ...record.toJSON(),
        caller: callerUser ? callerUser.username : record.caller,
        receiver: receiverUser ? receiverUser.username : record.receiver,
        isOutgoing: isOutgoing
        
      };
    }));
    res.json(callHistoryWithUsernames);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
const GroupChatSchema = new mongoose.Schema({
  name: String,
  members: [String],
  messages: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});
const GroupChat = mongoose.model("GroupChat", GroupChatSchema);

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [
    {
      username: { type: String, required: true },
      email: { type: String, required: true }
    }
  ],
  memberCount: {
    type: Number,
    default: function () {
      return this.members.length;
    }
  },
  messages: [
    {
      sender: String,
      text: String,
      timestamp: { type: Date, default: Date.now }
    }
  ]
});
const Group = mongoose.model('Group', GroupSchema);

app.post('/create-group', async (req, res) => {
  const { name, members } = req.body;
  const newGroup = new Group({ name, members, messages: [] });
  newGroup.memberCount = members.length;
  await newGroup.save();
  res.status(201).json(newGroup);
});

app.get('/groups', async (req, res) => {
  try {
    const { userEmail } = req.query;

    const groups = await Group.find({ 'members.email': userEmail });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

let onlineUsers = {}; // Keep track of online users in each group

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_group', async (groupName) => {
    console.log(`Joining group: ${groupName}`);
    socket.join(groupName);

    // Fetch user email from socket handshake query (assuming you pass it during connection)
    const userEmail = socket.handshake.query.email;
    if (!onlineUsers[groupName]) {
      onlineUsers[groupName] = new Set();
    }
    onlineUsers[groupName].add(userEmail);

    // Emit updated online users count to the group
    io.to(groupName).emit('online_users', Array.from(onlineUsers[groupName]));

    socket.on('disconnect', () => {
      console.log('A user disconnected');
      if (onlineUsers[groupName]) {
        onlineUsers[groupName].delete(userEmail);
        io.to(groupName).emit('online_users', Array.from(onlineUsers[groupName]));
      }
    });
  });

  socket.on('send_message1', async (data) => {
    const { groupName, text, sender, timestamp } = data;
    console.log(`Message from ${sender} to group ${groupName}: ${text}`);
    const group = await Group.findOne({ name: groupName });
    const message = { sender, text, timestamp: Date.now() };
    io.to(groupName).emit('receive_message1', message);
    group.messages.push(message);
    await group.save();
    console.log(`Emitting message to group ${groupName}: ${text}`);
  });

  app.get('/group-messages', async (req, res) => {
    try {
      const { groupName } = req.query;
      const group = await Group.findOne({ name: groupName });
      if (group) {
        res.json(group.messages);
      } else {
        res.status(404).json({ error: 'Group not found' });
      }
    } catch (error) {
      console.error('Error fetching group messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});



server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
