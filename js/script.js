async function masuk() {
    const emailInput = document.getElementById('email').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    if (!emailInput || !passwordInput) {
        alert("Harap masukkan Email dan Password.");
        return;
    }

    try {
        const result = await ApiService.login(emailInput, passwordInput);
        
        if (result.success) {
            // Simpan data user
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userEmail', result.user.email);
            localStorage.setItem('userName', result.user.nama);
            localStorage.setItem('userRole', result.user.role);

            alert(`Selamat datang, ${result.user.nama} (${result.user.role})! Login berhasil.`);
            window.location.href = "dashboard.html";
        } else {
            alert(result.error || "Email atau Password yang Anda masukkan salah.");
        }
    } catch (error) {
        console.error('Login error:', error);
        alert("Error saat login. Coba lagi.");
    }
}

// Fungsi untuk cek login status
function cekLogin() {
    const loggedIn = localStorage.getItem('loggedIn');
    if (!loggedIn || loggedIn !== 'true') {
        window.location.href = "index.html";
    }
}

// Fungsi untuk menampilkan modal
function bukamodal(modalId) {
    document.getElementById(modalId).style.display = "block";
}

function tutupmodal(modalId) {
    document.getElementById(modalId).style.display = "none";
}

window.onclick = function(event) {

    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

//reset password
function resetpassword() {
    const email = document.getElementById('email-reset').value.trim();

    if (!email) {
        alert("Harap masukkan alamat email Anda.");
        return;
    }

    // Simulasi pengiriman reset link
    alert(`Link reset password sudah dikirim ke email: ${email}. Harap cek kotak masuk Anda.`);

    // Opsional: Kosongkan field input
    document.getElementById('email-reset').value = '';
    
    // Tutup modal
    tutupmodal('modal-lupa-password');
}

//daftar akun
async function daftarakun() {
    const nama = document.getElementById('nama-lengkap').value.trim();
    const email = document.getElementById('email-daftar').value.trim();
    const password = document.getElementById('password-daftar').value.trim();

    if (!nama || !email || !password) {
        alert("Semua kolom pendaftaran harus diisi.");
        return;
    }
    
     try {
        const result = await ApiService.register({ nama, email, password });
        
        if (result.success) {
            alert("Pendaftaran berhasil! Silakan login.");
            document.getElementById('form-daftar-akun').reset();
            tutupmodal('modal-daftar-akun');
        } else {
            alert(result.error || "Pendaftaran gagal");
        }
    } catch (error) {
        console.error('Register error:', error);
        alert("Error saat pendaftaran. Coba lagi.");
    }

    // Tambahkan ke array dataPengguna (hanya berlaku selama sesi browser)
    result.push(newAccount);
    
    alert("Pembuatan akun berhasil! Silakan login menggunakan email dan password yang baru Anda daftarkan.");
    
    // Kosongkan form dan tutup modal
    document.getElementById('form-daftar-akun').reset();
    tutupmodal('modal-daftar-akun');
}

// Fungsi logout
function logout() {
    const konfirmasi = confirm("Apakah anda yakin mau keluar dari halaman ini?")
    if (konfirmasi){
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        window.location.href = "index.html";
    } else {
        console.log("Logout dibatalkan");
    }
}

//fungsi dapatkan salam ketika masuk login
function dapatkanSalam() {
    const jam = new Date().getHours();
    if (jam < 12) {
        return 'Selamat pagi';
    } else if (jam < 15) {
        return 'Selamat siang';
    } else if (jam < 18){
        return 'Selamat Sore';
    } else {
        return 'Selamat malam';
    }
}

// Function untuk menampilkan salam di DOM
function tampilkanSalam() {
    const salamElement = document.getElementById('salam-waktu');
    if (salamElement) {
        const userName = localStorage.getItem('userName') || 'Pengguna';
        const salam = dapatkanSalam();
        salamElement.innerHTML = `${salam}, ${userName}!<br>Selamat Datang di Halaman Utama`;
    }
}

// Panggil saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    tampilkanSalam();
    
    // Load buku jika di halaman yang membutuhkan
    if (document.getElementById('daftar-buku')) {
        tampilkanBuku();
    }
    
    // Setup event listeners untuk form tracking
    const formTracking = document.getElementById('form-tracking');
    if (formTracking) {
        formTracking.addEventListener('submit', caridatatracking);
    }
    
    // Cek login status untuk halaman yang membutuhkan
    if (!window.location.href.includes('index.html') && 
        !window.location.href.includes('login.html')) {
        cekLogin();
    }
});

