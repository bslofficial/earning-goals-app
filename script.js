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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                updateUI();
                document.getElementById('loading-screen').style.display = 'none';
                document.getElementById('auth-screen').style.display = 'none';
                document.getElementById('main-app').style.display = 'block';
            }
        });
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.showSection = (name) => {
    document.getElementById('dashboard-content').style.display = name === 'dashboard' ? 'block' : 'none';
    document.getElementById('list-section').style.display = name === 'list' ? 'block' : 'none';
    document.getElementById('side-menu').classList.remove('active');
};

window.claimDailyBonus = async () => {
    window.open(adsterraLink, '_blank');
    await update(userRef, { balance: (currentData.balance + 10) });
    alert("Bonus Added!");
};

window.startVideoTask = async (taskNum) => {
    window.open(adsterraLink, '_blank');
    await update(userRef, { 
        balance: currentData.balance + 10,
        totalTaskCount: (currentData.totalTaskCount || 0) + 1 
    });
    alert("Task Completed!");
};

function updateUI() {
    document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

window.copyReferLink = () => {
    const link = document.getElementById('refer-url');
    link.select();
    document.execCommand('copy');
    alert("Link Copied!");
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('password').value.trim();
    try {
        await signInWithEmailAndPassword(auth, e, p);
    } catch (err) {
        await createUserWithEmailAndPassword(auth, e, p);
    }
});
