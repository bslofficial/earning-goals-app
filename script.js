import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, update, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuLLapNwRk2Fl5rN6F0ezZb9KsMBKhvqA",
    authDomain: "earning-goals-app.firebaseapp.com",
    projectId: "earning-goals-app",
    databaseURL: "https://earning-goals-app-default-rtdb.firebaseio.com",
    storageBucket: "earning-goals-app.firebasestorage.app",
    messagingSenderId: "999611133128",
    appId: "1:999611133128:web:f8bd2cb60ac5a07b1249fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let userRef, currentData = {};

onAuthStateChanged(auth, (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            currentData = snap.val() || { balance: 0 };
            document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    }
});

window.claimDailyBonus = async () => {
    window.open("https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb", "_blank");
    const bTxt = document.getElementById('bonus-text');
    let timeLeft = 14.56;
    const timer = setInterval(async () => {
        timeLeft -= 0.1;
        bTxt.innerText = timeLeft.toFixed(2) + "s";
        if (timeLeft <= 0) {
            clearInterval(timer);
            // ১ টাকা বোনাস
            await update(userRef, { balance: (currentData.balance || 0) + 1 });
            alert("Bonus Added!");
            bTxt.innerText = "Daily Bonus";
        }
    }, 100);
};

window.goToIncomePage = (num) => { window.location.href = `income.html?task=${num}`; };
