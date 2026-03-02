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

const adsterraLink = "https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb";

let userRef;
let currentData = { balance: 0 };

onAuthStateChanged(auth, async (user) => {
    const loader = document.getElementById('loading-screen');
    const authScr = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');

    if (user) {
        userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            if (snap.exists()) {
                currentData = snap.val();
                document.getElementById('balance').innerText = (currentData.balance || 0).toFixed(2);
            } else {
                set(userRef, { balance: 0 });
            }
        });
        document.getElementById('display-name').innerText = user.email.split('@')[0];
        document.getElementById('refer-url').value = `${window.location.origin}${window.location.pathname}?ref=${user.uid}`;
        loader.style.display = 'none';
        authScr.style.display = 'none';
        mainApp.style.display = 'block';
        startTimers();
    } else {
        loader.style.display = 'none';
        authScr.style.display = 'flex';
        mainApp.style.display = 'none';
    }
});

// লগইন লজিক যেখানে ইমেইল এবং পাসওয়ার্ড এরর আলাদা করা হয়েছে
document.getElementById('login-btn').addEventListener('click', async () => {
    const e = document.getElementById('email').value.trim();
    const p = document.getElementById('password').value.trim();

    if(!e || !p) return alert("দয়া করে ইমেইল এবং পাসওয়ার্ড দিন!");

    try {
        await signInWithEmailAndPassword(auth, e, p);
    } catch (err) {
        console.log("Error Code:", err.code);
        
        // এখানে আপনার চাওয়া অনুযায়ী এরর হ্যান্ডলিং
        if (err.code === 'auth/invalid-email' || err.code === 'auth/user-not-found') {
            alert("আপনার ইমেইলটি ভুল! সঠিক ইমেইল দিন।");
        } 
        else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
            // নতুন ফায়ারবেস ভার্সনে ইমেইল বা পাসওয়ার্ড যেকোনোটি ভুল হলে invalid-credential দেখায়
            alert("আপনার পাসওয়ার্ডটি ভুল! সঠিক পাসওয়ার্ড দিন।");
        } 
        else if (err.code === 'auth/user-disabled') {
            alert("আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে!");
        }
        else {
            // যদি ইউজার একদম নতুন হয়, তবে সাইন আপ করার সুযোগ দিবে
            if(confirm("অ্যাকাউন্ট নেই! নতুন অ্যাকাউন্ট খুলবেন?")){
                try {
                    await createUserWithEmailAndPassword(auth, e, p);
                } catch (sErr) {
                    alert("সাইনআপ ব্যর্থ: " + sErr.message);
                }
            }
        }
    }
});

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');
window.handleLogout = () => signOut(auth).then(() => location.reload());
window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("Refer Link Copied!");
};

window.startVideoTask = async (num) => {
    const now = new Date().getTime();
    if (currentData[`task_${num}_limit`] > now) return alert("অপেক্ষা করুন!");
    
    window.open(adsterraLink, '_blank');
    const updates = {};
    updates['balance'] = (currentData.balance || 0) + 10;
    updates[`task_${num}_limit`] = now + (15 * 60 * 1000);
    await update(userRef, updates);
};

function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();
        for (let i = 1; i <= 4; i++) {
            const limit = currentData[`task_${i}_limit`] || 0;
            const card = document.getElementById(`card-${i}`);
            const txt = document.getElementById(`timer-${i}`);
            if (limit > now) {
                card.classList.add('task-disabled');
                let diff = limit - now;
                let m = Math.floor(diff / 60000);
                let s = Math.floor((diff % 60000) / 1000);
                txt.innerText = `${m}m ${s}s`;
            } else {
                card.classList.remove('task-disabled');
                txt.innerText = "Tk.10.00";
            }
        }
    }, 1000);
}
