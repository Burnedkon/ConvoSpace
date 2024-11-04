// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzfN_BtTw0JMgkn9D5apkrH9h4QV0jwY0",
    authDomain: "convospace-e4d4f.firebaseapp.com",
    databaseURL: "https://convospace-e4d4f-default-rtdb.firebaseio.com",
    projectId: "convospace-e4d4f",
    storageBucket: "convospace-e4d4f.appspot.com",
    messagingSenderId: "239356822811",
    appId: "1:239356822811:web:33db35f2243c2161f03fbe",
    measurementId: "G-TMWZSHDBQL"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// UI Elements
const authSection = document.getElementById('auth-section');
const userInfoSection = document.getElementById('user-info');
const usernameInput = document.getElementById('username');
const profilePicInput = document.getElementById('profile-pic');
const registerButton = document.getElementById('register-button');
const loginAnonymousButton = document.getElementById('login-anonymous');
const loginGoogleButton = document.getElementById('login-google');
const logoutButton = document.getElementById('logout');
const communityNameInput = document.getElementById('community-name');
const createCommunityButton = document.getElementById('create-community');
const communitiesList = document.getElementById('communities-list');
const currentCommunityName = document.getElementById('current-community-name');
const postInput = document.getElementById('post-input');
const postButton = document.getElementById('post-button');
const postsList = document.getElementById('posts-list');
const communityPostSection = document.getElementById('community-post-section');
const userNameSpan = document.getElementById('user-name');

// Authentication listeners
auth.onAuthStateChanged((user) => {
    if (user) {
        const username = usernameInput.value || "Anonymous User";
        showUserInfo(user, username);
    } else {
        showAuthSection();
    }
});

// Show user info
function showUserInfo(user, username) {
    authSection.classList.add("hidden");
    userInfoSection.classList.remove("hidden");
    userNameSpan.textContent = username;

    // Fetch communities
    fetchCommunities();
}

// Show authentication section
function showAuthSection() {
    authSection.classList.remove("hidden");
    userInfoSection.classList.add("hidden");
}

// Register a new user with email and password
registerButton.addEventListener('click', () => {
    const email = prompt("Enter your email:");
    const password = prompt("Enter your password:");
    if (email && password) {
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                showUserInfo(user, usernameInput.value);
            })
            .catch((error) => {
                console.error("Error registering user:", error);
            });
    }
});

// Login anonymously
loginAnonymousButton.addEventListener('click', () => {
    auth.signInAnonymously().then((userCredential) => {
        const user = userCredential.user;
        showUserInfo(user, usernameInput.value);
    }).catch((error) => {
        console.error("Error logging in anonymously:", error);
    });
});

// Login with Google
loginGoogleButton.addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then((result) => {
        const user = result.user;
        showUserInfo(user, usernameInput.value);
    }).catch((error) => {
        console.error("Error logging in with Google:", error);
    });
});

// Logout
logoutButton.addEventListener('click', () => {
    auth.signOut().then(() => {
        showAuthSection();
    });
});

// Create a community
createCommunityButton.addEventListener('click', () => {
    const communityName = communityNameInput.value.trim();
    if (communityName) {
        db.ref('communities/' + communityName).set({
            name: communityName
        }).then(() => {
            communityNameInput.value = '';
            fetchCommunities();
        }).catch((error) => {
            console.error("Error creating community:", error);
        });
    }
});

// Fetch communities
function fetchCommunities() {
    db.ref('communities/').once('value').then((snapshot) => {
        communitiesList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const community = childSnapshot.val();
            const communityDiv = document.createElement('div');
            communityDiv.textContent = community.name;
            communityDiv.className = "community";
            communityDiv.addEventListener('click', () => {
                joinCommunity(community.name);
            });
            communitiesList.appendChild(communityDiv);
        });
    });
}

// Join a community
function joinCommunity(name) {
    currentCommunityName.textContent = name;
    communityPostSection.classList.remove("hidden");
    fetchPosts(name);
}

// Fetch posts from a community
function fetchPosts(communityName) {
    db.ref('posts/' + communityName).once('value').then((snapshot) => {
        postsList.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postDiv = document.createElement('div');
            postDiv.textContent = post.content;
            postsList.appendChild(postDiv);
        });
    });
}

// Post content to a community
postButton.addEventListener('click', () => {
    const content = postInput.value.trim();
    const communityName = currentCommunityName.textContent;
    if (content && communityName) {
        const newPostKey = db.ref('posts/' + communityName).push().key;
        db.ref('posts/' + communityName + '/' + newPostKey).set({
            content: content
        }).then(() => {
            postInput.value = '';
            fetchPosts(communityName);
        }).catch((error) => {
            console.error("Error posting:", error);
        });
    }
});
