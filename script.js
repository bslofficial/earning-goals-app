const unityGameId = "6055095"; 
const unityPlacement = "Rewarded_Android";
const myWA = "8801917044596"; 
const directLink = "Https://www.effectivegatecpm.com/uy4hgpbq7?key=4367993c6e478e8144fda5a6e5969fbb";

if (typeof unityads !== 'undefined') { unityads.initialize(unityGameId, false); }

let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
document.getElementById('balance').innerText = currentBalance.toFixed(2);

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
            updateBalance(10.00); // প্রতি ভিডিও ১০ টাকা
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
    if(card) { card.style.opacity = "0.3"; card.style.pointerEvents = "none"; card.querySelector('p').innerText = "Done ✅"; }
}

function openWithdraw() { document.getElementById('withdrawModal').style.display = "block"; }
function closeWithdraw() { document.getElementById('withdrawModal').style.display = "none"; }

function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = parseFloat(document.getElementById('withdrawAmount').value);

    if (isNaN(amount) || amount < 500) { alert("মিনিমাম ৫০০ টাকা হতে হবে!"); return; }
    if (amount > currentBalance) { alert("পর্যাপ্ত ব্যালেন্স নেই!"); return; }
    if (account.length < 11) { alert("সঠিক নম্বর দিন!"); return; }

    currentBalance -= amount; // অটোমেটিক টাকা কেটে নেওয়া
    localStorage.setItem('userBalance', currentBalance.toFixed(2));
    document.getElementById('balance').innerText = currentBalance.toFixed(2);

    const msg = `*NEW WITHDRAW*%0AMethod: ${method}%0ANumber: ${account}%0AAmount: ৳${amount}%0ABalance: ৳${currentBalance.toFixed(2)}`;
    window.open(`https://wa.me/${myWA}?text=${msg}`, '_blank');
    closeWithdraw();
    alert("রিকোয়েস্ট পাঠানো হয়েছে এবং ৳" + amount + " কেটে নেওয়া হয়েছে।");
}
