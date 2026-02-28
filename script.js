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

// --- Auth Functions ---
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("Enter valid details");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { alert("Error: " + err.message); }
    }
});

window.handleLogout = () => {
    signOut(auth).then(() => location.reload());
};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        userRef = ref(db, 'users/' + user.uid);
        await loadUserData();
    }
});

// --- Data Management ---
async function loadUserData() {
    const snap = await get(userRef);
    if (snap.exists()) {
        currentData = snap.val();
        if(currentData.profilePic) document.getElementById('profile-img').src = currentData.profilePic;
    } else {
        await set(userRef, currentData);
    }
    updateDisplay();
    checkCooldown();
}

function updateDisplay() {
    const bal = parseFloat(currentData.balance) || 0;
    document.getElementById('balance').innerText = bal.toFixed(2);
}

// --- Profile Upload ---
document.getElementById('profileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.size < 600000) {
        const reader = new FileReader();
        reader.onloadend = async function() {
            const base64 = reader.result;
            document.getElementById('profile-img').src = base64;
            currentData.profilePic = base64;
            await update(userRef, { profilePic: base64 });
        }
        reader.readAsDataURL(file);
    } else { alert("Image too large (Max 600KB)"); }
});

// --- Task & Reward System ---

window.startVideoTask = function(id) {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return alert("Check back tomorrow!");

    window.open(directLink, '_blank');
    
    const overlay = document.getElementById('videoOverlay');
    overlay.style.display = 'flex';
    let count = 20;
    document.getElementById('seconds').innerText = count;

    const timer = setInterval(async () => {
        count--;
        document.getElementById('seconds').innerText = count;
        if (count <= 0) {
            clearInterval(timer);
            overlay.style.display = 'none';
            await addReward(5.00, true);
        }
    }, 1000);
}

async function addReward(amount, isTask) {
    currentData.balance = (parseFloat(currentData.balance) || 0) + amount;
    if(isTask) currentData.doneToday = (parseInt(currentData.doneToday) || 0) + 1;

    if (currentData.doneToday >= 4) {
        currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    await update(userRef, {
        balance: currentData.balance,
        doneToday: currentData.doneToday,
        lastLimit: currentData.lastLimit
    });
    
    updateDisplay();
    alert(`৳${amount} added successfully!`);
    location.reload(); 
}

window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('bonus_claimed') === today) return alert("Already claimed today!");
    
    window.open(directLink, '_blank');
    await addReward(20.00, false);
    localStorage.setItem('bonus_claimed', today);
};

// --- Cooldown & Modals ---
function checkCooldown() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        document.getElementById('limit-box').style.display = 'block';
        const t = setInterval(() => {
            const diff = currentData.lastLimit - new Date().getTime();
            if (diff <= 0) { clearInterval(t); location.reload(); }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
        }, 1000);
    }
}

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (amt < 500 || amt > currentData.balance) return alert("Invalid amount!");
    
    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateDisplay();
    window.open(`https://wa.me/8801917044596?text=Withdraw%0AUser:${auth.currentUser.email}%0AAmount:${amt}%0AMethod:${method}%0ANumber:${acc}`);
    window.closeWithdraw();
};
