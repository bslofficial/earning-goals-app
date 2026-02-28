import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getDatabase, ref, get, update, set } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-database.js";

// ১. আপনার Firebase কনফিগারেশন
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

// ২. গ্লোবাল ভেরিয়েবল এবং সেটিংস
const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596";
const directLink = "https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0 };

// Unity Ads ইনিশিয়ালাইজেশন
if (typeof unityads !== 'undefined') {
    unityads.initialize(unityGameId, false);
}

// ৩. লগইন এবং রেজিস্ট্রেশন লজিক
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const pass = document.getElementById('password').value;
    if(!email || !pass) return alert("ইমেইল এবং পাসওয়ার্ড দিন");

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (err) {
            document.getElementById('auth-error').innerText = "ভুল ইমেইল বা পাসওয়ার্ড!";
        }
    }
});

// ৪. ইউজার লগইন আছে কি না চেক করা
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
    } else {
        currentData = { balance: 0, lastLimit: 0, doneToday: 0 };
        await set(userRef, currentData);
    }
    updateDisplay();
    checkCooldown();
}

function updateDisplay() {
    document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
}

// ৫. টাস্ক বাটন লজিক (আগে বিজ্ঞাপন, তারপর টাইমার)
window.startVideoTask = function(id) {
    const now = new Date().getTime();
    
    // ২৪ ঘণ্টার লিমিট চেক
    if (currentData.lastLimit && now < currentData.lastLimit) {
        return alert("লিমিট শেষ! ২৪ ঘণ্টা পর আবার কাজ আসবে।");
    }

    // বিজ্ঞাপন দেখানোর চেষ্টা
    if (typeof unityads !== 'undefined' && unityads.isReady(unityPlacement)) {
        unityads.show(unityPlacement);
        startTimer(id); // বিজ্ঞাপন শুরু হলে টাইমার কল
    } else {
        window.open(directLink, '_blank'); // ব্যাকআপ বিজ্ঞাপন
        startTimer(id);
    }
}

function startTimer(id) {
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
            await giveReward(id);
        }
    }, 1000);
}

async function giveReward(id) {
    currentData.balance += 5.00;
    currentData.doneToday = (currentData.doneToday || 0) + 1;

    // ৪টি টাস্ক শেষ হলে লিমিট সেট হবে
    if (currentData.doneToday >= 4) {
        currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
    }

    await update(userRef, currentData);
    updateDisplay();
    
    const btn = document.getElementById(`task-${id}`);
    if(btn) {
        btn.style.opacity = '0.3';
        btn.style.pointerEvents = 'none';
    }
    alert("৳৫.০০ সফলভাবে যোগ হয়েছে!");
    checkCooldown();
}

// ৬. লিমিট বা কাউন্টডাউন টাইমার চেক
function checkCooldown() {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        document.getElementById('limit-box').style.display = 'block';
        const timer = setInterval(() => {
            const diff = currentData.lastLimit - new Date().getTime();
            if (diff <= 0) {
                clearInterval(timer);
                resetTasks();
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
            }
        }, 1000);
    }
}

async function resetTasks() {
    currentData.doneToday = 0;
    currentData.lastLimit = 0;
    await update(userRef, currentData);
    location.reload();
}

// ৭. ডেইলি বোনাস লজিক
window.claimDailyBonus = async () => {
    const today = new Date().toDateString();
    if (localStorage.getItem('lastBonus') === today) {
        return alert("আজ অলরেডি বোনাস নিয়েছেন!");
    }

    currentData.balance += 20.00;
    await update(userRef, currentData);
    localStorage.setItem('lastBonus', today);
    updateDisplay();
    alert("৳২০ ডেইলি বোনাস যোগ করা হয়েছে!");
};

// ৮. উইথড্র বাটন লজিক
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    const acc = document.getElementById('accountNo').value;
    const method = document.getElementById('method').value;

    if (isNaN(amt) || amt < 500) return alert("মিনিমাম ৫০০ টাকা হতে হবে!");
    if (amt > currentData.balance) return alert("পর্যাপ্ত ব্যালেন্স নেই!");
    if (acc.length < 11) return alert("সঠিক নাম্বার দিন!");

    currentData.balance -= amt;
    await update(userRef, currentData);
    updateDisplay();

    const msg = `WithdrawRequest%0AEmail: ${auth.currentUser.email}%0AMethod: ${method}%0ANumber: ${acc}%0AAmount: ৳${amt}`;
    window.open(`https://wa.me/${myWA}?text=${msg}`, '_blank');
    window.closeWithdraw();
};
