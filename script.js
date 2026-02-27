// CONFIGURATION
const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596"; 

// Initialize Unity Ads
if (typeof unityads !== 'undefined') {
    unityads.initialize(unityGameId, false); // false = Live Mode
} else {
    console.error("Unity SDK not loaded");
}

// Balance Display
let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
document.getElementById('balance').innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    // Unity Ads চেক করা হচ্ছে
    if (typeof unityads !== 'undefined' && unityads.isReady(unityPlacement)) {
        unityads.show(unityPlacement);
        showTimer(num);
    } else {
        alert("Unity Video is loading... Please wait 5-10 seconds and try again.");
        // এখানে আপনি চাইলে Adsterra Direct Link ওপেন করতে পারেন
    }
}

function showTimer(num) {
    const overlay = document.getElementById('videoOverlay');
    const secondsSpan = document.getElementById('seconds');
    overlay.style.display = "flex";
    let timeLeft = 20; // ইউনিটি অ্যাডের জন্য ২০ সেকেন্ড ভালো
    secondsSpan.innerText = timeLeft;

    const countdown = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            overlay.style.display = "none";
            updateBalance(0.70); // ইউনিটি বেশি টাকা দেয়, তাই রিওয়ার্ড বাড়িয়ে দিলাম
            markDone(num);
        }
    }, 1000);
}

function updateBalance(amount) {
    currentBalance += amount;
    document.getElementById('balance').innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}

function markDone(num) {
    const card = document.getElementById(`task-${num}`);
    if(card) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
        card.querySelector('p').innerText = "Earned ✅";
    }
}

// Withdraw Logic
function openWithdraw() { document.getElementById('withdrawModal').style.display = "block"; }
function closeWithdraw() { document.getElementById('withdrawModal').style.display = "none"; }
function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = document.getElementById('withdrawAmount').value;

    if (amount < 10) return alert("Minimum withdraw is $10.00");
    if (amount > currentBalance) return alert("Insufficient balance!");

    const text = `New Withdraw Request!%0AMethod: ${method}%0ANumber: ${account}%0AAmount: $${amount}`;
    window.open(`https://wa.me/${myWA}?text=${text}`, '_blank');
    closeWithdraw();
}
