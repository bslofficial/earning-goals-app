const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596";

// Auth Logic
function handleLogin() {
    const email = document.getElementById('email').value;
    if (email.includes("@")) {
        localStorage.setItem('userEmail', email);
        showApp();
    } else { alert("Enter a valid email!"); }
}

function showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('display-email').innerText = localStorage.getItem('userEmail').split('@')[0];
    checkLimit();
}

// Balance & Task Logic
let balance = parseFloat(localStorage.getItem('userBalance')) || 0;
document.getElementById('balance').innerText = balance.toFixed(2);

function startVideoTask(num) {
    if (localStorage.getItem('taskLimitActive') === 'true') {
        alert("২৪ ঘণ্টার লিমিট চলছে! পরে চেষ্টা করুন।");
        return;
    }
    
    // ভিডিও দেখানোর লজিক (Unity/Direct Link)
    showAdTimer(num);
}

function showAdTimer(num) {
    const overlay = document.getElementById('videoOverlay');
    overlay.style.display = "flex";
    let timeLeft = 20;
    const interval = setInterval(() => {
        timeLeft--;
        document.getElementById('seconds').innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            overlay.style.display = "none";
            completeTask(num);
        }
    }, 1000);
}

function completeTask(num) {
    balance += 5.00; // প্রতি টাস্কে ৫ টাকা
    localStorage.setItem('userBalance', balance);
    document.getElementById('balance').innerText = balance.toFixed(2);
    
    const card = document.getElementById(`task-${num}`);
    card.style.opacity = "0.3";
    card.style.pointerEvents = "none";
    
    // চেক করুন সব টাস্ক শেষ কি না
    checkAllTasksDone();
}

function checkAllTasksDone() {
    const doneTasks = localStorage.getItem('doneCount') || 0;
    const newCount = parseInt(doneTasks) + 1;
    localStorage.setItem('doneCount', newCount);

    if (newCount >= 4) {
        const expireTime = new Date().getTime() + (24 * 60 * 60 * 1000);
        localStorage.setItem('limitExpiry', expireTime);
        localStorage.setItem('taskLimitActive', 'true');
        checkLimit();
    }
}

function checkLimit() {
    const expiry = localStorage.getItem('limitExpiry');
    const now = new Date().getTime();

    if (expiry && now < expiry) {
        document.getElementById('cooldown-timer').style.display = 'block';
        updateTimer(expiry);
    } else {
        localStorage.setItem('taskLimitActive', 'false');
        localStorage.setItem('doneCount', 0);
        document.getElementById('cooldown-timer').style.display = 'none';
    }
}

function updateTimer(expiry) {
    const timerInt = setInterval(() => {
        const now = new Date().getTime();
        const diff = expiry - now;
        if (diff <= 0) { clearInterval(timerInt); checkLimit(); return; }
        
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        document.getElementById('timer-display').innerText = `${h}:${m}:${s}`;
    }, 1000);
}

// Withdraw & UI Helpers
function openWithdraw() { document.getElementById('withdrawModal').style.display = 'flex'; }
function closeWithdraw() { document.getElementById('withdrawModal').style.display = 'none'; }

if (localStorage.getItem('userEmail')) showApp();
