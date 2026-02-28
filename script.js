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

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0 };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        
        userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        if (snap.exists()) {
            currentData = snap.val();
        } else {
            await set(userRef, currentData);
        }
        updateUI();
        startTimers();
    }
});

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
}

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        // টাস্ক লিমিট ২৪ ঘণ্টা (24h Countdown)
        if (currentData.lastLimit && now < currentData.lastLimit) {
            document.getElementById('limit-box').style.display = 'block';
            document.getElementById('timer-display').innerText = formatTime(currentData.lastLimit - now);
        } else {
            document.getElementById('limit-box').style.display = 'none';
        }
        // বোনাস লিমিট ২৪ ঘণ্টা
        if (currentData.lastBonus && now < currentData.lastBonus) {
            document.getElementById('bonus-btn').disabled = true;
            document.getElementById('bonus-text').innerText = formatTime(currentData.lastBonus - now);
        } else {
            document.getElementById('bonus-btn').disabled = false;
            document.getElementById('bonus-text').innerText = "Daily Bonus";
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h.toString().padStart(2,'0')}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
}

window.startVideoTask = async () => {
    if (currentData.lastLimit && new Date().getTime() < currentData.lastLimit) return;
    window.open("https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb", '_blank');
    document.getElementById('videoOverlay').style.display = 'flex';
    setTimeout(async () => {
        document.getElementById('videoOverlay').style.display = 'none';
        currentData.balance += 10;
        currentData.doneToday = (currentData.doneToday || 0) + 1;
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); // ২৪ ঘণ্টা বিরতি
            currentData.doneToday = 0;
        }
        await update(userRef, currentData);
        updateUI();
        location.reload();
    }, 20000);
};

window.claimDailyBonus = async () => {
    window.open("https://google.com", '_blank');
    currentData.balance += 20;
    currentData.lastBonus = new Date().getTime() + (24 * 60 * 60 * 1000); // ২৪ ঘণ্টা
    await update(userRef, currentData);
    updateUI();
};

window.shareReferLink = async () => {
    const url = document.getElementById("refer-url").value;
    if (navigator.share) {
        navigator.share({ title: 'ProEarn', text: 'Earn ৳৩০ on Referral!', url: url });
    } else {
        navigator.clipboard.writeText(url);
        alert("Link Copied!");
    }
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { try { await createUserWithEmailAndPassword(auth, e, p); } catch (err) { alert(err.message); } }
});
