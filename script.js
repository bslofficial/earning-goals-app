// CDN লিঙ্ক ব্যবহার করা হয়েছে গিটহাব পেজের জন্য
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDuLLapNwRk2Fl5rN6F0ezZb9KsMBKhvqA",
  authDomain: "earning-goals-app.firebaseapp.com",
  databaseURL: "https://earning-goals-app-default-rtdb.firebaseio.com",
  projectId: "earning-goals-app",
  storageBucket: "earning-goals-app.firebasestorage.app",
  messagingSenderId: "999611133128",
  appId: "1:999611133128:web:f8bd2cb60ac5a07b1249fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// লোডিং সমস্যা সমাধানের জন্য অটো-লগইন
signInAnonymously(auth).then(() => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userRef = ref(db, 'users/' + user.uid);
            onValue(userRef, (snap) => {
                const data = snap.val() || { balance: 0 };
                // ব্যালেন্স আপডেট
                document.getElementById('balance').innerText = (parseFloat(data.balance) || 0).toFixed(2);
                
                // ডাটা লোড হলে স্ক্রিন সরাবে
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('main-app').style.display = 'block';
            });
        }
    });
}).catch((error) => {
    console.error("Firebase Error:", error);
    // এরর হলেও অন্তত লোডিং স্ক্রিন সরিয়ে অ্যাপটি দেখাবে
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
});
