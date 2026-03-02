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

onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loading-screen');
    const authScr = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        if(loader) loader.style.display = 'none';
        if(authScr) authScr.style.display = 'none';
        if(mainApp) mainApp.style.display = 'block';
        
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                if(document.getElementById('balance')) document.getElementById('balance').innerText = data.balance.toFixed(2);
                if(document.getElementById('refer-count')) document.getElementById('refer-count').innerText = data.referCount || 0;
                if(document.getElementById('tasks-done')) document.getElementById('tasks-done').innerText = data.totalTaskCount || 0;
                if(document.getElementById('refer-url')) document.getElementById('refer-url').value = `${window.location.origin}/refer.html?ref=${user.uid}`;
            }
        });
    } else {
        if(loader) loader.style.display = 'none';
        if(authScr) authScr.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
    }
});

// কমন ফাংশনসমূহ
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.handleLogout = () => signOut(auth).then(() => location.href = 'index.html');
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.copyReferLink = () => {
    const el = document.getElementById('refer-url');
    el.select();
    navigator.clipboard.writeText(el.value);
    alert("Copied!");
};

// লগইন লজিক
const logBtn = document.getElementById('login-btn');
if(logBtn) {
    logBtn.addEventListener('click', async () => {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('password').value;
        try {
            await signInWithEmailAndPassword(auth, email, pass);
        } catch {
            await createUserWithEmailAndPassword(auth, email, pass);
        }
    });
}
