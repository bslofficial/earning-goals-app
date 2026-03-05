import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuLLapNwRk2Fl5rN6F0ezZb9KsMBKhvqA",
    authDomain: "earning-goals-app.firebaseapp.com",
    projectId: "earning-goals-app",
    databaseURL: "https://earning-goals-app-default-rtdb.firebaseio.com",
    appId: "1:999611133128:web:f8bd2cb60ac5a07b1249fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// অটোমেটিক লগইন করার চেষ্টা (যাতে লোডিং এ আটকে না থাকে)
signInAnonymously(auth).catch(err => console.error("Auth Error:", err));

onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loading-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            const data = snap.val() || { balance: 0 };
            document.getElementById('balance').innerText = (parseFloat(data.balance) || 0).toFixed(2);
            
            // ডাটা লোড হলে স্ক্রিন দেখাবে
            if(loader) loader.style.display = 'none';
            if(mainApp) mainApp.style.display = 'block';
        }, (error) => {
            console.error("Database Error:", error);
            if(loader) loader.style.display = 'none'; // এরর হলেও লোডার সরাবে
        });
    } else {
        // ইউজার না থাকলেও অন্তত লোডার সরিয়ে অ্যাপ দেখাবে
        if(loader) loader.style.display = 'none';
        if(mainApp) mainApp.style.display = 'block';
    }
});

// বাকি ফাংশনগুলো আগের মতোই থাকবে...
window.goToIncomePage = (num) => { window.location.href = `income.html?task=${num}`; };
