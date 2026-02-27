const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');
const overlay = document.getElementById('videoOverlay');
const secondsSpan = document.getElementById('seconds');

let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    // ১. ভিডিও ওভারলে দেখানো (Full Screen vibe)
    overlay.style.display = "flex";
    let timeLeft = 15; // ১৫ সেকেন্ডের কাউন্টার
    secondsSpan.innerText = timeLeft;

    const countdown = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            loadAdsgram(num);
        }
    }, 1000);
}

function loadAdsgram(num) {
    AdController.show().then((result) => {
        overlay.style.display = "none";
        updateBalance(0.50);
        alert(`Task ${num} Success! $0.50 added.`);
    }).catch(() => {
        overlay.style.display = "none";
        alert("You must watch the full video.");
    });
}

function updateBalance(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}
