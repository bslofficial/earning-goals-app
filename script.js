// Adsgram Initialization
const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');
const overlay = document.getElementById('videoOverlay');
const secondsSpan = document.getElementById('seconds');

// Load Balance
let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);

function startVideoTask(num) {
    console.log("Starting Ad for Task " + num);
    
    // বিজ্ঞাপন দেখানো শুরু
    AdController.show().then((result) => {
        // বিজ্ঞাপন সফলভাবে শুরু হলে কাউন্টার ওভারলে দেখাবে
        handleSuccess(num);
    }).catch((error) => {
        alert("Ad failed or skipped. Watch fully to earn.");
    });
}

function handleSuccess(num) {
    overlay.style.display = "flex";
    let timeLeft = 15; // Adsgram ভিডিওর গড় সময়
    secondsSpan.innerText = timeLeft;

    const countdown = setInterval(() => {
        timeLeft--;
        secondsSpan.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            overlay.style.display = "none";
            
            // রিওয়ার্ড আপডেট
            updateBalance(0.50);
            markTaskComplete(num);
            alert("Success! Task " + num + " Completed.");
        }
    }, 1000);
}

function updateBalance(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}

function markTaskComplete(num) {
    const card = document.getElementById(`task-${num}`);
    if (card) {
        card.style.opacity = "0.5";
        card.style.pointerEvents = "none";
        card.querySelector('p').innerHTML = "Completed ✅";
    }
}
