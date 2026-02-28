// Unity এবং Firebase কনফিগারেশন আগের মতোই থাকবে...

// Task Execution: বিজ্ঞাপনের আগে সেকেন্ড কাউন্টডাউন হবে না
window.startVideoTask = function(id) {
    const now = new Date().getTime();
    if (currentData.lastLimit && now < currentData.lastLimit) {
        return alert("২৪ ঘণ্টার লিমিট চলছে! পরে চেষ্টা করুন।");
    }
    
    // ১. প্রথমে বিজ্ঞাপন দেখানোর চেষ্টা করবে
    if (typeof unityads !== 'undefined' && unityads.isReady(unityPlacement)) {
        unityads.show(unityPlacement);
        // বিজ্ঞাপন শেষ হওয়ার পর টাইমার শুরু হবে (Unity Callback)
        startTimerAfterAd(id);
    } else {
        // যদি Unity অ্যাড না থাকে, তবে ডাইরেক্ট লিঙ্ক ওপেন হবে
        window.open(directLink, '_blank');
        // লিঙ্ক ওপেন হওয়ার পর টাইমার শুরু হবে
        startTimerAfterAd(id);
    }
}

// ২. বিজ্ঞাপন বা লিঙ্ক ওপেন হওয়ার পর এই টাইমারটি চলবে
function startTimerAfterAd(id) {
    const overlay = document.getElementById('videoOverlay');
    const secondsSpan = document.getElementById('seconds');
    
    overlay.style.display = 'flex';
    let count = 20; // ২০ সেকেন্ডের অপেক্ষা
    secondsSpan.innerText = count;

    const interval = setInterval(async () => {
        count--;
        secondsSpan.innerText = count;
        
        if (count <= 0) {
            clearInterval(interval);
            overlay.style.display = 'none';
            // ৩. টাইমার শেষ হওয়ার পর টাকা অ্যাড হবে
            await addMoneyToAccount(id);
        }
    }, 1000);
}

// ৪. টাকা ডাটাবেজে সেভ করার ফাংশন (নিশ্চিতভাবে টাকা অ্যাড হবে)
async function addMoneyToAccount(id) {
    try {
        currentData.balance = (currentData.balance || 0) + 5.00; // ৫ টাকা যোগ
        currentData.doneToday = (currentData.doneToday || 0) + 1;

        // ৪টি টাস্ক শেষ হলে ২৪ ঘণ্টা লিমিট সেট হবে
        if (currentData.doneToday >= 4) {
            currentData.lastLimit = new Date().getTime() + (24 * 60 * 60 * 1000);
        }

        // Firebase-এ ডাটা আপডেট
        await update(userRef, {
            balance: currentData.balance,
            doneToday: currentData.doneToday,
            lastLimit: currentData.lastLimit
        });

        updateDisplay(); // স্ক্রিনে ব্যালেন্স আপডেট
        document.getElementById(`task-${id}`).style.opacity = '0.3';
        document.getElementById(`task-${id}`).style.pointerEvents = 'none';
        
        alert("৳৫.০০ আপনার ব্যালেন্স এ যোগ করা হয়েছে!");
        checkCooldown(); // লিমিট চেক করা
    } catch (error) {
        console.error("টাকা যোগ করতে সমস্যা হয়েছে:", error);
        alert("নেটওয়ার্ক সমস্যার কারণে টাকা যোগ হয়নি। আবার চেষ্টা করুন।");
    }
}
