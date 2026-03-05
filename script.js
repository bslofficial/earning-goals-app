import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

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

signInAnonymously(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            const data = snap.val() || { balance: 0 };
            document.getElementById('balance').innerText = (parseFloat(data.balance) || 0).toFixed(2);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    }
});

window.goToIncomePage = (num) => { window.location.href = `income.html?task=${num}`; };

window.claimDailyBonus = () => {
    window.open("https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb", "_blank");
    // বোনাস টাইমার লজিক এখানে থাকবে...
};
