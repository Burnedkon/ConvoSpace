<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ConvoSpace</title>
    <link rel="stylesheet" href="style.css">
    <!-- Firebase SDKs -->
    <script type="module">
        // Import Firebase modules
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
        import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInAnonymously, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
        import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
        
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
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

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
                createUserWithEmailAndPassword(auth, email, password)
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
            signInAnonymously(auth).then((userCredential) => {
                const user = userCredential.user;
                showUserInfo(user, usernameInput.value);
            }).catch((error) => {
                console.error("Error logging in anonymously:", error);
            });
        });

        // Login with Google
        loginGoogleButton.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).then((result) => {
                const user = result.user;
                showUserInfo(user, usernameInput.value);
            }).catch((error) => {
                console.error("Error logging in with Google:", error);
            });
        });

        // Logout
        logoutButton.addEventListener('click', () => {
            signOut(auth).then(() => {
                showAuthSection();
            });
        });

        // Create a community
        createCommunityButton.addEventListener('click', () => {
            const communityName = communityNameInput.value.trim();
            if (communityName) {
                set(ref(db, 'communities/' + communityName), {
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
            get(ref(db, 'communities/')).then((snapshot) => {
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
            get(ref(db, 'posts/' + communityName)).then((snapshot) => {
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
                const newPostKey = ref(db, 'posts/' + communityName).push().key;
                set(ref(db, 'posts/' + communityName + '/' + newPostKey), {
                    content: content
                }).then(() => {
                    postInput.value = '';
                    fetchPosts(communityName);
                }).catch((error) => {
                    console.error("Error posting:", error);
                });
            }
        });
    </script>
</head>
<body>
    <div id="app">
        <div id="auth-section">
            <h2>Register/Login</h2>
            <input type="text" id="username" placeholder="Enter your username" required>
            <input type="text" id="profile-pic" placeholder="Profile picture URL (optional)">
            <button id="register-button">Register</button>
            <button id="login-anonymous">Login Anonymously</button>
            <button id="login-google">Login with Google</button>
        </div>

        <div id="user-info" class="hidden">
            <h2>Welcome, <span id="user-name"></span></h2>
            <button id="logout">Logout</button>
            <input type="text" id="community-name" placeholder="Enter community name" required>
            <button id="create-community">Create Community</button>
            <div id="communities-list"></div>
            <div id="community-post-section" class="hidden">
                <h3>Community: <span id="current-community-name"></span></h3>
                <input type="text" id="post-input" placeholder="Write a post...">
                <button id="post-button">Post</button>
                <div id="posts-list"></div>
            </div>
        </div>
    </div>
</body>
</html>
