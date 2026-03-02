// ১. এখানে ছোট হাতের 'import' ব্যবহার করা হয়েছে (Fix)
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
window.toggleMenu = () => {
    const menu = document.getElementById('side-menu');
    if(menu) menu.classList.toggle('active');
};

let userRef;
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, referCount: 0, totalTaskCount: 0 };

onAuthStateChanged(auth, async (user) => {
    const loadingScreen = document.getElementById('loading-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                updateUI();
            } else {
                createNewUser(user.uid);
            }
        });

        const nameEl = document.getElementById('display-name');
        if(nameEl) nameEl.innerText = user.email.split('@')[0];
        
        const referUrlEl = document.getElementById('refer-url');
        if(referUrlEl) referUrlEl.value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        
        startTimers();
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(authScreen) authScreen.style.display = 'none';
        if(mainApp) mainApp.style.display = 'block';
    } else {
        if(loadingScreen) loadingScreen.style.display = 'none';
        if(authScreen) authScreen.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
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
    const balanceEl = document.getElementById('balance');
    if(balanceEl) balanceEl.innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
    
    const refCountEl = document.getElementById('refer-count');
    const taskDoneEl = document.getElementById('tasks-done');
    
    if(refCountEl) refCountEl.innerText = currentData.referCount || 0;
    if(taskDoneEl) taskDoneEl.innerText = currentData.totalTaskCount || 0;
}

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        
        const limitBox = document.getElementById('limit-box');
        const timerDisp = document.getElementById('timer-display');
        if (limitBox && timerDisp) {
            if (currentData.lastLimit && now < currentData.lastLimit) {
                limitBox.style.display = 'block';
                timerDisp.innerText = formatTime(currentData.lastLimit - now);
            } else {
                limitBox.style.display = 'none';
            }
        }

        const bBtn = document.getElementById('bonus-btn');
        if (bBtn) {
            const bTxt = bBtn.querySelector('span') || bBtn;
            if (currentData.lastBonus && now < currentData.lastBonus) {
                bBtn.disabled = true;
                bBtn.style.opacity = "0.6";
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

window.startVideoTask = async (taskNum) => {
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
        alert("Ads are loading... please try again in a few seconds.");
    }
};

window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    if(copyText) {
        copyText.select();
        navigator.clipboard.writeText(copyText.value);
        alert("Link Copied!");
    }
};

window.sendWithdrawRequest = async () => {
    const amountInput = document.getElementById('withdrawAmount');
    if(!amountInput) return;
    const amount = parseFloat(amountInput.value);
    
    if (amount < 500 || isNaN(amount)) return alert("Minimum withdrawal Tk.500");
    if (currentData.balance < amount) return alert("Insufficient Balance");
    
    await update(userRef, { balance: currentData.balance - amount });
    alert("Withdrawal request sent!");
    window.closeWithdraw();
};

window.openWithdraw = () => {
    const modal = document.getElementById('withdrawModal');
    if(modal) modal.style.display = 'flex';
};
window.closeWithdraw = () => {
    const modal = document.getElementById('withdrawModal');
    if(modal) modal.style.display = 'none';
};
window.handleLogout = () => signOut(auth).then(() => location.reload());

// লগইন বাটনের ইভেন্ট লিসেনার ফিক্স
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    if(loginBtn) {
        loginBtn.addEventListener('click', async () => {
            const e = document.getElementById('email').value.trim();
            const p = document.getElementById('password').value.trim();
            if(!e || !p) return alert("Fill all fields");
            
            try { 
                await signInWithEmailAndPassword(auth, e, p); 
            } catch (err) { 
                try { 
                    await createUserWithEmailAndPassword(auth, e, p); 
                } catch (createErr) { 
                    alert("Error: " + createErr.message); 
                } 
            }
        });
    }
});
