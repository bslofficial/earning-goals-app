// Adsgram Unit ID 23742 ব্যবহার করে
const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');
const overlay = document.getElementById('videoOverlay');
const secondsSpan = document.getElementById('seconds');

let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    // ফুল স্ক্রিন ভিডিও ওভারলে চালু
    overlay.style.display = "flex";
    let timeLeft = 15; // ১৫ সেকেন্ড কাউন্টার
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
        // বিজ্ঞাপন দেখা শেষ হলে
        overlay.style.display = "none";
        updateBalance(0.50);
        markTaskComplete(num);
    }).catch((error) => {
        // বিজ্ঞাপন ফেইল বা স্কিপ করলে
        overlay.style.display = "none";
        alert("Ad failed or skipped. Watch full video to earn!");
    });
}

function updateBalance(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}

function markTaskComplete(num) {
    const card = document.getElementById(`task-${num}`);
    card.style.opacity = "0.5";
    card.style.pointerEvents = "none";
    card.querySelector('p').innerHTML = "Completed ✅";
}
