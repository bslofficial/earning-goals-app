import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

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

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0 };

onAuthStateChanged(auth, async (user) => {
    document.getElementById('loading-screen').style.display = 'none'; // লোডিং হাইড করা
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        
        userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        if (snap.exists()) {
            currentData = snap.val();
        } else {
            await set(userRef, currentData);
        }
        updateUI();
        startTimers();
    } else {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
}

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        // ২৪ ঘণ্টা টাইমার ফিক্স
        if (currentData.lastLimit && now < currentData.lastLimit) {
            document.getElementById('limit-box').style.display = 'block';
            document.getElementById('timer-display').innerText = formatTime(currentData.lastLimit - now);
        } else {
            document.getElementById('limit-box').style.display = 'none';
        }
        
        if (currentData.lastBonus && now < currentData.lastBonus) {
            document.getElementById('bonus-btn').disabled = true;
            document.getElementById('bonus-text').innerText = formatTime(currentData.lastBonus - now);
        } else {
            document.getElementById('bonus-btn').disabled = false;
            document.getElementById('bonus-text').innerText = "Daily Bonus";
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
}

// উইথড্র বাটন ফিক্স
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.sendWithdrawRequest = async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const account = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (amount < 500) return alert("Minimum ৳৫০০ needed!");
    if (!account) return alert("Enter account number!");
    if (currentData.balance < amount) return alert("Not enough balance!");

    currentData.balance -= amount;
    await update(userRef, currentData);
    updateUI();
    alert("Withdrawal request sent!");
    window.closeWithdraw();
};

window.startVideoTask = async () => {
    if (currentData.lastLimit && new Date().getTime() < currentData.lastLimit) return;
    window.open("https://www.google.com", '_blank');
    
    setTimeout(async () => {
        currentData.balance += 10;
        currentData.doneToday = (currentData.doneToday || 0) + 1;
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); // ২৪ ঘণ্টা বিরতি
            currentData.doneToday = 0;
        }
        await update(userRef, currentData);
        updateUI();
        location.reload();
    }, 5000);
};

window.handleLogout = () => signOut(auth).then(() => location.reload());

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { try { await createUserWithEmailAndPassword(auth, e, p); } catch (err) { alert(err.message); } }
});
