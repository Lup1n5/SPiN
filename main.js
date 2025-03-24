import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js';
import { getDatabase, ref, set, onValue, get, off } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyD68PbyrHLGNYf9Kg_Xb_XKiKegz-Kov7k",
  authDomain: "spin-a3d5a.firebaseapp.com",
  projectId: "spin-a3d5a",
  storageBucket: "spin-a3d5a.firebasestorage.app",
  messagingSenderId: "423644329992",
  appId: "1:423644329992:web:9c14f1c959b8db636639bd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const usernameDisplay = document.getElementById('user-name');
const loggedInView = document.getElementById('logged-in-view');
const loggedOutView = document.getElementById('logged-out-view');
const usernameSignInForm = document.getElementById('signin-email-input');
const loginBtn = document.getElementById('sign-in-btn');
const logoutBtn = document.getElementById('logout-button');
const chatMessages = document.querySelector('.chat-messages');
const chatInput = document.querySelector('.chat-input');
const sendBtn = document.querySelector(".send-button");

let user = '';
const userCountRef = ref(db, 'userCount');
const allmessages = ref(db, "messages");

function logout() {
  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });

  const message = {
    sender: "Server",
    text: `${user} has disconnected.`,
    timestamp,
    id: generateMessageId()
  };

  const messageRef = ref(db, `messages/${user}`);
  set(messageRef, message);

  while (chatMessages.firstChild) {
    chatMessages.removeChild(chatMessages.firstChild);
  }

  setTimeout(() => {
    set(ref(db, `messages/${user}`), null);
    set(ref(db, `pings/${user}`), null);
    set(ref(db, `users/${user}`), null);
  }, 100);

  loggedInView.style.display = 'none';
  loggedOutView.style.display = 'block';
  location.reload(true);
}

function checkAdmPings() {
  const adminPingsRef = ref(db, `admpings/${user}`);
  get(adminPingsRef).then((snapshot) => {
    switch (snapshot.val()) {
      case 'mute':
      case 'muted':
        set(adminPingsRef, 'muted');
        return true;
      case 'unmute':
        set(adminPingsRef, 'unmuted');
        return false;
      case 'kick':
        set(adminPingsRef, 'received');
        logout();
        break;
      case 'ban':
      case 'banned':
        set(adminPingsRef, 'banned');
        logout();
        break;
      default:
        return false;
    }
  });
}

function login(username) {
  user = username;
  usernameDisplay.innerText = user;

  const timestamp = new Date().toLocaleString('en-US', {
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', hour12: true
  });

  const message = {
    sender: "Server",
    text: `${user} has connected.`,
    timestamp,
    id: generateMessageId()
  };

  set(ref(db, `messages/${user}`), message);
  createChatMessageElement(message);

  set(ref(db, `pings/${user}`), 'idle');
  onValue(ref(db, `pings/${user}`), (snapshot) => {
    if (snapshot.val() === 'pinging') {
      set(ref(db, `pings/${user}`), 'received');
    }
  });

  onValue(ref(db, `admpings/${user}`), checkAdmPings);

  set(ref(db, `users/${user}`), user);
  get(userCountRef).then((snapshot) => {
    set(userCountRef, snapshot.val() + 1);
  });

  loggedOutView.style.display = 'none';
  loggedInView.style.display = 'block';
}

loginBtn.addEventListener('click', () => {
  login(usernameSignInForm.value.replaceAll('"', ''));
  usernameSignInForm.value = "";
});

usernameSignInForm.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loginBtn.click();
  }
});

logoutBtn.addEventListener('click', logout);

const generateMessageId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createChatMessageElement = (message) => {
  if (document.querySelector(`[data-message-id="${message.id}"]`)) return;

  const newMessage = document.createElement("div");
  newMessage.setAttribute("data-message-id", message.id);
  newMessage.innerHTML = `
    <div class="message ${message.sender === user ? 'blue-bg' : message.text.includes('@' + user) ? 'yellow-bg' : 'gray-bg'}">
      <div class="message-sender">${message.timestamp}: ${message.sender}</div>
      <div class="message-text">${message.text}</div>
    </div>`;
  chatMessages.appendChild(newMessage);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

sendBtn.addEventListener('click', () => {
  if (chatInput.value !== "/tab") {
    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', hour12: true
    });

    const message = {
      sender: user,
      text: chatInput.value,
      timestamp,
      id: generateMessageId()
    };

    if (message.text) {
      set(ref(db, `messages/${user}`), message);
      createChatMessageElement(message);
      chatInput.value = "";
    }
  }
});

chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendBtn.click();
  }
});
