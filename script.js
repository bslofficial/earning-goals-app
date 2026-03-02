// Unity Ads configuration
const gameId = '6055094'; 
const placementId = 'Rewarded_Android'; 

// Unity Ads Initialize
if (window.UnityAds) {
    window.UnityAds.initialize(gameId, false); // টেস্টিং এর জন্য false রাখুন
}

window.startVideoTask = (num) => {
    // পপ-আপ মেসেজ
    alert("Ads are loading... Please wait.");

    // অ্যাড প্লে করার চেষ্টা
    if (window.UnityAds && window.UnityAds.isReady(placementId)) {
        window.UnityAds.show(placementId, {
            result: (status) => {
                if (status === 'COMPLETED') {
                    // শুধুমাত্র অ্যাড শেষ করলেই টাকা যোগ হবে
                    updateBalance(10);
                    alert("Success! Tk.10 added to your account.");
                } else {
                    alert("Ad was not completed or skipped. No reward added.");
                }
            }
        });
    } else {
        // যদি অ্যাড লোড না হয়, তবে নিচের মেসেজটি দেখাবে
        alert("Sorry! No ads available right now. Please try again after 1 minute or check your VPN connection.");
        
        // অ্যাড লোড না হলে ভুল করে টাকা যাতে যোগ না হয় তার জন্য লগ চেক
        console.log("Unity Ads placement not ready.");
    }
};
