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

const directLink = "https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";
let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, profilePic: "" };

// লগইন লজিক
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("Please fill all fields!");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { alert(err.message); }
    }
});

// ইউজার ডাটা চেক
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        userRef = ref(db, 'users/' + user.uid);
        
        const snap = await get(userRef);
        if (snap.exists()) {
            currentData = snap.val();
            if(currentData.profilePic) document.getElementById('profile-img').src = currentData.profilePic;
        } else {
            await set(userRef, currentData);
        }
        updateUI();
        checkLimit();
    }
});

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
}

// টাস্ক সিস্টেম
window.startVideoTask = function() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return alert("Cooldown Active!");

    window.open(directLink, '_blank');
    document.getElementById('videoOverlay').style.display = 'flex';
    let count = 20;

    const t = setInterval(async () => {
        count--;
        document.getElementById('seconds').innerText = count;
        if (count <= 0) {
            clearInterval(t);
            document.getElementById('videoOverlay').style.display = 'none';
            await creditReward(10.00, true);
        }
    }, 1000);
};

async function creditReward(amount, isTask) {
    currentData.balance = (parseFloat(currentData.balance) || 0) + amount;
    if(isTask) {
        currentData.doneToday = (parseInt(currentData.doneToday) || 0) + 1;
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (42 * 60 * 60 * 1000); // ৪২ ঘণ্টা লিমিট
        }
    }
    await update(userRef, currentData);
    updateUI();
    alert(`৳${amount} Added!`);
    location.reload();
}

// উইথড্র ফাংশন ফিক্স
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (!acc || amt < 500 || amt > currentData.balance) return alert("Invalid Amount or Insufficient Balance!");

    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateUI();

    const msg = `Withdraw Request:%0AEmail: ${auth.currentUser.email}%0AMethod: ${method}%0ANumber: ${acc}%0AAmount: ৳${amt}`;
    window.open(`https://wa.me/8801917044596?text=${msg}`);
    window.closeWithdraw();
};

window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('last_bonus') === today) return alert("Already claimed today!");
    window.open(directLink, '_blank');
    await creditReward(20.00, false);
    localStorage.setItem('last_bonus', today);
};

function checkLimit() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        document.getElementById('limit-box').style.display = 'block';
        setInterval(() => {
            const diff = currentData.lastLimit - new Date().getTime();
            if (diff <= 0) location.reload();
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
        }, 1000);
    }
}

window.handleLogout = () => signOut(auth).then(() => location.reload());
