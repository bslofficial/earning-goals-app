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

// ইউনিটি সেটিংস
const gameId = '6055094';
const placementId = 'Rewarded_Android';
if (window.unityAds) { window.unityAds.initialize(gameId, false); }

// সাইডবার
window.toggleMenu = () => { document.getElementById('side-menu').classList.toggle('active'); };

let userRef;
let currentData = {};
const referBonuses = [10, 7, 5, 3, 2, 1]; // Level 1 to 6

// ৬ লেভেল রেফারেল লজিক
async function giveReferBonus(referrerId, level = 0) {
    if (level >= 6 || !referrerId) return;
    const rRef = ref(db, 'users/' + referrerId);
    const snap = await get(rRef);
    if (snap.exists()) {
        const u = snap.val();
        await update(rRef, { balance: (parseFloat(u.balance) || 0) + referBonuses[level] });
        if (u.referredBy) giveReferBonus(u.referredBy, level + 1);
    }
}

// টাইমার আপডেট
function updateTimers() {
    const now = new Date().getTime();
    for (let i = 1; i <= 4; i++) {
        const nextTime = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`card-${i}`);
        const text = document.getElementById(`timer-${i}`);
        if (now < nextTime) {
            card.classList.add('task-disabled');
            const diff = nextTime - now;
            const m = Math.floor(diff / (1000 * 60));
            const s = Math.floor((diff % (1000 * 60)) / 1000);
            text.innerText = `${m}m ${s}s`;
            text.style.color = "#ef4444";
        } else {
            card.classList.remove('task-disabled');
            text.innerText = "Tk.10.00";
            text.style.color = "#10b981";
        }
    }
}
setInterval(updateTimers, 1000);

onAuthStateChanged(auth, async (user) => {
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
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app').style.display = 'none';
    }
});

window.startVideoTask = async (num) => {
    if (window.unityAds && window.unityAds.isReady(placementId)) {
        window.unityAds.show(placementId, {
            result: async (status) => {
                if (status === 'COMPLETED') {
                    const up = {
                        balance: (parseFloat(currentData.balance) || 0) + 10,
                        totalTaskCount: (parseInt(currentData.totalTaskCount) || 0) + 1
                    };
                    up[`task_${num}_limit`] = new Date().getTime() + (60 * 60 * 1000);
                    await update(userRef, up);
                    alert("Success! Tk.10 added.");
                }
            }
        });
    } else { alert("Ads Loading..."); }
};

window.copyReferLink = () => {
    const input = document.getElementById('refer-url');
    input.select();
    document.execCommand('copy');
    alert("Copied!");
};

window.handleLogout = () => signOut(auth).then(() => location.reload());
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    if(!e || !p) return alert("Empty fields!");
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { 
        try { 
            const res = await createUserWithEmailAndPassword(auth, e, p);
            const refId = new URLSearchParams(window.location.search).get('ref');
            await set(ref(db, `users/${res.user.uid}`), { email: e, balance: 0, referredBy: refId || null, referCount: 0, totalTaskCount: 0 });
            if(refId) giveReferBonus(refId, 0);
        } catch (err) { alert(err.message); }
    }
});
