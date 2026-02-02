// ===========================================
// Campus Connect - Backend Server
// ===========================================
// This is the heart of our application!
// It handles user authentication, listings,
// and real-time chat using Socket.IO

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const fs = require('fs').promises;
const path = require('path');

// ===========================================
// Server Setup
// ===========================================
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = 3000;

// Middleware - these help process incoming requests
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// ===========================================
// File Paths - Where we store data
// ===========================================
const usersFile = path.join(__dirname, '../data/users.json');
const listingsFile = path.join(__dirname, '../data/listings.json');
const messagesFile = path.join(__dirname, '../data/messages.json');

// ===========================================
// Data Initialization
// ===========================================
// Create default data if files don't exist
async function initializeData() {
  try {
    // Check if users.json exists, if not create it with demo user
    await fs.access(usersFile);
  } catch {
    const defaultUsers = [
      {
        id: 1,
        name: "Demo Student",
        email: "demo@jiit.ac.in",
        password: "demo123",
        rating: 4.5,
        avatar: "D",
        intent: "buy",
        year: "2",
        branch: "CSE",
        courses: ["CS102", "CS204"]
      }
    ];
    await fs.writeFile(usersFile, JSON.stringify(defaultUsers, null, 2));
    console.log('✅ Created users.json with demo data');
  }

  try {
    // Check if listings.json exists, if not create sample listings
    await fs.access(listingsFile);
  } catch {
    const defaultListings = [
      {
        id: 1,
        title: "C++ Programming Tutor - One-on-One Sessions",
        description: "Helping with CS102 assignments and concepts. Available for doubt clearing sessions. 2 years of teaching experience.",
        price: 200,
        category: "Academic",
        type: "Offering",
        urgency: "Low Urgency",
        location: "Boys Hostel, Block C",
        availability: "Weekends, 10 AM - 6 PM",
        images: [],
        sellerId: 1,
        sellerName: "Rahul Mehta",
        sellerRating: 4.5,
        sellerAvatar: "R",
        status: "active",
        postedDate: "2026-01-31",
        relatedCourses: ["CS102"]
      },
      {
        id: 2,
        title: "Introduction to Algorithms - 3rd Edition",
        description: "Well-maintained book, minimal highlighting. Perfect for CS204. Only used for one semester.",
        price: 450,
        category: "Books",
        type: "Selling",
        urgency: "Medium",
        location: "Girls Hostel, Block A",
        availability: "Evenings after 5 PM",
        images: [],
        sellerId: 2,
        sellerName: "Priya Sharma",
        sellerRating: 4.8,
        sellerAvatar: "P",
        status: "sold",
        postedDate: "2026-01-28"
      },
      {
        id: 3,
        title: "Digital Electronics Notes + Previous Year Papers",
        description: "Comprehensive notes for EE201. Includes solved previous year questions. Helped me score 9 CGPA!",
        price: 100,
        category: "Academic",
        type: "Selling",
        urgency: "Low Urgency",
        location: "Boys Hostel, Block A",
        availability: "After 6 PM",
        images: [],
        sellerId: 3,
        sellerName: "Rohan Shah",
        sellerRating: 4.8,
        sellerAvatar: "R",
        status: "active",
        postedDate: "2026-01-30"
      }
    ];
    await fs.writeFile(listingsFile, JSON.stringify(defaultListings, null, 2));
    console.log('✅ Created listings.json with sample data');
  }

  try {
    // Check if messages.json exists, if not create empty array
    await fs.access(messagesFile);
  } catch {
    await fs.writeFile(messagesFile, JSON.stringify([], null, 2));
    console.log('✅ Created messages.json for chat storage');
  }
}

// ===========================================
// Helper Functions
// ===========================================

// Read JSON file and parse it
async function readJSON(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  return JSON.parse(data);
}

// Write data to JSON file
async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// ===========================================
// API Routes - Authentication
// ===========================================

