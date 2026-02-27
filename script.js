// Adsgram Initialization with your ID
const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');

// Load balance from LocalStorage
let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);

function showAd(taskNumber) {
    console.log(`Loading Ad for Task ${taskNumber}...`);

    AdController.show().then((result) => {
        // Success: Ad watched fully
        addReward(0.50); // প্রতি টাস্কে ০.৫০ রিওয়ার্ড
        markTaskComplete(taskNumber);
        alert(`Success! Task ${taskNumber} completed. 0.50 added to wallet.`);
    }).catch((result) => {
        // Error or Skip
        alert("You must watch the full video to get the reward.");
        console.error("Adsgram error:", result);
    });
}

function addReward(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}

function markTaskComplete(num) {
    const cards = document.querySelectorAll('.task-card');
    const targetCard = cards[num - 1];
    
    targetCard.style.background = "#064e3b";
    targetCard.style.borderColor = "#10b981";
    targetCard.innerHTML = `<h3>Task ${num}</h3><p style="color:#10b981"><i class="fas fa-check-circle"></i> Done</p>`;
    targetCard.onclick = null; // Disable clicking again
}
