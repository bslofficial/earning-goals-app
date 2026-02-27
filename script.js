const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');
const overlay = document.getElementById('videoOverlay');
const secondsSpan = document.getElementById('seconds');

let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);

// Ads Logic
function startVideoTask(num) {
    AdController.show().then(() => {
        showTimer(num);
    }).catch(() => {
        alert("Ad failed. Please try again.");
    });
}

function showTimer(num) {
    overlay.style.display = "flex";
    let timeLeft = 15;
    secondsSpan.innerText = timeLeft;
    const countdown = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            overlay.style.display = "none";
            updateBalance(0.50);
            markDone(num);
        }
    }, 1000);
}

function updateBalance(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}

function markDone(num) {
    const card = document.getElementById(`task-${num}`);
    if(card) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
        card.querySelector('p').innerText = "Completed ✅";
    }
}

// Withdraw Logic
function openWithdraw() { document.getElementById('withdrawModal').style.display = "block"; }
function closeWithdraw() { document.getElementById('withdrawModal').style.display = "none"; }

function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = document.getElementById('withdrawAmount').value;

    if (amount < 10) {
        alert("Minimum withdraw is $10.00");
        return;
    }
    if (amount > currentBalance) {
        alert("Insufficient balance!");
        return;
    }

    // Your WhatsApp Number: 01917044596
    const myWA = "8801917044596"; 
    const text = `New Withdraw Request!%0AMethod: ${method}%0ANumber: ${account}%0AAmount: $${amount}`;
    window.open(`https://wa.me/${myWA}?text=${text}`, '_blank');
    
    closeWithdraw();
}
