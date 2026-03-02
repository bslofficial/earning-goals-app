// আপনার আগের Firebase কনফিগ এবং ইম্পোর্ট একই থাকবে
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

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');

// পেজ দেখানোর নতুন ফাংশন
window.showSection = (section) => {
    const dashboard = document.getElementById('dashboard-section');
    const other = document.getElementById('other-section');
    const title = document.getElementById('section-title');
    const details = document.getElementById('section-details');

    if (section === 'dashboard') {
        dashboard.style.display = 'block';
        other.style.display = 'none';
    } else {
        dashboard.style.display = 'none';
        other.style.display = 'block';
        title.innerText = section.charAt(0).toUpperCase() + section.slice(1);
        
        // ডামি কন্টেন্ট (আপনি এখানে আসল ডাটা বসাতে পারবেন)
        if(section === 'leaderboard') details.innerHTML = "<p>Top users will be listed here...</p>";
        if(section === 'refer-team') details.innerHTML = "<p>Your refer team members will appear here...</p>";
        if(section === 'history') details.innerHTML = "<p>Your payment history is empty.</p>";
    }
    window.toggleMenu(); // সাইডবার বন্ধ করা
};

// আপনার বাকি লজিক (Auth, Balance, Timers) অপরিবর্তিত থাকবে...
let userRef;
let currentData = { balance: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
                document.getElementById('refer-count').innerText = currentData.referCount || 0;
                document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
            }
        });
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

// অন্যান্য উইন্ডো ফাংশন একই থাকবে (claimDailyBonus, startVideoTask, etc.)
window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Refer Link Copied!");
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());
