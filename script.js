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

// ইউনিটি অ্যাডস সেটিংস
const gameId = '6055094';
const placementId = 'Rewarded_Android';

if (window.unityAds) {
    window.unityAds.initialize(gameId, false);
}

// সাইডবার ওপেন/ক্লোজ ফাংশন
window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};

let userRef;
let currentData = { balance: 0, totalTaskCount: 0, referCount: 0 };
const referBonuses = [10, 7, 5, 3, 2, 1]; // লেভেল ১ থেকে ৬ এর টাকা

// --- ৬ লেভেল রেফারেল সিস্টেম ---
async function distributeReferBonus(referrerId, level = 0) {
    if (level >= 6 || !referrerId) return;
    const rRef = ref(db, 'users/' + referrerId);
    const snap = await get(rRef);
    if (snap.exists()) {
        const u = snap.val();
        await update(rRef, { 
            balance: (parseFloat(u.balance) || 0) + referBonuses[level],
            [`level_${level+1}_earning`]: (parseFloat(u[`level_${level+1}_earning`]) || 0) + referBonuses[level]
        });
        if (u.referredBy) distributeReferBonus(u.referredBy, level + 1);
    }
}

// --- ইন্ডিভিজুয়াল টাস্ক টাইমার আপডেট ---
function updateTaskTimers() {
    const now = new Date().getTime();
    for (let i = 1; i <= 4; i++) {
        const limit = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`task-${i}`);
        const timerText = document.getElementById(`timer-${i}`);

        if (now < limit) {
            card.classList.add('task-disabled');
            const diff = limit - now;
            const m = Math.floor(diff / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            timerText.innerText = `${m}m ${s}s`;
            timerText.style.color = "#ef4444";
        } else {
            card.classList.remove('task-disabled');
            timerText.innerText = "Tk.10.00";
            timerText.style.color = "#10b981";
        }
    }
}
setInterval(updateTaskTimers, 1000);

// অথেনটিকেশন এবং ডাটা লোড
onAuthStateChanged(auth, async (user) => {
    if (user) {
        userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, (snap) => {
            currentData = snap.val() || {};
            document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
            document.getElementById('refer-count').innerText = currentData.referCount || 0;
            document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
            document.getElementById('display-name').innerText = user.email.split('@')[0];
            document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
            
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

// টাস্ক স্টার্ট
window.startVideoTask = async (taskNum) => {
    if (window.unityAds && window.unityAds.isReady(placementId)) {
        window.unityAds.show(placementId, {
            result: async (status) => {
                if (status === 'COMPLETED') {
                    const updates = {
                        balance: (parseFloat(currentData.balance) || 0) + 10,
                        totalTaskCount: (parseInt(currentData.totalTaskCount) || 0) + 1
                    };
                    updates[`task_${taskNum}_limit`] = new Date().getTime() + (60 * 60 * 1000); // ১ ঘণ্টা লক
                    await update(userRef, updates);
                    alert("Success! Tk.10 Added.");
                }
            }
        });
    } else {
        alert("Ads are loading...");
    }
};

window.copyReferLink = () => {
    const input = document.getElementById('refer-url');
    input.select();
    document.execCommand('copy');
    alert("Refer link copied!");
};

// লগইন/সাইনআপ লজিক
document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    if(!e || !p) return alert("Fill all fields");
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { 
        try { 
            const res = await createUserWithEmailAndPassword(auth, e, p);
            const refId = new URLSearchParams(window.location.search).get('ref');
            const newUser = { email: e, balance: 0, referredBy: refId || null, referCount: 0, totalTaskCount: 0 };
            await set(ref(db, `users/${res.user.uid}`), newUser);
            if(refId) distributeReferBonus(refId, 0);
        } catch (err) { alert(err.message); }
    }
});

// উইথড্র এবং লগআউট ফাংশন
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

// মেনুর বাইরে ক্লিক করলে মেনু বন্ধ হবে
document.addEventListener('click', (e) => {
    const menu = document.getElementById('side-menu');
    const trigger = document.querySelector('.menu-trigger');
    if (menu.classList.contains('active') && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.classList.remove('active');
    }
});
