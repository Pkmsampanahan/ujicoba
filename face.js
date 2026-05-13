async function loadModels() {
    if (state.modelsLoaded) return;
    try {
        const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models'; 
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
            faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
            faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        state.modelsLoaded = true;
    } catch (e) { showAlert("Error", "Gagal muat modul AI."); }
}

async function getCameraStream(targetId) {
    try {
        const videoEl = document.getElementById(targetId);
        if (state.stream) state.stream.getTracks().forEach(track => track.stop());
        state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        videoEl.srcObject = state.stream;
        return new Promise(resolve => { videoEl.onloadedmetadata = () => { videoEl.play(); resolve(true); }; });
    } catch (err) { showAlert("Gagal Kamera", "Izin diperlukan."); return false; }
}

function isFaceAligned(detection, vW, vH) {
    if (!detection) return { aligned: false, status: "MENCARI WAJAH...", scale: 1.0 };
    const { x, y, width, height } = detection.detection.box;
    const cX = x + width / 2;
    const cY = y + height / 2;
    const centered = (cX > vW * 0.25 && cX < vW * 0.75) && (cY > vH * 0.25 && cY < vH * 0.75);
    if (!centered) return { aligned: false, status: "WAJAH DI TENGAH", scale: 1.0 };
    return { aligned: true, status: "POSISI SEMPURNA ✅", scale: 1.2 };
}

async function startFaceAuth(mode) {
    state.authMode = mode;
    if(!state.modelsLoaded) { showLoading(true, "Menyiapkan AI..."); await loadModels(); showLoading(false); }
    document.getElementById('modal-face').style.display = 'flex';
    if (!(await getCameraStream('video-preview'))) return closeFaceModal();
    document.getElementById('face-scanner-line').style.display = 'block';
    detectFaceLoop();
}

async function detectFaceLoop() {
    const video = document.getElementById('video-preview');
    const btn = document.getElementById('btn-face-action');
    const oval = document.getElementById('login-oval');
    if (!state.stream || !video || document.getElementById('modal-face').style.display === 'none') return;
    
    const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 128 }))
                                    .withFaceLandmarks().withFaceDescriptor();
    const align = isFaceAligned(detection, video.videoWidth, video.videoHeight);
    
    if (align.aligned) {
        state.currentDescriptor = detection.descriptor;
        oval.classList.add('valid');
        btn.disabled = false;
        btn.innerText = "KONFIRMASI";
    } else {
        oval.classList.remove('valid');
        btn.disabled = true;
        state.faceDetectionFrame = requestAnimationFrame(detectFaceLoop);
    }
}
