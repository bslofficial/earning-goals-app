function toggleMenu() {
    const menu = document.getElementById('side-menu');
    menu.classList.toggle('active');
}

// মেনুর বাইরে ক্লিক করলে বন্ধ হবে
document.addEventListener('click', (e) => {
    const menu = document.getElementById('side-menu');
    const trigger = document.querySelector('.menu-trigger');
    if (menu.classList.contains('active') && !menu.contains(e.target) && !trigger.contains(e.target)) {
        menu.classList.remove('active');
    }
});

function copyLink() {
    const copyText = document.getElementById("refer-url");
    copyText.select();
    document.execCommand("copy");
    alert("Refer Link Copied!");
}
