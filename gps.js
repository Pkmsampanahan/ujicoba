const TARGET_LOC = { lat: -2.637013, lng: 116.203609, radius: 100 };

function calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
    const R = 6371000; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return Math.round(R * c);
}

function startGeoMonitoring() {
    if (!navigator.geolocation) return;
    if (state.geoWatchId) navigator.geolocation.clearWatch(state.geoWatchId);
    
    state.geoWatchId = navigator.geolocation.watchPosition((pos) => {
        state.currentLocation = pos;
        const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, TARGET_LOC.lat, TARGET_LOC.lng);
        
        // Update UI Banner Top
        const dotMain = document.getElementById('geo-dot-main');
        const textMain = document.getElementById('geo-text-main');
        const distMain = document.getElementById('geo-dist-main');
        
        if (dotMain && textMain) {
            if (dist <= TARGET_LOC.radius) {
                dotMain.className = "geo-dot-main active";
                textMain.innerText = "AREA PKM TERDETEKSI";
                if(distMain) distMain.innerText = `JARAK: ${dist}M (AMAN)`;
            } else {
                dotMain.className = "geo-dot-main inactive";
                textMain.innerText = "DI LUAR RADIUS PKM";
                if(distMain) distMain.innerText = `JARAK: ${dist}M (JAUH)`;
            }
        }

        // Update Profile Status Pill
        const profText = document.getElementById('profile-gps-text');
        const gpsContainer = document.getElementById('gps-status-container');
        if (profText && gpsContainer) {
            if (dist <= TARGET_LOC.radius) {
                profText.innerText = "Area PKM";
                gpsContainer.className = "flex items-center gap-1.5 gps-pill";
            } else {
                profText.innerText = "Luar Area";
                gpsContainer.className = "flex items-center gap-1.5";
            }
        }
    }, null, { enableHighAccuracy: true });
}
