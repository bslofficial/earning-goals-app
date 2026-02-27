const AdController = window.Adsgram.init({ blockId: "23742" });
const balanceDisplay = document.getElementById('balance');
const userRankBalance = document.getElementById('user-rank-balance');

let currentBalance = parseFloat(localStorage.getItem('userBalance')) || 0;
balanceDisplay.innerText = currentBalance.toFixed(2);
if(userRankBalance) userRankBalance.innerText = currentBalance.toFixed(2);

function showAd(num) {
    AdController.show().then((result) => {
        updateBalance(0.50);
        markDone(num);
    }).catch(() => {
        alert("Watch full video to earn!");
    });
}

function updateBalance(amount) {
    currentBalance += amount;
    balanceDisplay.innerText = currentBalance.toFixed(2);
    if(userRankBalance) userRankBalance.innerText = currentBalance.toFixed(2);
    localStorage.setItem('userBalance', currentBalance);
}

function markDone(num) {
    const card = document.getElementById(`task-${num}`);
    card.style.opacity = "0.5";
    card.onclick = null;
    card.querySelector('p').innerText = "Completed ✅";
}
