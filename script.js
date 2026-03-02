// Unity Ads Configuration
const gameId = '6055094'; // আপনার Unity Game ID
const placementId = 'Rewarded_Android'; // আপনার প্লেসমেন্ট আইডি

// Unity Ads ইনিশিয়ালাইজ করার সঠিক পদ্ধতি
if (window.UnityAds) {
    window.UnityAds.initialize(gameId, false, {
        onComplete: () => {
            console.log('Unity Ads Initialized Successfully');
        },
        onFailed: (error, message) => {
            console.error(`Unity Ads Failed: ${message}`);
        }
    });
}

// ভিডিও টাস্ক ফাংশন (উন্নত ভার্সন)
window.startVideoTask = (num) => {
    // চেক করা হচ্ছে অ্যাড তৈরি কি না
    if (window.UnityAds && window.UnityAds.isReady(placementId)) {
        window.UnityAds.show(placementId, {
            result: (status) => {
                if (status === 'COMPLETED') {
                    // অ্যাড পুরোপুরি দেখলেই কেবল টাকা যোগ হবে
                    updateBalance(10); 
                    alert("Success! You watched the full ad. Tk.10 added.");
                } else if (status === 'SKIPPED') {
                    alert("You skipped the ad. No reward will be added.");
                } else {
                    alert("Ad failed to play.");
                }
            }
        });
    } else {
        // যদি অ্যাড লোড না থাকে, তবে বারবার লোড করার চেষ্টা করবে
        alert("Ad is not ready yet. Please wait 5-10 seconds and try again.");
        console.log("Attempting to reload Unity Ads...");
        if (window.UnityAds) window.UnityAds.initialize(gameId, false);
    }
};
