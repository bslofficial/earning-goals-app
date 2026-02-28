// টাস্ক সিস্টেম (২৪ ঘণ্টা লিমিট ফিক্স)
window.startVideoTask = async () => {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) return;

    window.open("https://your-ad-link.com", '_blank');
    
    setTimeout(async () => {
        currentData.balance += 10;
        currentData.doneToday = (currentData.doneToday || 0) + 1;
        
        // ৪টি টাস্কের পর ২৪ ঘণ্টা লিমিট সেট হবে
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000); 
            currentData.doneToday = 0;
        }
        
        await update(userRef, currentData);
        updateUI();
        location.reload();
    }, 20000);
};

// টাইমার ডিসপ্লে আপডেট ফাংশন
function updateTimers() {
    const now = new Date().getTime();
    const limitBox = document.getElementById('limit-box');
    const timerDisplay = document.getElementById('timer-display');

    if (currentData.lastLimit && now < currentData.lastLimit) {
        limitBox.style.display = 'flex';
        const diff = currentData.lastLimit - now;
        timerDisplay.innerText = formatTime(diff);
    } else {
        limitBox.style.display = 'none';
    }
}
setInterval(updateTimers, 1000);
