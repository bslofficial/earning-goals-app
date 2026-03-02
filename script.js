// আপনার Firebase Config এবং Auth অংশ ঠিক থাকবে...
// শুধু নিচের ফাংশনগুলো আপডেট বা যোগ করুন

window.toggleMenu = () => document.getElementById('side-menu').classList.toggle('active');

// সেকশন পরিবর্তন ও সাইডবার লিঙ্ক কাজ করার লজিক
window.showSection = (name) => {
    const dash = document.getElementById('dashboard-content');
    const listSec = document.getElementById('list-section');
    if(name === 'dashboard') {
        dash.style.display = 'block';
        listSec.style.display = 'none';
    } else {
        dash.style.display = 'none';
        listSec.style.display = 'block';
    }
    document.getElementById('side-menu').classList.remove('active');
};

// লিডারবোর্ড লোড করা
window.loadLeaderboard = async () => {
    document.getElementById('list-title').innerText = "Leaderboard";
    document.getElementById('list-title').style.color = "#1e40af";
    const dataWrapper = document.getElementById('data-list');
    dataWrapper.innerHTML = "<p style='text-align:center;'>Loading...</p>";
    showSection('list');

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if(snapshot.exists()){
        let users = [];
        snapshot.forEach(child => {
            users.push({ name: child.key.substring(0,6), balance: child.val().balance || 0 });
        });
        users.sort((a,b) => b.balance - a.balance);
        dataWrapper.innerHTML = "";
        users.forEach((u, i) => {
            dataWrapper.innerHTML += `
                <div class="data-row">
                    <div style="display:flex; align-items:center;"><div class="rank-badge">${i+1}</div>User_${u.name}</div>
                    <b style="color:#1e40af;">Tk.${u.balance.toFixed(2)}</b>
                </div>`;
        });
    }
};

// রেফার টিম লোড করা
window.loadReferTeam = async () => {
    document.getElementById('list-title').innerText = "Refer Team";
    document.getElementById('list-title').style.color = "#10b981";
    const dataWrapper = document.getElementById('data-list');
    dataWrapper.innerHTML = "<p style='text-align:center;'>Loading...</p>";
    showSection('list');

    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    if(snapshot.exists()){
        let team = [];
        snapshot.forEach(child => {
            team.push({ name: child.key.substring(0,6), count: child.val().referCount || 0 });
        });
        team.sort((a,b) => b.count - a.count);
        dataWrapper.innerHTML = "";
        team.forEach((t, i) => {
            dataWrapper.innerHTML += `
                <div class="data-row">
                    <div style="display:flex; align-items:center;"><div class="rank-badge" style="background:#10b981;">${i+1}</div>User_${t.name}</div>
                    <b style="color:#10b981;">${t.count} Refers</b>
                </div>`;
        });
    }
};

// বাকি Firebase লজিক (Auth, Tasks, Bonus) আগের মতোই থাকবে।
