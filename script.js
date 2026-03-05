import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInAnonymously } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDuLLapNwRk2Fl5rN6F0ezZb9KsMBKhvqA",
    authDomain: "earning-goals-app.firebaseapp.com",
    databaseURL: "https://earning-goals-app-default-rtdb.firebaseio.com",
    projectId: "earning-goals-app",
    appId: "1:999611133128:web:f8bd2cb60ac5a07b1249fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

signInAnonymously(auth);

onAuthStateChanged(auth, (user) => {
    if (user) {
        const userRef = ref(db, 'users/' + user.uid);
        onValue(userRef, (snap) => {
            const data = snap.val() || { balance: 0 };
            document.getElementById('balance').innerText = (parseFloat(data.balance) || 0).toFixed(2);
            document.getElementById('loading-screen').style.display = 'none';
            document.getElementById('main-app').style.display = 'block';
        });
    }
});

window.toggleSidebar = () => {
    const menu = document.getElementById('side-menu');
    menu.style.left = menu.style.left === '0px' ? '-100%' : '0px';
};

window.claimDailyBonus = async () => {
    const user = auth.currentUser;
    window.open("https://glamourpicklessteward.com/mur0zqw1i?key=1357f8fdd3f1c4497af9b8581d8ad6cb", "_blank");
    const userRef = ref(db, 'users/' + user.uid);
    const snap = await get(userRef);
    const currentBal = snap.val() ? snap.val().balance : 0;
    await update(userRef, { balance: currentBal + 5.00 });
    alert("Tk. 5.00 Added!");
};

window.startTask = (id) => { location.href = `income.html?id=${id}`; };
