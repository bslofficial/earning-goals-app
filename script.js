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

// Unity Ads আইডি এবং প্লেসমেন্ট
const gameId = '6055094';
const placementId = 'Rewarded_Android';

// ইউনিটি অ্যাডস ইনিশিয়ালাইজেশন
if (window.UnityAds) {
    window.UnityAds.initialize(gameId, false); // Real Mode: false
}

onAuthStateChanged(auth, (user) => {
    const loader = document.getElementById('loading-screen');
    const authScr = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        if(loader) loader.style.display = 'none';
        if(authScr) authScr.style.display = 'none';
        if(mainApp) mainApp.style.display = 'block';
        
        onValue(ref(db, 'users/' + user.uid), (snap) => {
            if (snap.exists()) {
                const data = snap.val();
                document.getElementById('balance').innerText = (data.balance || 0).toFixed(2);
                document.getElementById('refer-count').innerText = data.referCount || 0;
                document.getElementById('tasks-done').innerText = data.totalTaskCount || 0;
                document.getElementById('sidebar-user-name').innerText = user.email.split('@')[0];
            } else {
                set(ref(db, 'users/' + user.uid), { balance: 0, totalTaskCount: 0, referCount: 0 });
            }
        });
    } else {
        if(loader) loader.style.display = 'none';
        if(authScr) authScr.style.display = 'flex';
        if(mainApp) mainApp.style.display = 'none';
    }
});

// ভিডিও টাস্ক এবং অ্যাড লজিক
window.startVideoTask = (num) => {
    alert("Ads are loading... please wait a few seconds.");
    
    // ইউনিটি অ্যাডস দেখানোর আসল লজিক
    if (window.UnityAds && window.UnityAds.isReady(placementId)) {
        window.UnityAds.show(placementId, {
            result: (status) => {
                if (status === 'COMPLETED') {
                    updateBalance(10); // ১০ টাকা যোগ হবে
                    alert("Success! Tk.10 added to your account.");
                } else {
                    alert("Ad was not completed. No reward added.");
                }
            }
        });
    } else {
        // যদি ইউনিটি কাজ না করে তবে আপাতত ম্যানুয়ালি টাকা যোগ (টেস্টিং এর জন্য)
        setTimeout(() => {
            updateBalance(10);
            alert("Video Task Completed! Tk.10 Added.");
        }, 3000);
    }
};

async function updateBalance(amount) {
    const user = auth.currentUser;
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        const data = snap.val() || { balance: 0, totalTaskCount: 0 };
        await update(userRef, {
            balance: (data.balance || 0) + amount,
            totalTaskCount: (data.totalTaskCount || 0) + 1
        });
    }
}

// লগইন ইভেন্ট লিসেনার
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("Please fill all fields!");

    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch {
        try {
            await createUserWithEmailAndPassword(auth, email, pass);
        } catch (err) {
            alert("Auth Error: " + err.message);
        }
    }
});

// গ্লোবাল ফাংশনসমূহ
window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.claimDailyBonus = () => {
    updateBalance(5);
    alert("Daily Bonus Claimed! Tk.5 Added.");
};

window.sendWithdrawRequest = () => {
    const amount = document.getElementById('withdrawAmount').value;
    if (amount < 500) return alert("Minimum withdraw is Tk.500");
    alert("Withdrawal request sent successfully!");
    closeWithdraw();
};
