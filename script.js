import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, profilePic: "" };
const directLink = "https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";

// Login / Signup Logic
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("ইমেইল এবং পাসওয়ার্ড দিন");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { document.getElementById('auth-error').innerText = "Login Failed: " + err.message; }
    }
});

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        userRef = ref(db, 'users/' + user.uid);
        await loadUserData();
    }
});

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
    // ব্যালেন্স ফিক্স: নিশ্চিতভাবে নাম্বার ফরম্যাটে দেখানো
    const safeBalance = parseFloat(currentData.balance) || 0;
    document.getElementById('balance').innerText = safeBalance.toFixed(2);
}

// প্রোফাইল পিকচার আপলোড ও সেভ
document.getElementById('profileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file.size > 500000) return alert("File too large! Max 500KB."); // লিমিট
    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64 = reader.result;
        document.getElementById('profile-img').src = base64;
        currentData.profilePic = base64;
        await update(userRef, { profilePic: base64 });
    }
    if(file) reader.readAsDataURL(file);
});

// টাস্ক লজিক (বিজ্ঞাপন আগে, টাইমার পরে)
window.startVideoTask = function(id) {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return alert("Daily Limit! Come back later.");

    window.open(directLink, '_blank'); // আগে বিজ্ঞাপন খুলবে
    
    const overlay = document.getElementById('videoOverlay');
    overlay.style.display = 'flex';
    let count = 20;
    document.getElementById('seconds').innerText = count;

    const t = setInterval(async () => {
        count--;
        document.getElementById('seconds').innerText = count;
        if (count <= 0) {
            clearInterval(t);
            overlay.style.display = 'none';
            await addBalance(id);
        }
    }, 1000);
}

// ব্যালেন্স যোগ করার ফিক্সড ফাংশন
async function addBalance(id) {
    let newBalance = (parseFloat(currentData.balance) || 0) + 5.00;
    let newDoneToday = (parseInt(currentData.doneToday) || 0) + 1;
    let newLimit = currentData.lastLimit || 0;

    if (newDoneToday >= 4) {
        newLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    try {
        await update(userRef, {
            balance: newBalance,
            doneToday: newDoneToday,
            lastLimit: newLimit
        });
        
        // লোকাল ডাটা আপডেট
        currentData.balance = newBalance;
        currentData.doneToday = newDoneToday;
        currentData.lastLimit = newLimit;

        updateDisplay();
        alert("৳৫.০০ সফলভাবে যোগ হয়েছে!");
        location.reload(); 
    } catch (e) {
        alert("Error saving balance!");
    }
}

// ডেইলি বোনাস (ডাইরেক্টলিঙ্কসহ)
window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastBonus') === today) return alert("Already claimed today!");

    window.open(directLink, '_blank'); // বোনাসেও বিজ্ঞাপন খুলবে

    let newBalance = (parseFloat(currentData.balance) || 0) + 20.00;
    await update(userRef, { balance: newBalance });
    
    currentData.balance = newBalance;
    localStorage.setItem('lastBonus', today);
    updateDisplay();
    alert("৳২০.০০ ডেইলি বোনাস যোগ হয়েছে!");
};

// লিমিট টাইমার চেক
function checkCooldown() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        document.getElementById('limit-box').style.display = 'block';
        const timer = setInterval(() => {
            const diff = currentData.lastLimit - new Date().getTime();
            if (diff <= 0) { clearInterval(timer); location.reload(); }
            const h = Math.floor(diff / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);
            document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
        }, 1000);
    }
}
