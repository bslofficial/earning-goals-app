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

window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};

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

async function setupNewUser(userId) {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref');
    const newData = { balance: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };
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
    await set(ref(db, 'users/' + userId), newData);
}

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

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

window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    window.open(adsterraLink, '_blank');
    await update(userRef, { balance: (currentData.balance + 10), lastBonus: now + (3 * 60 * 60 * 1000) });
};

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

// --- নতুন স্মার্ট লগইন লজিক ---
document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('password').value.trim();

    if(!e || !p) return alert("ইমেইল এবং পাসওয়ার্ড দিন!");

    try {
        // প্রথমে লগইন করার চেষ্টা করবে
        await signInWithEmailAndPassword(auth, e, p);
    } catch (error) {
        // যদি ইউজার খুঁজে না পায়, তবেই নতুন অ্যাকাউন্ট খুলবে
        if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
            // ভুল পাসওয়ার্ডের কারণে 'invalid-credential' হতে পারে, তাই সাবধান
            if(confirm("অ্যাকাউন্ট পাওয়া যায়নি। আপনি কি নতুন অ্যাকাউন্ট খুলতে চান?")){
                try {
                    await createUserWithEmailAndPassword(auth, e, p);
                } catch (signUpError) {
                    alert("সাইনআপ সমস্যা: " + signUpError.message);
                }
            } else {
                alert("সঠিক পাসওয়ার্ড দিয়ে পুনরায় চেষ্টা করুন।");
            }
        } else {
            alert("লগইন সমস্যা: " + error.message);
        }
    }
});

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());
