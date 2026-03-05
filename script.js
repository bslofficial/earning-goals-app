import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, update, onValue, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

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
const ADSTERRA_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

onAuthStateChanged(auth, (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            currentData = snap.val() || { balance: 0 };
            document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
            document.getElementById('auth-screen').style.display = 'none';
        });
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }
});

// বোনাস বাটন লজিক (১৪.৫৬ সেকেন্ড)
window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return alert("Wait 24h!");

    window.open(ADSTERRA_LINK, '_blank');
    const bBtn = document.getElementById('bonus-btn');
    const bTxt = document.getElementById('bonus-text');
    let timeLeft = 14.56;
    bBtn.disabled = true;

    const timer = setInterval(async () => {
        timeLeft -= 0.1;
        bTxt.innerText = timeLeft.toFixed(2) + "s";
        if (timeLeft <= 0) {
            clearInterval(timer);
            const newBal = (parseFloat(currentData.balance) || 0) + 1;
            await update(userRef, { balance: newBal, lastBonus: now + 86400000 });
            alert("Tk.1 Bonus Added!");
            bTxt.innerText = "Daily Bonus";
            bBtn.disabled = false;
        }
    }, 100);
};

window.goToIncomePage = (num) => { window.location.href = `income.html?task=${num}`; };
window.openWithdraw = () => { document.getElementById('withdrawModal').style.display = 'flex'; };
window.closeWithdraw = () => { document.getElementById('withdrawModal').style.display = 'none'; };

// Login Logic
document.getElementById('login-btn').onclick = async () => {
    const e = document.getElementById('email').value, p = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, e, p); }
    catch {
        const res = await createUserWithEmailAndPassword(auth, e, p);
        await set(ref(db, `users/${res.user.uid}`), { email: e, balance: 0 });
    }
};
