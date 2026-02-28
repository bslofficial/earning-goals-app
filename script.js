const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596"; 
const directLink = "Https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";

// Initialize Data
let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
let userId = localStorage.getItem('userId') || "U" + Math.floor(1000 + Math.random() * 9000);
localStorage.setItem('userId', userId);

document.getElementById('balance').innerText = currentBalance.toFixed(2);
document.getElementById('user-id-display').innerText = "ID: " + userId;
document.getElementById('my-refer-code').innerText = userId;

if (typeof unityads !== 'undefined') { unityads.initialize(unityGameId, false); }

// Daily Bonus Feature
function claimDailyBonus() {
    let lastBonusDate = localStorage.getItem('lastBonusDate');
    let today = new Date().toDateString();

    if (lastBonusDate === today) {
        alert("Oops! You already claimed today's bonus. Come back tomorrow!");
    } else {
        updateBalance(20.00); // ৳২০ বোনাস
        localStorage.setItem('lastBonusDate', today);
        alert("Congratulations! ৳20 Daily Bonus added to your wallet.");
    }
}

// Referral Feature
function openRefer() { document.getElementById('referModal').style.display = "block"; }
function closeRefer() { document.getElementById('referModal').style.display = "none"; }
function copyRefer() {
    navigator.clipboard.writeText(userId);
    alert("Refer Code Copied: " + userId);
}

// Ads Logic
function startVideoTask(num) {
    if (typeof unityads !== 'undefined' && unityads.isReady(unityPlacement)) {
        unityads.show(unityPlacement);
        showTimer(num);
    } else {
        window.open(directLink, '_blank');
        setTimeout(() => showTimer(num), 2000);
    }
}

function showTimer(num) {
    const overlay = document.getElementById('videoOverlay');
    const secondsSpan = document.getElementById('seconds');
    overlay.style.display = "flex";
    let timeLeft = 20;
    secondsSpan.innerText = timeLeft;
    const countdown = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            overlay.style.display = "none";
            updateBalance(10.00);
            markDone(num);
        }
    }, 1000);
}

function updateBalance(amount) {
    currentBalance += amount;
    document.getElementById('balance').innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance.toFixed(2));
}

function markDone(num) {
    const card = document.getElementById(`task-${num}`);
    if(card) { card.style.opacity = "0.2"; card.style.pointerEvents = "none"; card.querySelector('p').innerText = "Finished ✅"; }
}

// Withdraw Logic
function openWithdraw() { document.getElementById('withdrawModal').style.display = "block"; }
function closeWithdraw() { document.getElementById('withdrawModal').style.display = "none"; }

function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    if (isNaN(amount) || amount < 500) { alert("Min withdraw ৳500!"); return; }
    if (amount > currentBalance) { alert("Insufficient Balance!"); return; }
    if (account.length < 11) { alert("Valid number required!"); return; }

    currentBalance -= amount;
    localStorage.setItem('userBalance', currentBalance.toFixed(2));
    document.getElementById('balance').innerText = currentBalance.toFixed(2);

    const msg = `*NEW WITHDRAW*%0AUser ID: ${userId}%0AMethod: ${method}%0ANumber: ${account}%0AAmount: ৳${amount}`;
    window.open(`https://wa.me/${myWA}?text=${msg}`, '_blank');
    closeWithdraw();
    alert("Request Sent! ৳" + amount + " deducted.");
}
