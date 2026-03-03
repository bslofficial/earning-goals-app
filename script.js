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

const ADSTERRA_DIRECT_LINK = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

let userRef;
let currentData = {};

// --- বোনাস বাটন লজিক (১৪.৫৬ সেকেন্ড কাউন্টার) ---
window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) {
        alert("Wait for next bonus!");
        return;
    }

    const bBtn = document.getElementById('bonus-btn');
    const bTxt = document.getElementById('bonus-text') || bBtn; // fallback if bonus-text ID missing
    
    // Adsterra লিংক ওপেন করা
    window.open(ADSTERRA_DIRECT_LINK, '_blank');

    let timeLeft = 14.56;
    bBtn.disabled = true;

    const timer = setInterval(async () => {
        timeLeft -= 0.1;
        if (timeLeft <= 0) {
            clearInterval(timer);
            
            // ডাটাবেস আপডেট
            await update(userRef, {
                balance: (parseFloat(currentData.balance) || 0) + 1,
                lastBonus: new Date().getTime() + (24 * 60 * 60 * 1000)
            });
            
            alert("Tk.1.00 Bonus Added!");
            bBtn.innerText = "Daily Bonus";
        } else {
            bBtn.innerText = timeLeft.toFixed(2) + "s";
        }
    }, 100);
};

// --- উইথড্র বাটন ফাংশন ---
window.openWithdraw = () => {
    const modal = document.getElementById('withdrawModal');
    if (modal) modal.style.display = 'flex';
};

window.closeWithdraw = () => {
    const modal = document.getElementById('withdrawModal');
    if (modal) modal.style.display = 'none';
};

// --- টাস্ক বাটন লজিক ---
window.startVideoTask = (num) => {
    const nextTime = currentData[`task_${num}_limit`] || 0;
    if (new Date().getTime() < nextTime) {
        alert("Task on cooldown!");
        return;
    }
    window.location.href = `income.html?task=${num}`;
};

// --- মেনু এবং অথেন্টিকেশন ---
window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};

onAuthStateChanged(auth, (user) => {
    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            currentData = snap.val() || {};
            document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
            document.getElementById('display-name').innerText = user.email.split('@')[0];
            
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('auth-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    } else {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
    }
});

// লগইন/সাইনআপ ইভেন্ট লিসেনার
const loginBtn = document.getElementById('login-btn');
if (loginBtn) {
    loginBtn.addEventListener('click', async () => {
        const e = document.getElementById('email').value;
        const p = document.getElementById('password').value;
        if(!e || !p) return alert("Fill all fields");
        try {
            await signInWithEmailAndPassword(auth, e, p);
        } catch {
            try {
                const res = await createUserWithEmailAndPassword(auth, e, p);
                await set(ref(db, `users/${res.user.uid}`), { email: e, balance: 0, totalTaskCount: 0 });
            } catch (err) { alert(err.message); }
        }
    });
}
