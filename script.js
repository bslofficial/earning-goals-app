import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

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

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');

// সেকশন পরিবর্তন করার ফাংশন
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

// লিডারবোর্ড লোড করা
window.loadLeaderboard = async () => {
    document.getElementById('list-title').innerText = "Leaderboard";
    const dataWrapper = document.getElementById('data-list');
    dataWrapper.innerHTML = "<p style='text-align:center; padding:20px;'>Loading...</p>";
    showSection('list');

    const snapshot = await get(ref(db, 'users'));
    if(snapshot.exists()){
        let users = [];
        snapshot.forEach(child => {
            users.push({ name: child.key.substring(0,6), balance: child.val().balance || 0 });
        });
        users.sort((a,b) => b.balance - a.balance);
        dataWrapper.innerHTML = "";
        users.forEach((u, i) => {
            dataWrapper.innerHTML += `<div class="data-row">
                <div style="display:flex; align-items:center;"><div class="rank-badge">${i+1}</div>User_${u.name}</div>
                <b style="color:#3b82f6;">Tk.${u.balance.toFixed(2)}</b>
            </div>`;
        });
    }
};

// রেফার টিম লোড করা
window.loadReferTeam = async () => {
    document.getElementById('list-title').innerText = "Refer Team";
    const dataWrapper = document.getElementById('data-list');
    dataWrapper.innerHTML = "<p style='text-align:center; padding:20px;'>Loading...</p>";
    showSection('list');

    const snapshot = await get(ref(db, 'users'));
    if(snapshot.exists()){
        let team = [];
        snapshot.forEach(child => {
            team.push({ name: child.key.substring(0,6), count: child.val().referCount || 0 });
        });
        team.sort((a,b) => b.count - a.count);
        dataWrapper.innerHTML = "";
        team.forEach((t, i) => {
            dataWrapper.innerHTML += `<div class="data-row">
                <div style="display:flex; align-items:center;"><div class="rank-badge" style="background:#10b981;">${i+1}</div>User_${t.name}</div>
                <b style="color:#10b981;">${t.count} Refers</b>
            </div>`;
        });
    }
};

// বাকি ফাংশনগুলো (আগের মতো)
window.handleLogout = () => signOut(auth).then(() => location.reload());
// ... (আপনার আগের টাস্ক এবং বোনাস লজিক এখানে থাকবে)
