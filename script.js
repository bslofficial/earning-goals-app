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

// --- Adsterra Direct Link এখানে আপনার লিংকটি বসান ---
const adsterraLink = "https://www.highrevenuenetwork.com/your_direct_link_here"; 

// Sidebar Function
window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

onAuthStateChanged(auth, async (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        
        // রিয়েলটাইম ডাটা আপডেট
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                updateUI();
            } else {
                setupNewUser(user.uid);
            }
        });

        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        
        startTimers();
        loadingScreen.style.display = 'none';
        authScreen.style.display = 'none';
        mainApp.style.display = 'block';
    } else {
        loadingScreen.style.display = 'none';
        authScreen.style.display = 'flex';
        mainApp.style.display = 'none';
    }
});

async function setupNewUser(userId) {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref');
    if (referrerId) {
        const refUserRef = ref(db, 'users/' + referrerId);
        const refSnap = await get(refUserRef);
        if (refSnap.exists()) {
            const rData = refSnap.val();
            await update(refUserRef, {
                balance: (parseFloat(rData.balance) || 0) + 30,
                referCount: (parseInt(rData.referCount) || 0) + 1
            });
        }
    }
    await set(ref(db, 'users/' + userId), currentData);
}

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    document.getElementById('refer-count').innerText = currentData.referCount || 0;
    document.getElementById('tasks-done').innerText = currentData.totalTaskCount || 0;
}

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        
        // টাস্ক লিমিট টাইমার
        if (currentData.lastLimit && now < currentData.lastLimit) {
            document.getElementById('limit-box').style.display = 'block';
            document.getElementById('timer-display').innerText = formatTime(currentData.lastLimit - now);
        } else {
            document.getElementById('limit-box').style.display = 'none';
        }

        // ডেইলি বোনাস টাইমার
        const bBtn = document.getElementById('bonus-btn');
        const bTxt = document.getElementById('bonus-text');
        if (currentData.lastBonus && now < currentData.lastBonus) {
            bBtn.disabled = true;
            bTxt.innerText = formatTime(currentData.lastBonus - now);
        } else {
            bBtn.disabled = false;
            bTxt.innerText = "Daily Bonus";
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
}

window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    
    window.open(adsterraLink, '_blank'); // বোনাসেও অ্যাডস্টেরা লিংক দিয়ে দিলাম
    
    await update(userRef, {
        balance: (parseFloat(currentData.balance) || 0) + 10,
        lastBonus: now + (3 * 60 * 60 * 1000)
    });
    alert("Tk.10 Bonus Claimed!");
};

// --- Adsterra Task System ---
window.startVideoTask = async () => {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        alert("Please wait for the timer to finish!");
        return;
    }

    // অ্যাডস্টেরা ডাইরেক্ট লিংক ওপেন হবে
    window.open(adsterraLink, '_blank');

    // অ্যাড দেখে ফিরে আসলে টাকা যোগ হবে
    setTimeout(async () => {
        let newBalance = (parseFloat(currentData.balance) || 0) + 10;
        let newDoneToday = (parseInt(currentData.doneToday) || 0) + 1;
        let newTotalTask = (parseInt(currentData.totalTaskCount) || 0) + 1;
        let newLimit = currentData.lastLimit || 0;

        if (newDoneToday >= 4) {
            newLimit = new Date().getTime() + (24 * 60 * 60 * 1000); 
            newDoneToday = 0;
            alert("Daily limit reached! Next tasks in 24 hours.");
        } else {
            alert("Task Completed! Tk.10 Added.");
        }

        await update(userRef, {
            balance: newBalance,
            doneToday: newDoneToday,
            totalTaskCount: newTotalTask,
            lastLimit: newLimit
        });
    }, 2000); // ২ সেকেন্ড পর ডাটা আপডেট হবে
};

window.sendWithdrawRequest = async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    if (amount < 500) return alert("Min Tk.500");
    if (currentData.balance < amount) return alert("Insufficient Balance");
    
    await update(userRef, { balance: currentData.balance - amount });
    alert("Request Sent!");
    closeWithdraw();
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value;
    const p = document.getElementById('password').value;
    if(!e || !p) return alert("Fill all fields");
    try { await signInWithEmailAndPassword(auth, e, p); } 
    catch { 
        try { 
            await createUserWithEmailAndPassword(auth, e, p); 
        } catch (err) { 
            alert(err.message); 
        } 
    }
});