// LOGIN - Check user credentials
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const emailLower = email.toLowerCase();
    
    // Only allow JIIT email addresses
    if (!emailLower.endsWith('@jiit.ac.in') && !emailLower.endsWith('@mail.jiit.ac.in')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Only @jiit.ac.in and @mail.jiit.ac.in email addresses are allowed' 
      });
    }
    
    const users = await readJSON(usersFile);
    const user = users.find(u => u.email.toLowerCase() === emailLower && u.password === password);
    
    if (user) {
      // Don't send password back to client
      const { password, ...userWithoutPassword } = user;
      res.json({ success: true, user: userWithoutPassword });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// SIGNUP - Create new user account
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password, intent, year, branch, courses } = req.body;
    
    // Validate JIIT email domain
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@jiit.ac.in') && !emailLower.endsWith('@mail.jiit.ac.in')) {
      return res.status(400).json({ 
        success: false, 
        message: 'Only @jiit.ac.in and @mail.jiit.ac.in email addresses are allowed' 
      });
    }
    
    const users = await readJSON(usersFile);
    
    // Check if email already exists
    if (users.find(u => u.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    
    // Create new user object
    const newUser = {
      id: users.length + 1,
      name,
      email: emailLower,
      password,
      rating: 0,
      avatar: name.charAt(0).toUpperCase(),
      intent: intent || 'buy',
      year: year || '',
      branch: branch || '',
      courses: courses || []
    };
    
    users.push(newUser);
    await writeJSON(usersFile, users);
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({ success: true, user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===========================================
// API Routes - Listings
// ===========================================

// GET ALL LISTINGS - with optional filtering
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await readJSON(listingsFile);
    const { category, search } = req.query;
    
    let filtered = listings;
    
    // Filter by category if specified
    if (category && category !== 'All') {
      filtered = filtered.filter(l => l.category === category);
    }
    
    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        l.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json(filtered);
  } catch (error) {
    console.error('❌ Error fetching listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET SINGLE LISTING - by ID
app.get('/api/listings/:id', async (req, res) => {
  try {
    const listings = await readJSON(listingsFile);
    const listing = listings.find(l => l.id === parseInt(req.params.id));
    
    if (listing) {
      res.json(listing);
    } else {
      res.status(404).json({ error: 'Listing not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching listing:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE NEW LISTING
app.post('/api/listings', async (req, res) => {
  try {
    const listings = await readJSON(listingsFile);
    const users = await readJSON(usersFile);
    
    // Find the seller's information
    const seller = users.find(u => u.id === req.body.sellerId);
    
    // Create new listing with seller info
    const newListing = {
      id: listings.length + 1,
      ...req.body,
      sellerName: seller.name,
      sellerRating: seller.rating,
      sellerAvatar: seller.avatar,
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0]
    };
    
    listings.push(newListing);
    await writeJSON(listingsFile, listings);
    
    res.json({ success: true, listing: newListing });
  } catch (error) {
    console.error('❌ Error creating listing:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ===========================================
// API Routes - Users
// ===========================================

// GET USER PROFILE - by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const users = await readJSON(usersFile);
    const user = users.find(u => u.id === parseInt(req.params.id));
    
    if (user) {
      // Don't send password to client
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET USER'S LISTINGS - all listings by a specific user
app.get('/api/users/:id/listings', async (req, res) => {
  try {
    const listings = await readJSON(listingsFile);
    const userListings = listings.filter(l => l.sellerId === parseInt(req.params.id));
    res.json(userListings);
  } catch (error) {
    console.error('❌ Error fetching user listings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===========================================
// API Routes - Chat/Messages
// ===========================================

// GET CONVERSATION - messages between two users
app.get('/api/messages/:userId/:otherUserId', async (req, res) => {
  try {
    const messages = await readJSON(messagesFile);
    const userId = parseInt(req.params.userId);
    const otherUserId = parseInt(req.params.otherUserId);
    
    // Find all messages between these two users
    const conversation = messages.filter(m => 
      (m.senderId === userId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === userId)
    );
    
    res.json(conversation);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ALL CONVERSATIONS - list of people user has chatted with
app.get('/api/conversations/:userId', async (req, res) => {
  try {
    const messages = await readJSON(messagesFile);
    const users = await readJSON(usersFile);
    const userId = parseInt(req.params.userId);
    
    // Find all unique users this person has talked to
    const conversationUserIds = new Set();
    messages.forEach(m => {
      if (m.senderId === userId) conversationUserIds.add(m.receiverId);
      if (m.receiverId === userId) conversationUserIds.add(m.senderId);
    });
    
    // Get user details and last message for each conversation
    const conversations = Array.from(conversationUserIds).map(otherId => {
      const otherUser = users.find(u => u.id === otherId);
      const userMessages = messages.filter(m => 
        (m.senderId === userId && m.receiverId === otherId) ||
        (m.senderId === otherId && m.receiverId === userId)
      );
      const lastMessage = userMessages[userMessages.length - 1];
      
      return {
        userId: otherId,
        userName: otherUser?.name,
        userAvatar: otherUser?.avatar,
        lastMessage: lastMessage?.message,
        timestamp: lastMessage?.timestamp
      };
    });
    
    res.json(conversations);
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===========================================
// Socket.IO - Real-time Chat
// ===========================================

// Store online users: { userId: socketId }
const onlineUsers = {};

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);
  
  // USER JOINS - register user as online
  socket.on('user_online', (userId) => {
    onlineUsers[userId] = socket.id;
    console.log(`👤 User ${userId} is now online`);
  });
  
  // SEND MESSAGE - handle incoming message
  socket.on('send_message', async (data) => {
    try {
      const { senderId, receiverId, message } = data;
      
      // Create message object
      const newMessage = {
        id: Date.now(), // Simple unique ID
        senderId,
        receiverId,
        message,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Save message to file
      const messages = await readJSON(messagesFile);
      messages.push(newMessage);
      await writeJSON(messagesFile, messages);
      
      // Send to receiver if they're online
      const receiverSocketId = onlineUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', newMessage);
      }
      
      // Confirm to sender
      socket.emit('message_sent', newMessage);
      
      console.log(`💬 Message from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      socket.emit('message_error', { error: 'Failed to send message' });
    }
  });
  
  // USER DISCONNECTS
  socket.on('disconnect', () => {
    // Remove user from online users
    for (let userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];
        console.log(`👋 User ${userId} disconnected`);
        break;
      }
    }
  });
});

// ===========================================
// Serve HTML Pages
// ===========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// ===========================================
// Start Server
// ===========================================
initializeData().then(() => {
  server.listen(PORT, () => {
    console.log('');
    console.log('🚀 ========================================');
    console.log('🎓 Campus Connect Server Running!');
    console.log('🌐 URL: http://localhost:' + PORT);
    console.log('📝 Demo: demo@jiit.ac.in / demo123');
    console.log('💬 Chat: Socket.IO enabled!');
    console.log('🚀 ========================================');
    console.log('');
  });
});
