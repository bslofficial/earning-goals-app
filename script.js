import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, set, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuLLapNwRk2Fl5rN6F0ezZb9KsMBKhvqA",
    authDomain: "earning-goals-app.firebaseapp.com",
    projectId: "earning-goals-app",
    storageBucket: "earning-goals-app.firebasestorage.app",
    messagingSenderId: "999611133128",
    appId: "1:999611133128:web:f8bd2cb60ac5a07b1249fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const adsterraLink = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

let userRef;
let currentData = { balance: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

// লোডিং ফিক্স: Firebase কানেকশন চেক
onAuthStateChanged(auth, async (user) => {
    const loader = document.getElementById('loading-screen');
    const authScr = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    try {
        if (user) {
            userRef = ref(db, 'users/' + user.uid);
            onValue(userRef, (snap) => {
                if (snap.exists()) {
                    currentData = snap.val();
                    updateUI();
                    loader.style.display = 'none';
                    authScr.style.display = 'none';
                    mainApp.style.display = 'block';
                }
            });
            document.getElementById('display-name').innerText = user.email.split('@')[0];
            document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        } else {
            loader.style.display = 'none';
            authScr.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    } catch (e) {
        console.error("Firebase Error:", e);
        alert("Check Internet connection!");
    }
});

// বাটন ফাংশনগুলো
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.showSection = (name) => {
    document.getElementById('dashboard-content').style.display = name === 'dashboard' ? 'block' : 'none';
    document.getElementById('list-section').style.display = name === 'list' ? 'block' : 'none';
    document.getElementById('side-menu').classList.remove('active');
};

// ডাটা আপডেট ফাংশন
function updateUI() {
    document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

// লগইন লজিক
document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!e || !p) return alert("Email & Password required!");
    
    try {
        await signInWithEmailAndPassword(auth, e, p);
    } catch (err) {
        if (err.code === 'auth/invalid-credential') {
            try { await createUserWithEmailAndPassword(auth, e, p); } catch(sE) { alert(sE.message); }
        } else { alert(err.message); }
    }
});