// Fungsi untuk menampilkan buku dari dataBahanAjar
async function tampilkanBuku() {
    const kontenGrid = document.getElementById('daftar-buku');
    
    if (!kontenGrid) {
        console.error('Elemen #daftar-buku tidak ditemukan');
        return;
    }
    
    try {
        const bukuData = await ApiService.getStokBuku();
        // Kosongkan konten grid sebelum menambahkan buku
        kontenGrid.innerHTML = '';
        
        // Jika tidak ada buku, tampilkan pesan
        if (dataBahanAjar.length === 0) {
            kontenGrid.innerHTML = '<p>Tidak ada buku yang tersedia.</p>';
            return;
        }
        
        // Loop melalui setiap buku di dataBahanAjar
        dataBahanAjar.forEach(buku => {
            const kartuBuku = document.createElement('div');
            kartuBuku.className = 'kartu-menu';
            kartuBuku.innerHTML = `
                <div class="gambar-buku">
                    <img src="${buku.cover}" alt="gambar bahan ajar ${buku.namaBarang}" onerror="this.src='img/default-cover.jpg'">
                </div>
                <div class="info-buku">
                    <h2>${buku.namaBarang}</h2>
                    <p class="keterangan-produk">${buku.jenisBarang} ${buku.namaBarang} ${buku.kodeBarang}</p>
                    <a href="#" class="tombol-primer" onclick="tampilkandetailproduk('${buku.kodeBarang}')">Detail Buku <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            
            // Tambahkan kartu buku ke grid
            kontenGrid.appendChild(kartuBuku);
        });
    } catch(error) {
        console.log('Error melampirkan buku:', error);
        kontenGrid.innerHTML = '<p>Error membuat data buku.</p>';
    }

}

async function tampilkanDetailProduk(kodeBarang) {
    try {
        const buku = await ApiService.getDetailBuku(kodeBarang);

        if (!buku) {
                alert("Detail produk tidak ditemukan.");
                return;
            }
    
            // Ambil elemen-elemen di modal
            const coverDetail = document.getElementById('cover-detail');
            const infoDetail = document.getElementById('info-detail');
            const modalId = 'modal-detail-produk';
    
            // Konten Cover Buku
            if (coverDetail) {
                coverDetail.innerHTML = `<img src="${buku.gambar}" alt="Cover ${buku.judul}" onerror="this.src='assets/img/default-cover.jpg'">`;
            }
    
            // Isi Konten Informasi Detail Buku
            if (infoDetail) {
                infoDetail.innerHTML = `
                    <p><strong>Nama Buku</strong>: ${buku.judul}</p>
                    <p><strong>Kode Barang</strong>: ${buku.kode}</p>
                    <p><strong>Lokasi Rak</strong>: ${buku.lokasiRak}</p>
                    <p><strong>Jenis</strong>: ${buku.kategori}</p>
                    <p><strong>UPBJJ</strong>: ${buku.upbjj}</p>
                    <p><strong>Stok</strong>: ${buku.qty}</p>
                    <p><strong>Safety Stock</strong>: ${buku.safety}</p>
                    <p><strong>Harga</strong>: Rp ${buku.harga ? buku.harga.toLocaleString('id-ID') : '0'}</p>
                    <p><strong>Catatan</strong>: ${buku.catatanHTML || '-'}</p>
                `;
            }
    
        //Tampilkan Modal
        bukamodal(modalId);

    } catch (error) {
        console.error('Error menampilkan detail:', error);
        alert("Error memuat detail produk.");
    }
}

// Pastikan fungsi renderUlangDaftarBuku()
function renderUlangDaftarBuku() {
    console.log('Data buku diperbarui:', dataBahanAjar);
    tampilkanBuku();
}

document.addEventListener('DOMContentLoaded', function() {
    // Cek apakah kita berada di halaman stok
    if (document.querySelector('.halaman-stock')) {
        tampilkanBuku();
    }
    
    tampilkanSalam();
});

// Fungsi bukaModal dan tutupModal
function bukaModal(idModal) {
    document.getElementById(idModal).style.display = 'block';
}

function tutupmodal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

// Event listener untuk tombol tutup modal
document.querySelector('.tutup-modal').addEventListener('click', function() {
    tutupmodal('modal-tambah-buku');
});

// Fungsi untuk update statistik dashboard
function updateDashboardStats() {
    // Jika aplikasi Vue dashboard sudah dimuat, statistik akan otomatis terupdate
    console.log('Dashboard stats should be auto-updated by Vue app');
}

// Panggil saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
    tampilkanSalam();
    
    // Jika di halaman dashboard, update statistik
    if (document.querySelector('.halaman-dashboard')) {
        updateDashboardStats();
    }
    
    // Cek login status untuk halaman yang membutuhkan
    if (!window.location.href.includes('index.html') && 
        !window.location.href.includes('login.html')) {
        cekLogin();
    }
});