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

// Unity Ads
const gameId = '6055094';
const placementId = 'Rewarded_Android';
if (window.unityAds) { window.unityAds.initialize(gameId, false); }

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');

let userRef;
let currentData = {};
const referBonuses = [10, 7, 5, 3, 2, 1];

// ৬ লেভেল রেফারেল লজিক
async function giveReferBonus(referrerId, level = 0) {
    if (level >= 6 || !referrerId) return;
    const rRef = ref(db, 'users/' + referrerId);
    const snap = await get(rRef);
    if (snap.exists()) {
        const u = snap.val();
        await update(rRef, { 
            balance: (parseFloat(u.balance) || 0) + referBonuses[level],
            referCount: (u.referCount || 0) + (level === 0 ? 1 : 0)
        });
        if (u.referredBy) giveReferBonus(u.referredBy, level + 1);
    }
}

// অল-ইন-ওয়ান টাইমার লুপ
function updateTimers() {
    if (!currentData) return;
    const now = new Date().getTime();
    
    // বোনাস বাটন ফিক্স
    const bBtn = document.getElementById('bonus-btn');
    const bTxt = document.getElementById('bonus-text');
    if (currentData.lastBonus && now < currentData.lastBonus) {
        bBtn.disabled = true;
        const diff = currentData.lastBonus - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        bTxt.innerText = `${h}h ${m}m ${s}s`;
    } else {
        bBtn.disabled = false;
        bTxt.innerText = "DAILY BONUS";
    }

    // ৪টি টাস্ক কার্ড ফিক্স
    for (let i = 1; i <= 4; i++) {
        const nextTime = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`card-${i}`);
        const text = document.getElementById(`timer-${i}`);
        if (now < nextTime) {
            card.classList.add('task-disabled');
            const diff = nextTime - now;
            text.innerText = `${Math.floor(diff/60000)}m ${Math.floor((diff%60000)/1000)}s`;
        } else {
            card.classList.remove('task-disabled');
            text.innerText = "৳ 10.00";
        }
    }
}
setInterval(updateTimers, 1000);

onAuthStateChanged(auth, (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            currentData = snap.val() || {};
            document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
            document.getElementById('refer-count').innerText = currentData.referCount || 0;
            document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
            document.getElementById('display-name').innerText = user.email.split('@')[0];
            document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    } else {
        // লগইন না থাকলে লগইন পেজে পাঠাতে পারেন অথবা অন্য স্ক্রিন দেখাতে পারেন
        window.location.href = "login.html"; 
    }
});

window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    window.open("https://www.google.com", '_blank');
    await update(userRef, {
        balance: (parseFloat(currentData.balance) || 0) + 10,
        lastBonus: now + (3 * 60 * 60 * 1000) // ৩ ঘণ্টা
    });
    alert("Tk.10 Bonus Claimed!");
};

window.startVideoTask = async (num) => {
    if (window.unityAds && window.unityAds.isReady(placementId)) {
        window.unityAds.show(placementId, {
            result: async (status) => {
                if (status === 'COMPLETED') {
                    const up = {
                        balance: (parseFloat(currentData.balance) || 0) + 10,
                        totalTaskCount: (parseInt(currentData.totalTaskCount) || 0) + 1
                    };
                    up[`task_${num}_limit`] = new Date().getTime() + (60 * 60 * 1000); // ১ ঘণ্টা
                    await update(userRef, up);
                    alert("Task Complete! ৳10 Added.");
                }
            }
        });
    } else { alert("Ad is loading..."); }
};

window.copyReferLink = () => {
    const input = document.getElementById('refer-url');
    input.select();
    document.execCommand('copy');
    alert("Refer Link Copied!");
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());
