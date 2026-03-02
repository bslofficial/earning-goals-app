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

// Unity Ads Config
const gameId = '6055094';
const placementId = 'Rewarded_Android';
const testMode = true; 

if (window.unityAds) {
    window.unityAds.initialize(gameId, testMode);
}

// Sidebar logic
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

onAuthStateChanged(auth, async (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        
        // Real-time data sync using onValue (বেশি ফাস্ট কাজ করবে)
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                updateUI();
            } else {
                createNewUser(user.uid);
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

async function createNewUser(uid) {
    const urlParams = new URLSearchParams(window.location.search);
    const referrerId = urlParams.get('ref');
    
    if (referrerId && referrerId !== uid) {
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
    await set(ref(db, 'users/' + uid), currentData);
}

function updateUI() {
    // Balance এবং অন্যান্য ডাটা আপডেট
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    
    // মিনিমাল ডিজাইনের আইডি অনুযায়ী ডাটা বসানো
    const refCountEl = document.getElementById('refer-count');
    const taskDoneEl = document.getElementById('tasks-done');
    
    if(refCountEl) refCountEl.innerText = currentData.referCount || 0;
    if(taskDoneEl) taskDoneEl.innerText = currentData.totalTaskCount || 0;
}

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        
        // টাস্ক লিমিট টাইমার
        const limitBox = document.getElementById('limit-box');
        if (limitBox) {
            if (currentData.lastLimit && now < currentData.lastLimit) {
                limitBox.style.display = 'block';
                document.getElementById('timer-display').innerText = formatTime(currentData.lastLimit - now);
            } else {
                limitBox.style.display = 'none';
            }
        }

        // বোনাস বাটন টাইমার
        const bBtn = document.getElementById('bonus-btn');
        if (bBtn) {
            const bTxt = bBtn.querySelector('span') || bBtn; // বোনাস টেক্সট খোঁজা
            if (currentData.lastBonus && now < currentData.lastBonus) {
                bBtn.disabled = true;
                bBtn.style.opacity = "0.5";
                bTxt.innerText = formatTime(currentData.lastBonus - now);
            } else {
                bBtn.disabled = false;
                bBtn.style.opacity = "1";
                bTxt.innerText = "Daily Bonus";
            }
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
    
    window.open("https://www.google.com", '_blank');
    await update(userRef, {
        balance: (parseFloat(currentData.balance) || 0) + 10,
        lastBonus: now + (3 * 60 * 60 * 1000)
    });
    alert("Tk.10 Bonus Claimed!");
};

window.startVideoTask = async () => {
    if (currentData.lastLimit && new Date().getTime() < currentData.lastLimit) {
        return alert("Please wait for cooldown!");
    }

    if (window.unityAds && window.unityAds.isReady(placementId)) {
        window.unityAds.show(placementId, {
            result: async (status) => {
                if (status === 'COMPLETED') {
                    let updates = {
                        balance: (currentData.balance || 0) + 10,
                        doneToday: (currentData.doneToday || 0) + 1,
                        totalTaskCount: (currentData.totalTaskCount || 0) + 1
                    };

                    if (updates.doneToday >= 4) {
                        updates.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); 
                        updates.doneToday = 0;
                    }
                    
                    await update(userRef, updates);
                    alert("Task Completed! Tk.10 Added.");
                } else {
                    alert("Ad not finished!");
                }
            }
        });
    } else {
        alert("Ads are loading... check internet or wait a moment.");
    }
};

window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999); 
    navigator.clipboard.writeText(copyText.value);
    alert("Link Copied!");
};

window.sendWithdrawRequest = async () => {
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    if (amount < 500 || isNaN(amount)) return alert("Min Tk.500");
    if (currentData.balance < amount) return alert("Insufficient Balance");
    
    await update(userRef, { balance: currentData.balance - amount });
    alert("Withdrawal Request Sent Successfully!");
    closeWithdraw();
};

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.handleLogout = () => signOut(auth).then(() => location.reload());

// Auth Event Listener
document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('password').value.trim();
    if(!e || !p) return alert("Please fill all fields");
    
    try { 
        await signInWithEmailAndPassword(auth, e, p); 
    } catch { 
        try { 
            await createUserWithEmailAndPassword(auth, e, p); 
        } catch (err) { 
            alert("Error: " + err.message); 
        } 
    }
});

// Close Sidebar on outside click
document.addEventListener('click', (e) => {
    const menu = document.getElementById('side-menu');
    const trigger = document.querySelector('.menu-trigger');
    if (menu && menu.classList.contains('active') && !menu.contains(e.target) && trigger && !trigger.contains(e.target)) {
        menu.classList.remove('active');
    }
});
