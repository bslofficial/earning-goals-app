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
                setupNewUser(user.uid);
            }
        });
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        startTimers();
        loadingScreen.style.display = 'none';
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
    } else {
        loadingScreen.style.display = 'none';
        authScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
});

// UI সেকশন পরিবর্তন
window.showSection = (name) => {
    const dash = document.getElementById('dashboard-content');
    const listSec = document.getElementById('list-section');
    if(name === 'dashboard') {
        dash.style.display = 'block';
        listSec.style.display = 'none';
    } else {
        dash.style.display = 'none';
        listSec.style.display = 'block';
    }
    document.getElementById('side-menu').classList.remove('active');
};

// লিডারবোর্ড লোড করা (সব ইউজার দেখাবে)
window.loadLeaderboard = async () => {
    document.getElementById('list-title').innerText = "Leaderboard";
    const dataWrapper = document.getElementById('data-list');
    dataWrapper.innerHTML = "<p style='text-align:center; padding:20px;'>Loading Rankings...</p>";
    showSection('list');

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if(snapshot.exists()){
        let users = [];
        snapshot.forEach(child => {
            users.push({ name: child.key.substring(0,6), balance: child.val().balance || 0 });
        });
        users.sort((a,b) => b.balance - a.balance);
        dataWrapper.innerHTML = "";
        users.forEach((u, i) => {
            dataWrapper.innerHTML += `
                <div class="data-row">
                    <div style="display:flex; align-items:center;"><div class="rank-badge">${i+1}</div>User_${u.name}</div>
                    <b style="color:#ff4d6d;">Tk.${u.balance.toFixed(2)}</b>
                </div>`;
        });
    }
};

// রেফার টিম লোড করা
window.loadReferTeam = async () => {
    document.getElementById('list-title').innerText = "Refer Team";
    const dataWrapper = document.getElementById('data-list');
    dataWrapper.innerHTML = "<p style='text-align:center; padding:20px;'>Loading Team...</p>";
    showSection('list');

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if(snapshot.exists()){
        let team = [];
        snapshot.forEach(child => {
            team.push({ name: child.key.substring(0,6), count: child.val().referCount || 0 });
        });
        team.sort((a,b) => b.count - a.count);
        dataWrapper.innerHTML = "";
        team.forEach((t, i) => {
            dataWrapper.innerHTML += `
                <div class="data-row">
                    <div style="display:flex; align-items:center;"><div class="rank-badge" style="background:#10b981;">${i+1}</div>User_${t.name}</div>
                    <b style="color:#10b981;">${t.count} Refers</b>
                </div>`;
        });
    }
};

// বাকি সব ফাংশন (টাস্ক, বোনাস, লগইন) আগের মতোই থাকবে...
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.claimDailyBonus = async () => { /* আগের কোড */ };
window.startVideoTask = async (n) => { /* আগের কোড */ };
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Copied!");
};
// ... (আপনার আগের script.js এর বাকি অংশ এখানে যুক্ত করুন)
