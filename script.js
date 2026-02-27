// পেমেন্ট রিকোয়েস্ট পাঠানোর ফাংশন
function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = document.getElementById('withdrawAmount').value;
    const userBalance = parseFloat(localStorage.getItem('userBalance')) || 0;

    // ভ্যালিডেশন চেক
    if (account.length < 11) {
        alert("Please enter a valid Bkash/Nagad number!");
        return;
    }
    if (amount < 10) {
        alert("Minimum withdraw is $10.00");
        return;
    }
    if (amount > userBalance) {
        alert("You don't have enough balance!");
        return;
    }

    // হোয়াটসঅ্যাপ মেসেজ ফরম্যাট
    const message = `*NEW WITHDRAW REQUEST*%0A` +
                    `--------------------------%0A` +
                    `Method: ${method}%0A` +
                    `Number: ${account}%0A` +
                    `Amount: $${amount}%0A` +
                    `User ID: Guest_${Math.floor(Math.random()*1000)}%0A` +
                    `--------------------------%0A` +
                    `Please check and pay!`;

    // হোয়াটসঅ্যাপে পাঠিয়ে দেওয়া
    window.open(`https://wa.me/8801917044596?text=${message}`, '_blank');
    
    // ব্যালেন্স থেকে টাকা কেটে নেওয়া (ঐচ্ছিক)
    // updateBalance(-amount); 
    
    closeWithdraw();
    alert("Request Sent! Please wait for approval.");
}
