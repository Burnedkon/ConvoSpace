// Import Firebase dependencies
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-database.js";

// Firebase configuration
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
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const authSection = document.getElementById("auth-section");
const userInfoSection = document.getElementById("user-info");
const userName = document.getElementById("user-name");
const communityInput = document.getElementById("community-name");
const postContentInput = document.getElementById("post-content");
const postsList = document.getElementById("posts-list");
const profilePicInput = document.getElementById("profile-pic");
const usernameInput = document.getElementById("username");

// Register user with username and profile picture
document.getElementById("register").addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const profilePic = profilePicInput.value.trim();
  
  if (username) {
    try {
      const userCredential = await signInAnonymously(auth);
      const userId = userCredential.user.uid;

      // Store username and profile picture in the database
      await set(ref(db, `users/${userId}`), {
        username,
        profilePic,
      });

      showUserInfo(userCredential.user);
    } catch (error) {
      console.error("Registration error:", error);
    }
  }
});

// Sign in with Google
document.getElementById("google-login").addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    showUserInfo(result.user);
  } catch (error) {
    console.error("Google sign-in error:", error);
  }
});

// Log out
document.getElementById("logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showAuthSection();
  } catch (error) {
    console.error("Logout error:", error);
  }
});

// Community creation
document.getElementById("create-community").addEventListener("click", () => {
  const communityName = communityInput.value.trim();
  if (communityName) {
    const communityRef = ref(db, `communities/${communityName}`);
    set(communityRef, { createdBy: auth.currentUser.uid });
    document.getElementById("post-section").classList.remove("hidden");
    loadPosts(communityName); // Load posts from the newly created community
  }
});

// Post creation
document.getElementById("submit-post").addEventListener("click", () => {
  const content = postContentInput.value.trim();
  const communityName = communityInput.value.trim();
  if (content && communityName) {
    const postRef = push(ref(db, `posts/${communityName}`));
    set(postRef, {
      userId: auth.currentUser.uid,
      content,
      timestamp: Date.now()
    });
    postContentInput.value = ""; // Clear the input after posting
  }
});

// Load posts
function loadPosts(communityName) {
  const postsRef = ref(db, `posts/${communityName}`);
  onValue(postsRef, (snapshot) => {
    postsList.innerHTML = ""; // Clear the list before loading new posts
    snapshot.forEach((childSnapshot) => {
      const post = childSnapshot.val();
      const postElement = document.createElement("li");
      postElement.textContent = post.content;
      postsList.appendChild(postElement);
    });
  });
}

// Show user info
function showUserInfo(user) {
  authSection.classList.add("hidden");
  userInfoSection.classList.remove("hidden");
  userName.textContent = user.displayName || user.email || "Anonymous User";

  // Load user's profile picture
  const userRef = ref(db, `users/${user.uid}`);
  onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    if (userData && userData.profilePic) {
      const profileImg = document.createElement("img");
      profileImg.src = userData.profilePic;
      profileImg.alt = userData.username;
      profileImg.style.width = "50px";
      profileImg.style.borderRadius = "50%";
      userInfoSection.prepend(profileImg);
    }
  });
}

// Show authentication section
function showAuthSection() {
  authSection.classList.remove("hidden");
  userInfoSection.classList.add("hidden");
}
