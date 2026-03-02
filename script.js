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

// Unity Ads Config
const gameId = '6055094';
const placementId = 'Rewarded_Android';
let adsReady = false;

if (window.UnityAds) {
    window.UnityAds.initialize(gameId, true); // Test Mode: true (চেক করার জন্য)
}

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
                document.getElementById('balance').innerText = data.balance.toFixed(2);
                document.getElementById('refer-count').innerText = data.referCount || 0;
                document.getElementById('tasks-done').innerText = data.totalTaskCount || 0;
            } else {
                set(ref(db, 'users/' + user.uid), { balance: 0, totalTaskCount: 0, referCount: 0 });
            }
        });
    } else {
        if(loader) loader.style.display = 'none';
        if(authScr) authScr.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
    }
});

// ভিডিও টাস্ক লজিক
window.startVideoTask = (num) => {
    alert("Ads are loading... please wait.");
    // Unity Ads দেখানোর লজিক এখানে কাজ করবে
    // টাস্ক সফল হলে ব্যালেন্স আপডেট
    const user = auth.currentUser;
    if(user) {
        const userRef = ref(db, 'users/' + user.uid);
        get(userRef).then(snap => {
            const currentBalance = snap.val().balance || 0;
            const currentTasks = snap.val().totalTaskCount || 0;
            update(userRef, { 
                balance: currentBalance + 10,
                totalTaskCount: currentTasks + 1
            });
            alert("Tk.10 Reward Added!");
        });
    }
};

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

// লগইন বাটন ইভেন্ট
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch {
        await createUserWithEmailAndPassword(auth, email, pass);
    }
});
