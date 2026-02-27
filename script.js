const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');
const overlay = document.getElementById('videoOverlay');
const secondsSpan = document.getElementById('seconds');

let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    overlay.style.display = "flex";
    let timeLeft = 15;
    secondsSpan.innerText = timeLeft;

    const countdown = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            showActualAd(num);
        }
    }, 1000);
}

function showActualAd(num) {
    AdController.show().then((result) => {
        overlay.style.display = "none";
        updateBalance(0.50);
        alert("Success! Reward added.");
    }).catch((error) => {
        overlay.style.display = "none";
        alert("Ad failed. Please try again.");
    });
}

function updateBalance(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}
