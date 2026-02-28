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

// লগইন / অটো-রেজিস্টার
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("পাসওয়ার্ড ও ইমেইল দিন");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { document.getElementById('auth-error').innerText = err.message; }
    }
});

window.handleLogout = () => signOut(auth).then(() => location.reload());

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

// টাস্ক সিস্টেম (১০ টাকা এবং ৪২ ঘণ্টা লিমিট)
window.startVideoTask = function() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return alert("Wait for the timer!");

    window.open(directLink, '_blank');
    document.getElementById('videoOverlay').style.display = 'flex';
    let count = 20;

    const t = setInterval(async () => {
        count--;
        document.getElementById('seconds').innerText = count;
        if (count <= 0) {
            clearInterval(t);
            document.getElementById('videoOverlay').style.display = 'none';
            await saveMoney(10.00, true);
        }
    }, 1000);
};

async function saveMoney(amount, isTask) {
    currentData.balance = (parseFloat(currentData.balance) || 0) + amount;
    if(isTask) currentData.doneToday = (parseInt(currentData.doneToday) || 0) + 1;

    // ৪২ ঘণ্টা লিমিট লজিক (৪টি কাজের পর)
    if (currentData.doneToday >= 4) {
        currentData.lastLimit = new Date().getTime() + (42 * 60 * 60 * 1000);
    }

    await update(userRef, currentData);
    updateUI();
    alert(`৳${amount} যোগ হয়েছে!`);
    location.reload();
}

// ডেইলি বোনাস ২০ টাকা
window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('b_date') === today) return alert("Already claimed!");
    window.open(directLink, '_blank');
    await saveMoney(20.00, false);
    localStorage.setItem('b_date', today);
};

// উইথড্র সিস্টেম
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    if (amt < 500 || amt > currentData.balance) return alert("ব্যালেন্স নেই বা ভুল অ্যামাউন্ট!");
    
    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateUI();
    window.open(`https://wa.me/8801917044596?text=Withdraw%0AUser:${auth.currentUser.email}%0ANumber:${acc}%0AAmount:৳${amt}`);
    window.closeWithdraw();
};

// লিমিট টাইমার
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
