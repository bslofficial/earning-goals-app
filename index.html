import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// --- আপনার দেওয়া FIREBASE তথ্য ---
const firebaseConfig = {
    apiKey: "AIzaSyDuLLapNwRk2Fl5rN6F0ezZb9KsMBKhvqA",
    authDomain: "earning-goals-app.firebaseapp.com",
    projectId: "earning-goals-app",
    databaseURL: "https://earning-goals-app-default-rtdb.firebaseio.com",
    storageBucket: "earning-goals-app.firebasestorage.app",
    messagingSenderId: "999611133128",
    appId: "1:999611133128:web:f8bd2cb60ac5a07b1249fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// --- ইউনিটি এবং অ্যাডস্টারা তথ্য ---
const unityGameId = '6055094';
const adsterraLink = "https://www.effectiveratecpm.com/z486m67w?key=41981242372d807662867809635e9854";

let currentData = {};
const referBonuses = [10, 7, 5, 3, 2, 1]; // ৬ লেভেল বোনাস

// --- ৬ লেভেল রেফারেল লজিক ---
async function distributeReferBonus(referrerId, level = 0) {
    if (level >= 6 || !referrerId) return;
    const rRef = ref(db, 'users/' + referrerId);
    const snap = await get(rRef);
    if (snap.exists()) {
        const u = snap.val();
        await update(rRef, { balance: (parseFloat(u.balance) || 0) + referBonuses[level] });
        if (u.referredBy) distributeReferBonus(u.referredBy, level + 1);
    }
}

// --- টাইমার এবং টাস্ক লজিক ---
function runTimers() {
    const now = new Date().getTime();
    for (let i = 1; i <= 4; i++) {
        const limit = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`card-${i}`);
        const text = document.getElementById(`timer-${i}`);
        if (now < limit) {
            card.classList.add('task-disabled');
            const diff = Math.ceil((limit - now) / 1000 / 60);
            text.innerText = diff + " min left";
        } else {
            card.classList.remove('task-disabled');
            text.innerText = "Tk. 10.00";
        }
    }
}
setInterval(runTimers, 1000);

// Unity Video Task
window.startVideoTask = async (num) => {
    // এখানে Unity Ads Show হবে। সফল হলে নিচের কোড:
    const nextTime = new Date().getTime() + (60 * 60 * 1000); // ১ ঘণ্টা
    const updates = { balance: (currentData.balance || 0) + 10 };
    updates[`task_${num}_limit`] = nextTime;
    await update(ref(db, `users/${auth.currentUser.uid}`), updates);
    alert("Task Success!");
};

// Adsterra Task
window.startAdsterraTask = () => {
    window.open(adsterraLink, "_blank");
    // ইউজার ফিরে এলে বোনাস দেওয়ার লজিক (নিরাপত্তার জন্য ৩-৫ মিনিট পর বাটন একটিভ করা যায়)
    alert("Visit and wait 30 seconds for Tk. 5 bonus!");
};

// ডাটা আপডেট করা
onAuthStateChanged(auth, (user) => {
    if (user) {
        onValue(ref(db, `users/${user.uid}`), (s) => {
            currentData = s.val() || {};
            document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
            document.getElementById('refer-url').value = window.location.origin + "?ref=" + user.uid;
        });
    }
});

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.copyLink = () => { document.getElementById('refer-url').select(); document.execCommand('copy'); alert("Copied!"); };
