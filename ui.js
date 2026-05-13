function showView(viewName) {
    if (viewName === state.currentView) return;
    document.querySelectorAll('.view-content').forEach(v => v.classList.remove('active'));
    document.getElementById(`view-${viewName}`).classList.add('active');
    
    state.currentView = viewName;
    
    const nav = document.getElementById('main-nav');
    const fab = document.getElementById('fab-scan-qr');
    
    if(viewName === 'login') {
        nav.classList.add('hidden'); 
        fab.classList.add('hidden');
    } else {
        nav.classList.remove('hidden');
        fab.classList.toggle('hidden', viewName !== 'profile');
        if(viewName === 'profile') { 
            updateProfileInfo(); 
            renderDailyLog(); 
            startGeoMonitoring(); 
        }
        if(viewName === 'rekap') renderRekap();
    }
}

function showAlert(title, msg) {
    document.getElementById('alert-title').innerText = title;
    document.getElementById('alert-msg').innerText = msg;
    const alert = document.getElementById('custom-alert');
    alert.classList.add('show');
    setTimeout(() => alert.classList.remove('show'), 4000);
}

function showLoading(show, text = "Memproses...") {
    document.getElementById('loading-text').innerText = text;
    document.getElementById('loading-overlay').classList.toggle('hidden', !show);
}

function updateProfileInfo() {
    if (!state.user) return;
    document.getElementById('prof-name').innerText = state.user;
    const avatar = document.getElementById('prof-avatar');
    if(avatar) avatar.innerText = state.user.charAt(0).toUpperCase();
}
