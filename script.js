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

// ৪২ ঘণ্টা ও ২৪ ঘণ্টা টাইমার লজিক
function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();

        // টাস্ক লিমিট (৪২ ঘণ্টা)
        if (currentData.lastLimit && now < currentData.lastLimit) {
            document.getElementById('limit-box').style.display = 'block';
            const diff = currentData.lastLimit - now;
            document.getElementById('timer-display').innerText = formatTime(diff);
        } else {
            document.getElementById('limit-box').style.display = 'none';
        }

        // বোনাস লিমিট (২৪ ঘণ্টা)
        if (currentData.lastBonus && now < currentData.lastBonus) {
            const diffB = currentData.lastBonus - now;
            document.getElementById('bonus-btn').disabled = true;
            document.getElementById('bonus-text').innerText = formatTime(diffB);
        } else {
            document.getElementById('bonus-btn').disabled = false;
            document.getElementById('bonus-text').innerText = "Daily Bonus";
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
}

window.claimDailyBonus = async () => {
    window.open("https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb", '_blank');
    currentData.balance += 20;
    currentData.lastBonus = new Date().getTime() + (24 * 60 * 60 * 1000); // ২৪ ঘণ্টা
    await update(userRef, currentData);
    updateUI();
    alert("৳২০ বোনাস যোগ হয়েছে!");
};

window.startVideoTask = async () => {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return;

    window.open("https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb", '_blank');
    document.getElementById('videoOverlay').style.display = 'flex';
    
    setTimeout(async () => {
        document.getElementById('videoOverlay').style.display = 'none';
        currentData.balance += 10;
        currentData.doneToday = (currentData.doneToday || 0) + 1;
        
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (42 * 60 * 60 * 1000); // ৪২ ঘণ্টা
            currentData.doneToday = 0;
        }
        
        await update(userRef, currentData);
        updateUI();
        alert("৳১০ যোগ হয়েছে!");
        location.reload();
    }, 20000);
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    if (amt < 500 || amt > currentData.balance) return alert("ব্যালেন্স কম!");
    
    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateUI();
    window.open(`https://wa.me/8801917044596?text=Withdraw:৳${amt}`);
    window.closeWithdraw();
};

window.handleLogout = () => signOut(auth).then(() => location.reload());
