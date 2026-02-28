import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// ১. Firebase কনফিগারেশন
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

// ২. লগইন ফাংশন
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("ইমেইল এবং পাসওয়ার্ড দিন");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { alert("Error: " + err.message); }
    }
});

// ৩. লগআউট
window.handleLogout = () => signOut(auth).then(() => location.reload());

// ৪. ইউজার স্টেট চেক
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

// ৫. টাস্ক ও ব্যালেন্স যোগ

window.startVideoTask = function(id) {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return alert("Daily Limit!");

    window.open(directLink, '_blank');
    document.getElementById('videoOverlay').style.display = 'flex';
    let count = 20;

    const t = setInterval(async () => {
        count--;
        document.getElementById('seconds').innerText = count;
        if (count <= 0) {
            clearInterval(t);
            document.getElementById('videoOverlay').style.display = 'none';
            await saveMoney(5.00, true);
        }
    }, 1000);
};

async function saveMoney(amount, isTask) {
    currentData.balance = (parseFloat(currentData.balance) || 0) + amount;
    if(isTask) currentData.doneToday = (parseInt(currentData.doneToday) || 0) + 1;

    if (currentData.doneToday >= 4) {
        currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    await update(userRef, currentData);
    updateUI();
    alert(`৳${amount} যোগ হয়েছে!`);
    location.reload();
}

// ৬. উইথড্র সিস্টেম
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (amt < 500 || amt > currentData.balance) return alert("অ্যামাউন্ট ভুল বা ৫০০ টাকার কম!");
    
    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateUI();
    
    const msg = `WithdrawRequest%0AUser:${auth.currentUser.email}%0AMethod:${method}%0ANumber:${acc}%0AAmount:৳${amt}`;
    window.open(`https://wa.me/8801917044596?text=${msg}`);
    window.closeWithdraw();
};

// ৭. ডেইলি বোনাস
window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('bonus_date') === today) return alert("আজ নেওয়া হয়েছে!");
    window.open(directLink, '_blank');
    await saveMoney(20.00, false);
    localStorage.setItem('bonus_date', today);
};

// প্রোফাইল পিকচার আপলোড
document.getElementById('profileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            document.getElementById('profile-img').src = base64;
            await update(userRef, { profilePic: base64 });
        };
        reader.readAsDataURL(file);
    }
});

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
