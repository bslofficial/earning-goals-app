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

// Unity Ads Config
const gameId = '6055094';
const placementId = 'Rewarded_Android';
const testMode = true; // Set to false for real ads

if (window.unityAds) {
    window.unityAds.initialize(gameId, testMode);
}

// Sidebar Function
window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

onAuthStateChanged(auth, async (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        
        if (snap.exists()) {
            currentData = snap.val();
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            const referrerId = urlParams.get('ref');
            if (referrerId) {
                const refUserRef = ref(db, 'users/' + referrerId);
                const refSnap = await get(refUserRef);
                if (refSnap.exists()) {
                    const rData = refSnap.val();
                    await update(refUserRef, {
                        balance: (parseFloat(rData.balance) || 0) + 30,
                        referCount: (parseInt(rData.referCount) || 0) + 1
                    });
                }
            }
            await set(userRef, currentData);
        }
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        updateUI();
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

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        if (currentData.lastLimit && now < currentData.lastLimit) {
            document.getElementById('limit-box').style.display = 'block';
            document.getElementById('timer-display').innerText = formatTime(currentData.lastLimit - now);
        } else {
            document.getElementById('limit-box').style.display = 'none';
        }
        const bBtn = document.getElementById('bonus-btn');
        const bTxt = document.getElementById('bonus-text');
        if (currentData.lastBonus && now < currentData.lastBonus) {
            bBtn.disabled = true;
            bTxt.innerText = formatTime(currentData.lastBonus - now);
        } else {
            bBtn.disabled = false;
            bTxt.innerText = "Daily Bonus";
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
}

window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    window.open("https://www.google.com", '_blank');
    currentData.balance = (parseFloat(currentData.balance) || 0) + 10;
    currentData.lastBonus = now + (3 * 60 * 60 * 1000); 
    await update(userRef, currentData);
    updateUI();
    alert("Tk.10 Bonus Claimed!");
};

window.startVideoTask = async () => {
    if (currentData.lastLimit && new Date().getTime() < currentData.lastLimit) return;

    if (window.unityAds && window.unityAds.isReady(placementId)) {
        window.unityAds.show(placementId, {
            result: async (status) => {
                if (status === 'COMPLETED') {
                    currentData.balance += 10;
                    currentData.doneToday = (currentData.doneToday || 0) + 1;
                    currentData.totalTaskCount = (currentData.totalTaskCount || 0) + 1;
                    if (currentData.doneToday >= 4) {
                        currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); 
                        currentData.doneToday = 0;
                    }
                    await update(userRef, currentData);
                    updateUI();
                    alert("Task Completed! Tk.10 Added.");
                    location.reload();
                } else {
                    alert("Ad not finished!");
                }
            }
        });
    } else {
        alert("Ads are loading... please try again.");
    }
};

window.sendWithdrawRequest = async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    if (amount < 500) return alert("Min Tk.500");
    if (currentData.balance < amount) return alert("Insufficient Balance");
    currentData.balance -= amount;
    await update(userRef, currentData);
    updateUI();
    alert("Request Sent!");
    closeWithdraw();
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    if(!e || !p) return alert("Fill all fields");
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { try { await createUserWithEmailAndPassword(auth, e, p); } catch (err) { alert(err.message); } }
});

document.addEventListener('click', (e) => {
    const menu = document.getElementById('side-menu');
    const trigger = document.querySelector('.menu-trigger');
    if (menu.classList.contains('active') && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.classList.remove('active');
    }
});
