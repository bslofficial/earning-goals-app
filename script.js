// আপনার আগের Firebase Configuration এবং Unity Ads initialization ঠিক থাকবে।
// শুধু নিচের অংশগুলো নিশ্চিত করুন:

// বোনাস টাইমার এবং টাস্ক টাইমার চেক (Design Update)
function updateAllTimers() {
    const now = new Date().getTime();
    
    // বোনাস বাটন কন্ট্রোল
    const bBtn = document.getElementById('bonus-btn');
    const bTxt = document.getElementById('bonus-text');
    if (currentData.lastBonus && now < currentData.lastBonus) {
        bBtn.disabled = true;
        const diff = currentData.lastBonus - now;
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        bTxt.innerText = `${h}h ${m}m ${s}s`;
    } else {
        bBtn.disabled = false;
        bTxt.innerText = "DAILY BONUS";
    }

    // টাস্ক কার্ড কন্ট্রোল
    for (let i = 1; i <= 2; i++) {
        const nextTime = currentData[`task_${i}_limit`] || 0;
        const card = document.getElementById(`card-${i}`);
        const text = document.getElementById(`timer-${i}`);
        if (now < nextTime) {
            card.classList.add('task-disabled');
            const diff = nextTime - now;
            text.innerText = `${Math.floor(diff/60000)}m ${Math.floor((diff%60000)/1000)}s`;
        } else {
            card.classList.remove('task-disabled');
            text.innerText = "৳ 10.00";
        }
    }
}
setInterval(updateAllTimers, 1000);
