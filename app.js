// Simpan data user di localStorage
let users = JSON.parse(localStorage.getItem('users')) || [];

// Variabel state
let selectedFinger = {
    register: null,
    login: null
};
let fingerprintImages = {
    register: null,
    login: null
};

// Inisialisasi halaman
document.addEventListener('DOMContentLoaded', function() {
    // Setup tab navigation
    document.getElementById('register-tab').addEventListener('click', showRegister);
    document.getElementById('login-tab').addEventListener('click', showLogin);
    
    // Inisialisasi kamera untuk register
    initCamera('camera');
    
    // Inisialisasi kamera untuk login
    initCamera('camera-login');
});

// Tampilkan form register
function showRegister() {
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('login-form').classList.add('hidden');
    
    // Update tab styling
    document.getElementById('register-tab').classList.add('text-green-600', 'border-b-2', 'border-green-600');
    document.getElementById('register-tab').classList.remove('text-gray-500');
    document.getElementById('login-tab').classList.add('text-gray-500');
    document.getElementById('login-tab').classList.remove('text-green-600', 'border-b-2', 'border-green-600');
    
    resetForms();
}

// Tampilkan form login
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    
    // Update tab styling
    document.getElementById('login-tab').classList.add('text-green-600', 'border-b-2', 'border-green-600');
    document.getElementById('login-tab').classList.remove('text-gray-500');
    document.getElementById('register-tab').classList.add('text-gray-500');
    document.getElementById('register-tab').classList.remove('text-green-600', 'border-b-2', 'border-green-600');
    
    resetForms();
}

// Reset form dan state
function resetForms() {
    selectedFinger.register = null;
    selectedFinger.login = null;
    fingerprintImages.register = null;
    fingerprintImages.login = null;
    
    // Reset pilihan jari
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`reg-finger-${i}`).classList.remove('border-green-500', 'bg-green-50');
        document.getElementById(`login-finger-${i}`).classList.remove('border-green-500', 'bg-green-50');
    }
    
    // Reset preview gambar
    document.getElementById('fingerprint-preview-register').classList.add('hidden');
    document.getElementById('fingerprint-preview-login').classList.add('hidden');
    
    // Reset pesan
    document.getElementById('register-message').className = 'hidden mb-4 p-3 rounded';
    document.getElementById('login-message').className = 'hidden mb-4 p-3 rounded';
}

// Pilih jari untuk registrasi/login
function selectFinger(fingerNumber, formType) {
    selectedFinger[formType] = fingerNumber;
    
    // Reset semua seleksi untuk form ini
    for (let i = 1; i <= 5; i++) {
        document.getElementById(`${formType}-finger-${i}`).classList.remove('border-green-500', 'bg-green-50');
    }
    
    // Tandai yang dipilih
    document.getElementById(`${formType}-finger-${fingerNumber}`).classList.add('border-green-500', 'bg-green-50');
}

// Inisialisasi kamera
function initCamera(cameraId) {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function(stream) {
                document.getElementById(cameraId).srcObject = stream;
            })
            .catch(function(error) {
                console.error("Error accessing camera:", error);
                showMessage(`${cameraId === 'camera' ? 'register' : 'login'}`, "Tidak dapat mengakses kamera. Pastikan Anda memberikan izin.", 'error');
            });
    } else {
        showMessage(`${cameraId === 'camera' ? 'register' : 'login'}`, "Browser tidak mendukung akses kamera.", 'error');
    }
}

// Ambil foto jari
function captureFingerprint(formType) {
    if (!selectedFinger[formType]) {
        showMessage(formType, "Silakan pilih jari terlebih dahulu.", 'error');
        return;
    }
    
    const cameraId = formType === 'register' ? 'camera' : 'camera-login';
    const previewId = `fingerprint-preview-${formType}`;
    const video = document.getElementById(cameraId);
    const canvas = document.createElement('canvas');
    
    // Sesuaikan ukuran canvas dengan video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Gambar frame video ke canvas
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simpan gambar sebagai data URL
    fingerprintImages[formType] = canvas.toDataURL('image/png');
    
    // Tampilkan preview
    const preview = document.getElementById(previewId);
    preview.src = fingerprintImages[formType];
    preview.classList.remove('hidden');
    
    showMessage(formType, "Foto jari berhasil diambil.", 'success');
}

// Registrasi user baru
function registerUser() {
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    
    // Validasi
    if (!username || !email || !password) {
        showMessage('register', "Harap isi semua field.", 'error');
        return;
    }
    
    if (!selectedFinger.register || !fingerprintImages.register) {
        showMessage('register', "Harap pilih jari dan ambil foto.", 'error');
        return;
    }
    
    // Cek apakah username sudah ada
    if (users.some(user => user.username === username)) {
        showMessage('register', "Username sudah digunakan.", 'error');
        return;
    }
    
    // Simpan user baru
    const newUser = {
        username,
        email,
        password, // Dalam aplikasi nyata, password harus di-hash
        fingerData: {
            fingerNumber: selectedFinger.register,
            fingerprintImage: fingerprintImages.register
        }
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showMessage('register', "Registrasi berhasil! Silakan login.", 'success');
    setTimeout(showLogin, 2000);
}

// Login user
function loginUser() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    
    // Validasi
    if (!username || !password) {
        showMessage('login', "Harap isi username dan password.", 'error');
        return;
    }
    
    if (!selectedFinger.login || !fingerprintImages.login) {
        showMessage('login', "Harap pilih jari dan ambil foto.", 'error');
        return;
    }
    
    // Cari user
    const user = users.find(u => u.username === username);
    
    if (!user) {
        showMessage('login', "Username tidak ditemukan.", 'error');
        return;
    }
    
    // Verifikasi password (dalam aplikasi nyata, bandingkan hash)
    if (user.password !== password) {
        showMessage('login', "Password salah.", 'error');
        return;
    }
    
    // Verifikasi jari
    if (user.fingerData.fingerNumber !== selectedFinger.login) {
        showMessage('login', "Jari yang dipilih tidak sesuai dengan registrasi.", 'error');
        return;
    }
    
    // Dalam aplikasi nyata, di sini akan ada proses pengenalan sidik jari yang lebih canggih
    showMessage('login', "Login berhasil! Sidik jari cocok.", 'success');
    
    // Redirect ke halaman setelah login (simulasi)
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 1500);
}

// Tampilkan pesan
function showMessage(formType, text, type) {
    const messageElement = document.getElementById(`${formType}-message`);
    messageElement.textContent = text;
    messageElement.className = `${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} mb-4 p-3 rounded`;
    messageElement.classList.remove('hidden');
}