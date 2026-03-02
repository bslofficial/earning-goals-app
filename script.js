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

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

// Auth State - পেজ লোড হ্যান্ডলার
onAuthStateChanged(auth, async (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                updateUI();
            } else {
                set(userRef, currentData); // নতুন ইউজার সেটআপ
            }
        });

        document.getElementById('sidebar-user-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(authScreen) authScreen.style.display = 'none';
        if(mainApp) mainApp.style.display = 'block';
        startTimers();
    } else {
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(authScreen) authScreen.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
    }
});

function updateUI() {
    const balanceEl = document.getElementById('balance');
    if(balanceEl) balanceEl.innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

// লগইন লজিক
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    if(loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('password').value.trim();
            if(!email || !pass) return alert("Fill all fields");

            try {
                await signInWithEmailAndPassword(auth, email, pass);
            } catch {
                try {
                    await createUserWithEmailAndPassword(auth, email, pass);
                } catch (err) {
                    alert("Error: " + err.message);
                }
            }
        });
    }
});

// উইন্ডো ফাংশনসমূহ
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.copyReferLink = () => {
    const url = document.getElementById('refer-url');
    url.select();
    navigator.clipboard.writeText(url.value);
    alert("Refer Link Copied!");
};
window.handleLogout = () => signOut(auth).then(() => location.reload());

window.showSection = (name) => {
    const dash = document.getElementById('dashboard-section');
    const other = document.getElementById('other-section');
    const details = document.getElementById('section-details');

    if(name === 'dashboard') {
        dash.style.display = 'block';
        other.style.display = 'none';
    } else {
        dash.style.display = 'none';
        other.style.display = 'block';
        details.innerHTML = `<h3>${name.toUpperCase()}</h3><p>Data will appear here soon.</p>`;
    }
    window.toggleMenu();
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
