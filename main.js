import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-app.js';
import { getDatabase, ref, set, onValue, get } from 'https://www.gstatic.com/firebasejs/9.1.3/firebase-database.js';
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

const loggedInView = document.getElementById('logged-in-view')
const loggedOutView = document.getElementById('logged-out-view')
const usernameSignInForm = document.getElementById('signin-email-input')
const loginBtn = document.getElementById('sign-in-btn')
const logoutBtn = document.getElementById('logout-button')
const chatMessages = document.querySelector('.chat-messages')
const chatInput = document.querySelector('.chat-input')
const sendBtn = document.querySelector(".send-button")
let user = '';
let isMuted = 0;
function logout() {
  let timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  let message = {
    sender: "Server",
    text: `${user} has disconnected.`,
    timestamp,
  }
  const messageRef = ref(db,`messages/${user}`)
  set(messageRef,message)
  for (var i = 0; i<chatMessages.childElementCount; i++) { 
    chatMessages.removeChild(chatMessages.firstChild); 
  }
    loggedInView.style.display = 'none' 
      loggedOutView.style.display = 'block'
  
}


loginBtn.addEventListener('click', () => {    
            usernameSignInForm.value = ""
  })
usernameSignInForm.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    loginBtn.click();
  }
});

logoutBtn.addEventListener('click', () => {logout()})
const createChatMessageElement = (message) => {
  const newMessage = document.createElement("div");
  let timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  let time1 = timestamp.replace(/[:APM]/g, ""); 
  let time2 = message.timestamp.replace(/[:APM]/g, ""); 
  if (Math.abs(Number(time2)-Number(time1)) <2) {
newMessage.innerHTML = `<div class="message ${message.sender === user ? 'blue-bg' : message.text.includes('@'+user) == true ? 'yello-bg' : 'gray-bg'}">
  <div class="message-sender">${message.timestamp}:          ${message.sender}</div>
  <div class="message-text">${message.text}</div>
  </div>`;
chatMessages.appendChild(newMessage);
chatMessages.scrollTop = chatMessages.scrollHeight
  }
}
sendBtn.addEventListener('click', () => {
  if (chatInput.value !="/tab") {
  let timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
  let message = {
    sender: user,
    text: chatInput.value,
    timestamp,
  }
  if (message.text) {
  const messageRef = ref(db,`messages/${user}`)
  if (isMuted !=1){
  set(messageRef,message)
  const counterRef = ref(db,'messageCount')
  get(counterRef).then((DataSnapshot) => {
    set(counterRef,DataSnapshot.val()+1)
  } )
}
  createChatMessageElement(message);  
  chatInput.value = ""
  }
} else {

  const refage = ref(db, `pings`)

  get(refage).then((snapshot) =>{
    Object.keys(snapshot.val()).forEach((poop) =>{
      const refrence = ref(db, `pings/${poop}`)
      set(refrence, 'pinging')
    })
    setTimeout(function(){
      const refage = ref(db, `pings`)
      let output = [];
        get(refage).then((snapshot)=>{
         const ids = Object.keys(snapshot.val())
         const vals = Object.values(snapshot.val())
          for(var i = 0; i<ids.length; i++) {
            if(vals[i] == 'recieved') {
              output.push(ids[i])
            }
          }
          if(output.length ==1) {
            let timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
          let message = {
            sender: 'TABLIST',
            text: `Nobody is online.`,
            timestamp,
          }
          createChatMessageElement(message);  
          }
      output.forEach((snap)=>{
        const refage = ref(db, `users/${snap}`)
        get(refage).then((snapshot)=>{
          let timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
      let message = {
        sender: 'TABLIST',
        text: `${snapshot.val()} is online.`,
        timestamp,
      }
      if (snapshot.val() !=user) {
      createChatMessageElement(message);  
      }
        })
      })
        })
    }, 1000);
  })
   
  chatInput.value = ""
}

})
chatInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    sendBtn.click();
  }
});
