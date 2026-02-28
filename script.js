import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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
let currentData = { balance: 0, lastLimit: 0, doneToday: 0 };

// Login logic
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("Please enter details");

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (err) {
            document.getElementById('auth-error').innerText = err.message;
        }
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        userRef = ref(db, 'users/' + user.uid);
        await loadData();
    }
});

async function loadData() {
    const snap = await get(userRef);
    if (snap.exists()) {
        currentData = snap.val();
    } else {
        await set(userRef, currentData);
    }
    updateDisplay();
    checkCooldown();
}

function updateDisplay() {
    document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
}

// Task Execution
window.startVideoTask = function(id) {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        return alert("২৪ ঘণ্টার লিমিট চলছে!");
    }
    
    // ভিডিওর টাইমার শুরু
    const overlay = document.getElementById('videoOverlay');
    overlay.style.display = 'flex';
    let count = 20;
    const t = setInterval(async () => {
        count--;
        document.getElementById('seconds').innerText = count;
        if (count <= 0) {
            clearInterval(t);
            overlay.style.display = 'none';
            await completeTask(id);
        }
    }, 1000);
}

async function completeTask(id) {
    currentData.balance += 5.00; // ৫ টাকা যোগ
    currentData.doneToday = (currentData.doneToday || 0) + 1;

    // ৪টি টাস্ক শেষ হলে লিমিট
    if (currentData.doneToday >= 4) {
        currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    await update(userRef, currentData);
    updateDisplay();
    document.getElementById(`task-${id}`).style.opacity = '0.3';
    checkCooldown();
}

function checkCooldown() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        document.getElementById('limit-box').style.display = 'block';
        const timer = setInterval(() => {
            const diff = currentData.lastLimit - new Date().getTime();
            if (diff <= 0) { clearInterval(timer); location.reload(); }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
        }, 1000);
    }
}

// Withdraw & UI Helpers
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    if (amt < 500 || amt > currentData.balance) return alert("Check balance or amount!");
    
    currentData.balance -= amt;
    await update(userRef, currentData);
    updateDisplay();
    window.open(`https://wa.me/8801917044596?text=WithdrawRequest%0AEmail:${auth.currentUser.email}%0AAmount:${amt}%0ANumber:${acc}`);
    window.closeWithdraw();
};

window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastBonus') === today) return alert("Already claimed today!");
    currentData.balance += 20.00;
    await update(userRef, currentData);
    localStorage.setItem('lastBonus', today);
    updateDisplay();
    alert("৳20 Daily Bonus Added!");
};
