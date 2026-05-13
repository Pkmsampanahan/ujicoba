const APP_VERSION = "1.2.1"; 
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyDeWZyUvXj3qVOZXviPgN-d42jswXgkm2cvYlA7OBgGSPX-G_rxYti_rJWGVdpmi_f2A/exec";

let state = { 
    user: localStorage.getItem('gardena_user') || null, 
    data: { officers: [], logs: [], config: {}, descriptors: [] }, 
    stream: null, 
    modelsLoaded: false,
    currentLocation: null,
    currentDescriptor: null,
    geoWatchId: null,
    currentView: 'login',
    isProcessing: false,
    authMode: 'LOGIN' 
};

async function fetchData() {
    try {
        const res = await callGAS('getData');
        state.data = res;
        renderUserSelect();
    } catch (e) { console.error(e); }
}

async function callGAS(method, args = []) {
    const fetchUrl = `${WEB_APP_URL}?action=${method}&data=${encodeURIComponent(JSON.stringify(args))}`;
    const response = await fetch(fetchUrl);
    return await response.json();
}

function handleAttendanceTrigger() {
    // Sesuai logika lama Anda
    startFaceAuth('ABSENSI');
}

async function confirmFaceAuth() {
    const threshold = 0.1;
    let matchedUser = null;
    
    // Logika pencocokan wajah dari data state.data.descriptors
    for (const off of state.data.descriptors) {
        const matcher = new faceapi.FaceMatcher(new Float32Array(JSON.parse(off.descriptor)), threshold);
        if (matcher.findBestMatch(state.currentDescriptor).label !== 'unknown') {
            matchedUser = off.name;
            break;
        }
    }

    if (matchedUser) {
        closeFaceModal();
        if (state.authMode === 'LOGIN') {
            state.user = matchedUser;
            localStorage.setItem('gardena_user', matchedUser);
            showView('profile');
        } else {
            processAttendance("FACE");
        }
    } else {
        showAlert("Ditolak", "Wajah tidak dikenal");
    }
}

async function processAttendance(method) {
    showLoading(true, "Mencatat...");
    try {
        await callGAS('saveAttendance', [{
            name: state.user,
            type: "MASUK", // Logika dinamis sesuai jam bisa ditambah
            coord: state.currentLocation ? `${state.currentLocation.coords.latitude},${state.currentLocation.coords.longitude}` : "No-GPS"
        }]);
        showAlert("Berhasil", "Presensi tercatat ✨");
        fetchData();
    } catch (e) { showAlert("Error", "Gagal simpan"); }
    finally { showLoading(false); }
}

function renderDailyLog() {
    const container = document.getElementById('daily-log-container');
    if(!container || !state.data.logs) return;
    const myLogs = state.data.logs.filter(l => l.name === state.user).slice(0, 5);
    container.innerHTML = myLogs.map(l => `
        <div class="log-card">
            <p class="text-[10px] font-black">${l.type} - ${l.time}</p>
            <span class="text-[7px]">${l.status || 'OK'}</span>
        </div>
    `).join('');
}

function handleAdminTrigger() {
    // Logika admin trigger Anda
    document.getElementById('select-user').classList.remove('hidden');
}

function closeFaceModal() {
    if(state.stream) state.stream.getTracks().forEach(t => t.stop());
    document.getElementById('modal-face').style.display = 'none';
}

window.onload = () => {
    fetchData();
    if(state.user) showView('profile');
    
    setInterval(() => {
        document.getElementById('clock-display').innerText = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    }, 1000);
    
    setTimeout(() => {
        document.getElementById('splash-screen').classList.add('fade-out');
    }, 2000);
};
