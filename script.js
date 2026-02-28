import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// Firebase Config
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
let currentData = { balance: 0, lastLimit: 0, doneToday: 0 };

// Login বাটন লজিক
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorDisplay = document.getElementById('auth-error');

    if(!email || !pass) return alert("ইমেইল এবং পাসওয়ার্ড দিন");

    try {
        // প্রথমে চেষ্টা করবে লগইন করার
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
        // যদি একাউন্ট না থাকে, তবে অটোমেটিক রেজিস্টার হবে
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (regError) {
            errorDisplay.innerText = "Error: " + regError.message;
        }
    }
});

// লগইন সফল হলে ড্যাশবোর্ড দেখাবে
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        
        userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        
        if (snap.exists()) {
            currentData = snap.val();
        } else {
            currentData = { balance: 0, lastLimit: 0, doneToday: 0 };
            await set(userRef, currentData);
        }
        updateDisplay();
        checkCooldown();
    }
});

function updateDisplay() {
    document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
}

// টাস্ক বাটন: আগে বিজ্ঞাপন, তারপর টাইমার
window.startVideoTask = function(id) {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        return alert("২৪ ঘণ্টার লিমিট চলছে!");
    }

    // বিজ্ঞাপন ওপেন হবে
    window.open(directLink, '_blank');
    
    // টাইমার স্ক্রিন দেখাবে
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
            await addMoney(id);
        }
    }, 1000);
}

async function addMoney(id) {
    currentData.balance = (currentData.balance || 0) + 5.00;
    currentData.doneToday = (currentData.doneToday || 0) + 1;

    if (currentData.doneToday >= 4) {
        currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    await update(userRef, currentData);
    updateDisplay();
    alert("৳৫.০০ যোগ হয়েছে!");
    location.reload(); 
}

// ডেইলি বোনাস
window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastBonus') === today) return alert("আজ অলরেডি নিয়েছেন!");

    currentData.balance = (currentData.balance || 0) + 20.00;
    await update(userRef, { balance: currentData.balance });
    localStorage.setItem('lastBonus', today);
    updateDisplay();
    alert("৳২০ বোনাস যোগ হয়েছে!");
};

// লিমিট চেক
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

// উইথড্র ফাংশন
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (amt < 500 || amt > currentData.balance) return alert("ব্যালেন্স নেই বা ভুল অ্যামাউন্ট!");
    
    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateDisplay();
    window.open(`https://wa.me/8801917044596?text=WithdrawRequest%0AEmail:${auth.currentUser.email}%0AMethod:${method}%0ANumber:${acc}%0AAmount:৳${amt}`);
    window.closeWithdraw();
};
