// Unity Ads Configuration
const unityGameID = "6055095"; // আপনার অ্যান্ড্রয়েড গেম আইডি
const isTestMode = true; // আপনার ডিভাইস টেস্ট মোডে আছে

// ১. বিজ্ঞাপন ইনিশিয়ালাইজ করা
function initUnityAds() {
    if (typeof UnityAds !== 'undefined') {
        UnityAds.init(unityGameID, isTestMode, {
            onComplete: () => {
                console.log('Unity Ads Ready');
                document.getElementById('loading-screen').style.display = 'none';
                loadNextAd();
            },
            onError: (error) => {
                console.error('Unity Init Failed:', error);
                alert("Ads failing to init. Try a VPN.");
            }
        });
    }
}

// ২. বিজ্ঞাপন লোড করা
function loadNextAd() {
    UnityAds.load('Rewarded_Android'); // আপনার প্লেসমেন্ট আইডি
}

// ৩. টাস্ক ক্লিক করলে বিজ্ঞাপন দেখানো
window.startVideoTask = function(placementId) {
    UnityAds.show(placementId, {
        onComplete: (state) => {
            if (state === 'COMPLETED') {
                // ব্যালেন্স আপডেট
                let balanceEl = document.getElementById('balance');
                let currentBalance = parseFloat(balanceEl.innerText);
                balanceEl.innerText = (currentBalance + 10.00).toFixed(2);
                alert("Success! 10 Tk added.");
                loadNextAd();
            }
        },
        onError: (error) => {
            alert("Ad not loaded yet. Use a VPN and refresh.");
            loadNextAd();
        }
    });
};

document.addEventListener('DOMContentLoaded', initUnityAds);
