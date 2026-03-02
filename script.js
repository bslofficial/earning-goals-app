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
const testMode = true; 

if (window.unityAds) {
    window.unityAds.initialize(gameId, testMode);
}

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

// Auth State Handler
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
                set(userRef, currentData); 
            }
        });

        const sidebarName = document.getElementById('sidebar-user-name');
        if(sidebarName) sidebarName.innerText = user.email.split('@')[0];
        
        const referUrl = document.getElementById('refer-url');
        if(referUrl) referUrl.value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(authScreen) authScreen.style.display = 'none';
        if(mainApp) mainApp.style.display = 'block';
        
        startTimers(); // টাইমার চালু করা
    } else {
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(authScreen) authScreen.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
    }
});

function updateUI() {
    const balanceEl = document.getElementById('balance');
    if(balanceEl) balanceEl.innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    
    const referCountEl = document.getElementById('refer-count');
    if(referCountEl) referCountEl.innerText = currentData.referCount || 0;
    
    const tasksDoneEl = document.getElementById('tasks-done');
    if(tasksDoneEl) tasksDoneEl.innerText = currentData.totalTaskCount || 0;
}

// টাইমার ফাংশন (Bonus এবং Task Cooldown এর জন্য)
function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        
        // বোনাস বাটন কন্ট্রোল
        const bBtn = document.getElementById('bonus-btn');
        if (bBtn) {
            if (currentData.lastBonus && now < currentData.lastBonus) {
                bBtn.disabled = true;
                bBtn.innerText = formatTime(currentData.lastBonus - now);
                bBtn.style.opacity = "0.6";
            } else {
                bBtn.disabled = false;
                bBtn.innerText = "Daily Bonus";
                bBtn.style.opacity = "1";
            }
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
}

// ভিডিও টাস্ক লজিক
window.startVideoTask = async (taskNum) => {
    if (currentData.lastLimit && new Date().getTime() < currentData.lastLimit) {
        return alert("Please wait for cooldown!");
    }

    if (window.unityAds && window.unityAds.isReady(placementId)) {
        window.unityAds.show(placementId, {
            result: async (status) => {
                if (status === 'COMPLETED') {
                    let updates = {
                        balance: (parseFloat(currentData.balance) || 0) + 10,
                        doneToday: (currentData.doneToday || 0) + 1,
                        totalTaskCount: (currentData.totalTaskCount || 0) + 1
                    };
                    // ৪টি টাস্ক শেষ হলে ২৪ ঘণ্টার বিরতি
                    if (updates.doneToday >= 4) {
                        updates.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); 
                        updates.doneToday = 0;
                    }
                    await update(userRef, updates);
                    alert("Task Completed! Tk.10 Added.");
                } else {
                    alert("Ad not finished!");
                }
            }
        });
    } else {
        alert("Ads are loading... please wait a few seconds.");
    }
};

// বোনাস ক্লেইম
window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    
    window.open("https://www.google.com", '_blank');
    await update(userRef, {
        balance: (parseFloat(currentData.balance) || 0) + 10,
        lastBonus: now + (3 * 60 * 60 * 1000) // ৩ ঘণ্টা পর আবার নেওয়া যাবে
    });
    alert("Tk.10 Bonus Claimed!");
};

// Withdraw Request
window.sendWithdrawRequest = async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const account = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (amount < 500 || isNaN(amount)) return alert("Min Tk.500");
    if (currentData.balance < amount) return alert("Insufficient Balance");
    if (!account) return alert("Enter Account Number");

    await update(userRef, { balance: (currentData.balance - amount) });
    alert(`Withdrawal Request Sent: ${amount} via ${method}`);
    window.closeWithdraw();
};

// UI ইন্টারঅ্যাকশন
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

window.copyReferLink = () => {
    const url = document.getElementById('refer-url');
    url.select();
    navigator.clipboard.writeText(url.value);
    alert("Refer Link Copied!");
};

// লগইন/সাইনআপ ইভেন্ট
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

window.showSection = (name) => {
    const dash = document.getElementById('dashboard-section');
    const other = document.getElementById('other-section');
    const details = document.getElementById('section-details');
    if(!dash || !other) return;

    if(name === 'dashboard') {
        dash.style.display = 'block';
        other.style.display = 'none';
    } else {
        dash.style.display = 'none';
        other.style.display = 'block';
        details.innerHTML = `<h3>${name.toUpperCase()}</h3><p>No data available yet.</p>`;
    }
    window.toggleMenu();
};
