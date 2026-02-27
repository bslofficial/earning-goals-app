// CONFIGURATION
const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596"; 
const directLink = "Https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";

// Initialize Unity SDK
if (typeof unityads !== 'undefined') {
    unityads.initialize(unityGameId, false);
}

// Balance Storage
let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
document.getElementById('balance').innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    // ১. Unity Ads ট্রাই করো
    if (typeof unityads !== 'undefined' && unityads.isReady(unityPlacement)) {
        unityads.show(unityPlacement);
        showTimer(num);
    } 
    // ২. ব্যাকআপ হিসেবে Adsterra Direct Link (যদি ভিডিও না থাকে)
    else {
        window.open(directLink, '_blank');
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
            updateBalance(10.00); // প্রতি টাস্কে ১০ টাকা রিওয়ার্ড
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
    if(card) {
        card.style.opacity = "0.2";
        card.style.pointerEvents = "none";
        card.querySelector('p').innerText = "Earned ✅";
    }
}

// Modal Toggle
function openWithdraw() { document.getElementById('withdrawModal').style.display = "block"; }
function closeWithdraw() { document.getElementById('withdrawModal').style.display = "none"; }

// Payment Logic (Minimum 500 BDT)
function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    // ১. মিনিমাম ৫০০ টাকা চেক
    if (isNaN(amount) || amount < 500) {
        alert("দুঃখিত, মিনিমাম ৫০০ টাকা না হলে উইথড্র করতে পারবেন না।");
        return;
    }

    // ২. ব্যালেন্স চেক
    if (amount > currentBalance) {
        alert("আপনার একাউন্টে পর্যাপ্ত টাকা নেই!");
        return;
    }

    // ৩. সঠিক নম্বর চেক
    if (!account || account.length < 11) {
        alert("সঠিক বিকাশ বা নগদ নম্বরটি দিন।");
        return;
    }

    // ৪. অটোমেটিক ব্যালেন্স কেটে নেওয়া
    currentBalance -= amount;
    localStorage.setItem('userBalance', currentBalance.toFixed(2));
    document.getElementById('balance').innerText = currentBalance.toFixed(2);

    // ৫. হোয়াটসঅ্যাপ মেসেজ
    const message = `*NEW PAYMENT REQUEST*%0A------------------%0AMethod: ${method}%0ANumber: ${account}%0AAmount: ৳${amount}%0ANew Balance: ৳${currentBalance.toFixed(2)}%0A------------------%0APlease check and Pay!`;
    window.open(`https://wa.me/${myWA}?text=${message}`, '_blank');
    
    closeWithdraw();
    alert("আপনার রিকোয়েস্ট পাঠানো হয়েছে এবং ব্যালেন্স থেকে ৳" + amount + " কেটে নেওয়া হয়েছে।");
}
