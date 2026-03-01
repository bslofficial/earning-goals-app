import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

// !!! এখানে আপনার Firebase কনফিগারেশন বসান !!!
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const adLink = "https://www.effectivegatecpm.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

// ১. অ্যাড টাস্ক ফাংশন
window.startAdTask = function(taskId) {
    window.open(adLink, '_blank');
    
    // ব্যালেন্স আপডেট (Firebase এ সেভ হবে)
    const user = auth.currentUser;
    if (user) {
        const balanceRef = ref(db, 'users/' + user.uid);
        get(balanceRef).then((snapshot) => {
            let currentBalance = snapshot.val().balance || 0;
            update(balanceRef, { balance: currentBalance + 10 });
            document.getElementById('balance').innerText = (currentBalance + 10).toFixed(2);
            alert("Task Complete! Tk.10 Added.");
        });
    }
};

// ২. অটো লগইন এবং ডাটা লোড
onAuthStateChanged(auth, (user) => {
    document.getElementById('loading-screen').style.display = 'none';
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        loadUserData(user.uid);
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

function loadUserData(uid) {
    get(ref(db, 'users/' + uid)).then((snapshot) => {
        if (snapshot.exists()) {
            document.getElementById('balance').innerText = snapshot.val().balance.toFixed(2);
            document.getElementById('display-name').innerText = snapshot.val().name || "User";
        }
    });
}

// সাইডবার টগল
window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};
