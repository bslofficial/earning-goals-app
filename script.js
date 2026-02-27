// CONFIGURATION
const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596"; 
// আপনার Adsterra Direct Link
const directLink = "Https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";

// Initialize Unity Ads
if (typeof unityads !== 'undefined') {
    unityads.initialize(unityGameId, false);
}

// Balance Display
let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
document.getElementById('balance').innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    // ১. প্রথমে Unity Ads ট্রাই করো
    if (typeof unityads !== 'undefined' && unityads.isReady(unityPlacement)) {
        unityads.show(unityPlacement);
        showTimer(num);
    } 
    // ২. ইউনিটি রেডি না থাকলে Adsterra Direct Link ওপেন হবে
    else {
        alert("Loading High Reward Task...");
        window.open(directLink, '_blank'); // নতুন ট্যাবে অ্যাড ওপেন হবে
        
        // অ্যাড ওপেন করার পর ইউজারকে রিওয়ার্ড দেওয়ার জন্য টাইমার শুরু
        setTimeout(() => {
            showTimer(num);
        }, 2000); 
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
            updateBalance(0.70); // Reward
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
