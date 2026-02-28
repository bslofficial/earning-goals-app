import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
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
let currentData = { balance: 0, lastLimit: 0, doneToday: 0, lastBonus: 0, profilePic: "" };

onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'block';
        document.getElementById('display-name').innerText = user.email.split('@')[0];

        // রেফারেল লিংক জেনারেশন
        const siteURL = window.location.origin + window.location.pathname;
        const myReferLink = `${siteURL}?ref=${user.uid}`;
        document.getElementById('refer-url').value = myReferLink;

        userRef = ref(db, 'users/' + user.uid);
        const snap = await get(userRef);
        if (snap.exists()) {
            currentData = snap.val();
            if(currentData.profilePic) document.getElementById('profile-img').src = currentData.profilePic;
        } else {
            await set(userRef, currentData);
        }
        updateUI();
        startTimers();
    }
});

function updateUI() {
    document.getElementById('balance').innerText = (parseFloat(currentData.balance) || 0).toFixed(2);
}

// ২৪ ঘণ্টা টাইমার লজিক (টাস্ক ও বোনাস উভয়ের জন্য)
function startTimers() {
    setInterval(() => {
        const now = new Date().getTime();

        // টাস্ক লিমিট টাইমার (২৪ ঘণ্টা)
        if (currentData.lastLimit && now < currentData.lastLimit) {
            document.getElementById('limit-box').style.display = 'block';
            const diffL = currentData.lastLimit - now;
            document.getElementById('timer-display').innerText = formatTime(diffL);
        } else {
            document.getElementById('limit-box').style.display = 'none';
        }

        // বোনাস টাইমার (২৪ ঘণ্টা)
        if (currentData.lastBonus && now < currentData.lastBonus) {
            const diffB = currentData.lastBonus - now;
            document.getElementById('bonus-btn').disabled = true;
            document.getElementById('bonus-btn').style.opacity = "0.6";
            document.getElementById('bonus-text').innerText = formatTime(diffB);
        } else {
            document.getElementById('bonus-btn').disabled = false;
            document.getElementById('bonus-btn').style.opacity = "1";
            document.getElementById('bonus-text').innerText = "Daily Bonus";
        }
    }, 1000);
}

function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
}

window.copyReferLink = () => {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
    alert("Refer Link Copied!");
};

window.claimDailyBonus = async () => {
    window.open("https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb", '_blank');
    currentData.balance = (currentData.balance || 0) + 20;
    currentData.lastBonus = new Date().getTime() + (24 * 60 * 60 * 1000); 
    await update(userRef, currentData);
    updateUI();
    alert("৳২০ বোনাস যোগ হয়েছে!");
};

window.startVideoTask = async () => {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return;

    window.open("https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb", '_blank');
    document.getElementById('videoOverlay').style.display = 'flex';
    
    let count = 20;
    const t = setInterval(() => {
        count--;
        document.getElementById('seconds').innerText = count;
        if(count <= 0) clearInterval(t);
    }, 1000);

    setTimeout(async () => {
        document.getElementById('videoOverlay').style.display = 'none';
        currentData.balance = (currentData.balance || 0) + 10;
        currentData.doneToday = (currentData.doneToday || 0) + 1;
        
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); // ২৪ ঘণ্টা লিমিট
            currentData.doneToday = 0;
        }
        
        await update(userRef, currentData);
        updateUI();
        alert("৳১০ যোগ হয়েছে!");
        location.reload();
    }, 20000);
};

// প্রোফাইল পিকচার আপলোড
document.getElementById('profileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            document.getElementById('profile-img').src = base64;
            await update(userRef, { profilePic: base64 });
        };
        reader.readAsDataURL(file);
    }
});

// লগইন / সাইন আপ
document.getElementById('login-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('password').value.trim();
    if(!email || !pass) return alert("Please fill all fields!");
    try {
        await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
        try { await createUserWithEmailAndPassword(auth, email, pass); } 
        catch (err) { alert(err.message); }
    }
});

window.openWithdraw = () => document.getElementById('withdrawModal').style.display = 'flex';
window.closeWithdraw = () => document.getElementById('withdrawModal').style.display = 'none';

window.sendWithdrawRequest = async () => {
    const amt = parseFloat(document.getElementById('withdrawAmount').value);
    if (amt < 500 || amt > currentData.balance) return alert("Invalid Amount!");
    currentData.balance -= amt;
    await update(userRef, { balance: currentData.balance });
    updateUI();
    window.open(`https://wa.me/8801917044596?text=Withdraw:৳${amt}`);
    window.closeWithdraw();
};

window.handleLogout = () => signOut(auth).then(() => location.reload());
