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

// Adsterra Direct Link
const ADSTERRA_DIRECT_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

window.toggleMenu = () => { document.getElementById('side-menu').classList.toggle('active'); };

let userRef;
let currentData = {};

function updateAllTimers() {
    const now = new Date().getTime();
    
    // Daily Bonus Timer
    const bBtn = document.getElementById('bonus-btn');
    const bTxt = document.getElementById('bonus-text');
    if (currentData.lastBonus && now < currentData.lastBonus) {
        bBtn.disabled = true;
        const diff = currentData.lastBonus - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        bTxt.innerText = `${h}:${m}:${s}`;
    } else {
        bBtn.disabled = false;
        bTxt.innerText = "Daily Bonus";
    }

    // Task Timers
    for (let i = 1; i <= 4; i++) {
        const nextTime = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`card-${i}`);
        const text = document.getElementById(`timer-${i}`);
        if (now < nextTime) {
            card.classList.add('task-disabled');
            const diff = nextTime - now;
            text.innerText = `${Math.floor(diff/60000)}m ${Math.floor((diff%60000)/1000)}s`;
        } else {
            card.classList.remove('task-disabled');
            text.innerText = "Tk.05.00";
        }
    }
}
setInterval(updateAllTimers, 1000);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            currentData = snap.val() || {};
            document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
            document.getElementById('display-name').innerText = user.email.split('@')[0];
            
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }
});

// Daily Bonus Button Logic
window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    
    window.open(ADSTERRA_DIRECT_LINK, '_blank');
    
    await update(userRef, {
        balance: (parseFloat(currentData.balance) || 0) + 1,
        lastBonus: now + (24 * 60 * 60 * 1000)
    });
    alert("Daily Bonus Claimed!");
};

// Task Button Logic: Redirect to income.html
window.startVideoTask = async (num) => {
    const now = new Date().getTime();
    if (currentData[`task_${num}_limit`] && now < currentData[`task_${num}_limit`]) return;
    
    window.location.href = `income.html?task=${num}`;
};

window.handleLogout = () => signOut(auth).then(() => location.reload());
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value, p = document.getElementById('password').value;
    if(!e || !p) return alert("Fill all fields");
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { 
        try { 
            const res = await createUserWithEmailAndPassword(auth, e, p);
            await set(ref(db, `users/${res.user.uid}`), { email: e, balance: 0, totalTaskCount: 0 });
        } catch (err) { alert(err.message); }
    }
});
