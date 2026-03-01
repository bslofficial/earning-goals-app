// Unity Ads Configuration
const unityGameID = "6055095"; //
const placementID = "Rewarded_Android"; //
const isTestMode = true; //

// Initialize Unity Ads
function initAds() {
    if (typeof UnityAds !== 'undefined') {
        UnityAds.init(unityGameID, isTestMode, {
            onComplete: () => {
                console.log('Unity Ads Initialized');
                loadAd();
            },
            onError: (error) => console.log('Init Error:', error)
        });
    }
}

// Load Ad
function loadAd() {
    UnityAds.load(placementID);
}

// Show Ad on Task Click
window.startVideoTask = function(taskId) {
    UnityAds.show(placementID, {
        onComplete: (state) => {
            if (state === 'COMPLETED') {
                giveReward(10);
                alert("Task Complete! 10 Tk Added.");
                loadAd();
            }
        },
        onError: (error) => {
            alert("Ad not ready. Please use a VPN or wait.");
            loadAd();
        }
    });
};

function giveReward(amount) {
    let balance = document.getElementById('balance');
    balance.innerText = (parseFloat(balance.innerText) + amount).toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    initAds();
    // Remove loading screen after 2 seconds
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
    }, 2000);
});

// Sidebar Toggle
window.toggleMenu = function() {
    document.getElementById('side-menu').classList.toggle('active');
};
