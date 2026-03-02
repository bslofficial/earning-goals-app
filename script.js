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

// আপনার Adsterra ডাইরেক্ট লিংক
const adsterraLink = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

window.toggleMenu = () => {
    document.getElementById('side-menu').classList.toggle('active');
};

let userRef;
let currentData = { balance: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

onAuthStateChanged(auth, async (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        
        // রিয়েলটাইম ডাটা লিসেনার (এটি আপনার অ্যাপকে দ্রুত করবে)
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
        
        // প্রতিটি টাস্ক কার্ডের আলাদা টাইমার আপডেট
        for (let i = 1; i <= 4; i++) {
            const taskLimit = currentData[`task_${i}_limit`] || 0;
            const card = document.getElementById(`card-${i}`);
            const timerText = document.getElementById(`timer-${i}`);
            
            if (taskLimit && now < taskLimit) {
                if(card) card.classList.add('task-disabled');
                if(timerText) timerText.innerText = formatTime(taskLimit - now);
            } else {
                if(card) card.classList.remove('task-disabled');
                if(timerText) timerText.innerText = "Tk.10.00";
            }
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
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    return `${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
}

window.claimDailyBonus = async () => {
    const now = new Date().getTime();
    if (currentData.lastBonus && now < currentData.lastBonus) return;
    window.open(adsterraLink, '_blank');
    await update(userRef, {
        balance: (parseFloat(currentData.balance) || 0) + 10,
        lastBonus: now + (3 * 60 * 60 * 1000)
    });
    alert("Tk.10 Bonus Claimed!");
};

window.startVideoTask = async (taskNum) => {
    const now = new Date().getTime();
    const taskLimitKey = `task_${taskNum}_limit`;
    
    if (currentData[taskLimitKey] && now < currentData[taskLimitKey]) {
        alert("Please wait for the timer!");
        return;
    }

    window.open(adsterraLink, '_blank');

    // ডাটা আপডেট লজিক
    const updates = {};
    updates['balance'] = (parseFloat(currentData.balance) || 0) + 10;
    updates['totalTaskCount'] = (parseInt(currentData.totalTaskCount) || 0) + 1;
    updates[taskLimitKey] = now + (15 * 60 * 1000); // ১৫ মিনিট লক

    await update(userRef, updates);
    alert(`Task ${taskNum} Completed! Tk.10 Added.`);
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
    catch { try { await createUserWithEmailAndPassword(auth, e, p); } catch (err) { alert(err.message); } }
});

// কপি রেফারাল লিংক ফাংশন
window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Refer Link Copied!");
};
