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

// সরাসরি রিওয়ার্ড দেওয়ার লজিক (অ্যাড ছাড়াই)
window.startVideoTask = (num) => {
    alert("Task " + num + " Processing...");
    
    // কোনো অ্যাড লোড হওয়ার অপেক্ষা নেই, সরাসরি টাকা যোগ হবে
    setTimeout(() => {
        handleReward(10);
        alert("Success! Tk.10 added to your account.");
    }, 1000); 
};

async function handleReward(amount) {
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

// অন্যান্য ফাংশনসমূহ
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { alert("Error: " + err.message); }
    }
});

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';
window.claimDailyBonus = () => { handleReward(5); alert("Daily Bonus Claimed! Tk.5 Added."); };
