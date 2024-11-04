// Import Firebase dependencies and initialize the app
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, signInAnonymously, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzfN_BtTw0JMgkn9D5apkrH9h4QV0jwY0",
  authDomain: "convospace-e4d4f.firebaseapp.com",
  databaseURL: "https://convospace-e4d4f-default-rtdb.firebaseio.com",
  projectId: "convospace-e4d4f",
  storageBucket: "convospace-e4d4f.firebasestorage.app",
  messagingSenderId: "239356822811",
  appId: "1:239356822811:web:33db35f2243c2161f03fbe",
  measurementId: "G-TMWZSHDBQL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// DOM Elements
const authSection = document.getElementById("auth-section");
const userInfoSection = document.getElementById("user-info");
const userName = document.getElementById("user-name");

// Anonymous Login
document.getElementById("anonymous-login").addEventListener("click", async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    showUserInfo(userCredential.user);
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
  }
});

// Email Login
document.getElementById("email-login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    showUserInfo(userCredential.user);
  } catch (error) {
    console.error("Email sign-in error:", error);
  }
});

// Email Registration
document.getElementById("register").addEventListener("click", async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    showUserInfo(userCredential.user);
  } catch (error) {
    console.error("Registration error:", error);
  }
});

// Google Login
document.getElementById("google-login").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    showUserInfo(result.user);
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
});

// Logout
document.getElementById("logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showAuthSection();
  } catch (error) {
    console.error("Logout error:", error);
  }
});

// Show user information section
function showUserInfo(user) {
  authSection.classList.add("hidden");
  userInfoSection.classList.remove("hidden");
  userName.textContent = user.displayName || user.email || "Anonymous User";
}

// Show login section
function showAuthSection() {
  authSection.classList.remove("hidden");
  userInfoSection.classList.add("hidden");
}

// Check if the user is already signed in
auth.onAuthStateChanged((user) => {
  if (user) {
    showUserInfo(user);
  } else {
    showAuthSection();
  }
});
