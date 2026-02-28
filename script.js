import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getDatabase, ref, get, update, set, onValue } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const firebaseConfig = {
    // আপনার ফায়ারবেস কনফিগ এখানে দিন
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

let currentData = {};
const referBonuses = [10, 7, 5, 3, 2, 1]; // লেভেল ১-৬ এর টাকা

// --- ৬ লেভেল রেফারেল ফাংশন ---
async function giveReferBonus(referrerId, level = 0) {
    if (level >= 6 || !referrerId) return;

    const refUserRef = ref(db, 'users/' + referrerId);
    const snap = await get(refUserRef);

    if (snap.exists()) {
        const userData = snap.val();
        const bonusAmount = referBonuses[level];
        
        await update(refUserRef, {
            balance: (parseFloat(userData.balance) || 0) + bonusAmount,
            [`level_${level + 1}_earnings`]: (parseFloat(userData[`level_${level + 1}_earnings`]) || 0) + bonusAmount
        });

        // যদি উপরের লেভেলের রেফারার থাকে
        if (userData.referredBy) {
            await giveReferBonus(userData.referredBy, level + 1);
        }
    }
}

// --- ইন্ডিভিজুয়াল টাস্ক টাইমার লজিক ---
function updateTimersUI() {
    const now = new Date().getTime();
    for (let i = 1; i <= 4; i++) {
        const nextAllowed = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`task-card-${i}`);
        const timerText = document.getElementById(`timer-${i}`);

        if (now < nextAllowed) {
            const diff = nextAllowed - now;
            const mins = Math.floor(diff / (1000 * 60));
            const secs = Math.floor((diff % (1000 * 60)) / 1000);
            
            card.classList.add('task-disabled');
            timerText.innerText = `${mins}m ${secs}s`;
            timerText.className = "timer-active";
        } else {
            card.classList.remove('task-disabled');
            timerText.innerText = "Tk.10.00";
            timerText.className = "timer-ready";
        }
    }
}
setInterval(updateTimersUI, 1000);

// --- ভিডিও টাস্ক ফাংশন ---
window.startVideoTask = async (taskNum) => {
    // এখানে Unity Ads দেখানোর কোড হবে
    // বিজ্ঞাপন শেষ হলে নিচের কোডটি চলবে:
    
    const waitTime = 60 * 60 * 1000; // ১ ঘণ্টা ওয়েটিং টাইম
    const nextTime = new Date().getTime() + waitTime;

    const updateData = {
        balance: (parseFloat(currentData.balance) || 0) + 10,
        totalTaskCount: (parseInt(currentData.totalTaskCount) || 0) + 1
    };
    updateData[`task_${taskNum}_limit`] = nextTime;

    await update(ref(db, `users/${auth.currentUser.uid}`), updateData);
    alert("Task Success! Tk.10 Added.");
};

// ডাটা লোড করা
onAuthStateChanged(auth, (user) => {
    if (user) {
        onValue(ref(db, `users/${user.uid}`), (snap) => {
            currentData = snap.val() || {};
            document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
            document.getElementById('refer-url').value = `https://proearn.com/join?ref=${user.uid}`;
        });
    }
});
