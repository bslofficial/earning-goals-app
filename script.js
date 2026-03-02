import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, set, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// আপনার Firebase Config (আগেরটাই থাকবে)
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

// UI সেকশন হ্যান্ডেলার (লিডারবোর্ড ও ড্যাশবোর্ড সুইচ)
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

// লিডারবোর্ড ডাটা লোড (রিয়েল ইউজার ডাটা অনুযায়ী)
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
                    <b style="color:#2563eb;">Tk.${u.balance.toFixed(2)}</b>
                </div>`;
        });
    }
};

// রেফার টিম লোড
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

// ব্যালেন্স আপডেট
function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

// টাইমার লজিক
function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        for (let i = 1; i <= 4; i++) {
            const taskLimit = currentData[`task_${i}_limit`] || 0;
            const card = document.getElementById(`card-${i}`);
            const timerText = document.getElementById(`timer-${i}`);
            if (taskLimit && now < taskLimit) {
                if(card) card.classList.add('task-disabled');
                if(timerText) timerText.innerText = formatTime(taskLimit - now);
            } else {
                if(card) card.classList.remove('task-disabled');
                if(timerText) timerText.innerText = "Tk.10.00";
            }
        }
    }, 1000);
}

function formatTime(ms) {
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
}

// টাস্ক এবং অন্যান্য
window.startVideoTask = async (taskNum) => {
    const now = new Date().getTime();
    const taskLimitKey = `task_${taskNum}_limit`;
    if (currentData[taskLimitKey] && now < currentData[taskLimitKey]) return;
    window.open(adsterraLink, '_blank');
    const updates = {};
    updates['balance'] = currentData.balance + 10;
    updates['totalTaskCount'] = currentData.totalTaskCount + 1;
    updates[taskLimitKey] = now + (15 * 60 * 1000);
    await update(userRef, updates);
};

window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Refer Link Copied!");
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());
