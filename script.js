// à¦ªà§‡à¦®à§‡à¦¨à§à¦Ÿ à¦°à¦¿à¦•à§‹à§Ÿà§‡à¦¸à§à¦Ÿ à¦ªà¦¾à¦ à¦¾à¦¨à§‹à¦° à¦«à¦¾à¦‚à¦¶à¦¨
function sendWithdrawRequest() {
    const method = document.getElementById('method').value;
    const account = document.getElementById('accountNo').value;
    const amount = document.getElementById('withdrawAmount').value;
    const userBalance = parseFloat(localStorage.getItem('userBalance')) || 0;

    // à¦­à§à¦¯à¦¾à¦²à¦¿à¦¡à§‡à¦¶à¦¨ à¦šà§‡à¦•
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

    // à¦¹à§‹à§Ÿà¦¾à¦Ÿà¦¸à¦…à§à¦¯à¦¾à¦ª à¦®à§‡à¦¸à§‡à¦œ à¦«à¦°à¦®à§à¦¯à¦¾à¦Ÿ
    const message = `*NEW WITHDRAW REQUEST*%0A` +
                    `--------------------------%0A` +
                    `Method: ${method}%0A` +
                    `Number: ${account}%0A` +
                    `Amount: $${amount}%0A` +
                    `User ID: Guest_${Math.floor(Math.random()*1000)}%0A` +
                    `--------------------------%0A` +
                    `Please check and pay!`;

    // à¦¹à§‹à§Ÿà¦¾à¦Ÿà¦¸à¦…à§à¦¯à¦¾à¦ªà§‡ à¦ªà¦¾à¦ à¦¿à§Ÿà§‡ à¦¦à§‡à¦“à§Ÿà¦¾
    window.open(`https://wa.me/8801917044596?text=${message}`, '_blank');
    
    // à¦¬à§à¦¯à¦¾à¦²à§‡à¦¨à§à¦¸ à¦¥à§‡à¦•à§‡ à¦Ÿà¦¾à¦•à¦¾ à¦•à§‡à¦Ÿà§‡ à¦¨à§‡à¦“à§Ÿà¦¾ (à¦à¦šà§à¦›à¦¿à¦•)
    // updateBalance(-amount); 
    
    closeWithdraw();
    alert("Request Sent! Please wait for approval.");
}
