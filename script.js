function startVideoTask(num) {
    console.log("Ad request sent for Task: " + num);

    // ১. ইউনিটি অ্যাডস চেক করা হচ্ছে
    if (typeof unityads !== 'undefined') {
        // যদি ইউনিটি ভিডিও পুরোপুরি লোড হয়ে থাকে
        if (unityads.isReady(unityPlacement)) {
            unityads.show(unityPlacement);
            showTimer(num);
        } 
        // ২. যদি ইউনিটি ভিডিও রেডি না থাকে, তবে Adsterra Direct Link ব্যাকআপ হিসেবে কাজ করবে
        else {
            console.log("Unity ads not ready. Using Adsterra backup...");
            window.open(directLink, '_blank'); // আপনার দেওয়া ডিরেক্ট লিঙ্ক ওপেন হবে
            showTimer(num); // ইউজারকে ইনকাম দেওয়ার টাইমার শুরু হবে
        }
    } else {
        // ৩. যদি নেটওয়ার্কের কারণে ইউনিটি লোডই না হয়
        window.open(directLink, '_blank');
        showTimer(num);
    }
}
