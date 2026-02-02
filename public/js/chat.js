// ===========================================
// Campus Connect - Chat Interface
// ===========================================
// This handles real-time messaging between users
// using Socket.IO for instant communication!

const API_URL = 'http://localhost:3000/api';

// Check if user is logged in
const currentUser = JSON.parse(localStorage.getItem('user'));
if (!currentUser) {
  window.location.href = '/login.html';
}

// ===========================================
// Socket.IO Setup
// ===========================================
const socket = io('http://localhost:3000');

// Variables to track current chat
let activeConversationUserId = null;
let conversations = [];

// ===========================================
// Connect to Socket.IO
// ===========================================
socket.on('connect', () => {
  console.log('✅ Connected to chat server!');
  // Tell server we're online
  socket.emit('user_online', currentUser.id);
});

// ===========================================
// Load User's Conversations
// ===========================================
// Fetch all conversations this user has had
function loadConversations() {
  fetch(`${API_URL}/conversations/${currentUser.id}`)
    .then(response => response.json())
    .then(data => {
      conversations = data;
      renderConversations();
    })
    .catch(error => {
      console.error('❌ Error loading conversations:', error);
    });
}

// ===========================================
// Display Conversations List
// ===========================================
function renderConversations() {
  const container = document.getElementById('conversationsList');
  
  if (conversations.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px; color: var(--text-gray);">
        <svg viewBox="0 0 24 24" style="width: 48px; height: 48px; stroke: var(--text-gray); margin: 0 auto 16px;">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>No conversations yet</p>
        <p style="font-size: 0.85rem; margin-top: 8px;">Start chatting by clicking "Contact Seller" on any listing!</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = conversations.map(conv => `
    <div class="conversation-item ${activeConversationUserId === conv.userId ? 'active' : ''}" 
         onclick="openChat(${conv.userId}, '${conv.userName}', '${conv.userAvatar}')">
      <div class="seller-avatar">${conv.userAvatar}</div>
      <div class="conversation-info">
        <div class="conversation-name">${conv.userName}</div>
        <div class="conversation-preview">${conv.lastMessage || 'Start a conversation'}</div>
      </div>
      <div class="conversation-time">${conv.timestamp ? formatTime(conv.timestamp) : ''}</div>
    </div>
  `).join('');
}

// ===========================================
// Open Chat with a User
// ===========================================
function openChat(userId, userName, userAvatar) {
  activeConversationUserId = userId;
  
  // Update UI to show active chat
  document.getElementById('noChatSelected').style.display = 'none';
  document.getElementById('activeChat').style.display = 'flex';
  
  // Update chat header
  document.getElementById('chatAvatar').textContent = userAvatar;
  document.getElementById('chatUserName').textContent = userName;
  
  // Highlight active conversation in sidebar
  renderConversations();
  
  // Load messages for this conversation
  loadMessages(userId);
}

// ===========================================
// Load Messages for Active Chat
// ===========================================
function loadMessages(otherUserId) {
  fetch(`${API_URL}/messages/${currentUser.id}/${otherUserId}`)
    .then(response => response.json())
    .then(messages => {
      renderMessages(messages);
    })
    .catch(error => {
      console.error('❌ Error loading messages:', error);
    });
}

// ===========================================
// Display Messages in Chat Window
// ===========================================
function renderMessages(messages) {
  const messagesArea = document.getElementById('messagesArea');
  
  if (messages.length === 0) {
    messagesArea.innerHTML = `
      <div style="text-align: center; color: var(--text-gray); padding: 40px;">
        <p>No messages yet. Say hi! 👋</p>
      </div>
    `;
    return;
  }
  
  messagesArea.innerHTML = messages.map(msg => {
    const isSent = msg.senderId === currentUser.id;
    return `
      <div class="message ${isSent ? 'sent' : 'received'}">
        <div class="seller-avatar">${isSent ? currentUser.avatar : document.getElementById('chatAvatar').textContent}</div>
        <div class="message-content">
          <div class="message-bubble">${escapeHtml(msg.message)}</div>
          <div class="message-time">${formatTime(msg.timestamp)}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom to show latest messages
  scrollToBottom();
}

// ===========================================
// Send Message
// ===========================================
document.getElementById('messageForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const messageInput = document.getElementById('messageInput');
  const message = messageInput.value.trim();
  
  if (!message || !activeConversationUserId) return;
  
  // Send message through Socket.IO
  socket.emit('send_message', {
    senderId: currentUser.id,
    receiverId: activeConversationUserId,
    message: message
  });
  
  // Clear input
  messageInput.value = '';
});

// ===========================================
// Socket.IO Event Listeners
// ===========================================

// When message is successfully sent
socket.on('message_sent', (message) => {
  console.log('✅ Message sent successfully');
  // Add message to UI
  addMessageToUI(message, true);
});

// When we receive a new message
socket.on('receive_message', (message) => {
  console.log('📨 New message received!');
  
  // If we're currently chatting with this person, show the message
  if (message.senderId === activeConversationUserId) {
    addMessageToUI(message, false);
  }
  
  // Update conversations list
  loadConversations();
});

// If there's an error sending message
socket.on('message_error', (error) => {
  console.error('❌ Error sending message:', error);
  alert('Failed to send message. Please try again.');
});

// ===========================================
// Helper Functions
// ===========================================

// Add a message to the UI in real-time
function addMessageToUI(message, isSent) {
  const messagesArea = document.getElementById('messagesArea');
  
  // Remove "no messages" text if it exists
  const noMessages = messagesArea.querySelector('div[style*="text-align: center"]');
  if (noMessages) {
    noMessages.remove();
  }
  
  const messageHTML = `
    <div class="message ${isSent ? 'sent' : 'received'}">
      <div class="seller-avatar">${isSent ? currentUser.avatar : document.getElementById('chatAvatar').textContent}</div>
      <div class="message-content">
        <div class="message-bubble">${escapeHtml(message.message)}</div>
        <div class="message-time">${formatTime(message.timestamp)}</div>
      </div>
    </div>
  `;
  
  messagesArea.insertAdjacentHTML('beforeend', messageHTML);
  scrollToBottom();
}

// Scroll chat to bottom (shows latest messages)
function scrollToBottom() {
  const messagesArea = document.getElementById('messagesArea');
  messagesArea.scrollTop = messagesArea.scrollHeight;
}

// Format timestamp to readable time
function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Escape HTML to prevent XSS attacks
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Handle profile button
document.getElementById('profileBtn').addEventListener('click', () => {
  window.location.href = `/profile.html?id=${currentUser.id}`;
});

// ===========================================
// Check for userId in URL
// ===========================================
// If someone clicked "Contact Seller", open that chat
const urlParams = new URLSearchParams(window.location.search);
const chatWithUserId = urlParams.get('userId');

if (chatWithUserId) {
  // Fetch user info and open chat
  fetch(`${API_URL}/users/${chatWithUserId}`)
    .then(response => response.json())
    .then(user => {
      openChat(user.id, user.name, user.avatar);
    })
    .catch(error => {
      console.error('❌ Error loading user:', error);
    });
}

// ===========================================
// Initialize
// ===========================================
loadConversations();
