function masuk(){
    //ambil nilai dari input form
    const emailInput = document.getElementById('email').value.trim();
    const passwordInput = document.getElementById('password').value.trim();

    if (!emailInput || !passwordInput) {
        alert("Harap masukkan Email dan Password.");
        return;
    }

    //Akses data pengguna dari data.js
    if (typeof dataPengguna === 'undefined') {
        alert("Error: Data pengguna tidak ditemukan. Pastikan file data.js dimuat dengan benar.");
        return;
    }

    //Cari pengguna yang cocok (Email dan Password)
    const user = dataPengguna.find(
        u => u.email === emailInput && u.password === passwordInput
    );

    // Logika verifikasi
    if (user) {
        // Jika berhasil (Login Berhasil)
        // Simpan data di Local Storage
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.nama);
        localStorage.setItem('userRole', user.role);

        // Tampilkan pesan sukses dan redirect
        alert(`Selamat datang, ${user.nama} (${user.role})! Login berhasil.`);
        
        // Arahkan ke halaman dashboard
        window.location.href = "dashboard.html"; 
    } else {
        // Jika data tidak ditemukan (Login Gagal)
        alert("Email atau Password yang Anda masukkan salah.");
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
    // Mengecek apakah elemen yang diklik memiliki class 'modal'
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
function daftarakun() {
    const nama = document.getElementById('nama-lengkap').value.trim();
    const email = document.getElementById('email-daftar').value.trim();
    const password = document.getElementById('password-daftar').value.trim();

    if (!nama || !email || !password) {
        alert("Semua kolom pendaftaran harus diisi.");
        return;
    }
    
    // Pengecekan sederhana apakah email sudah ada di dataPengguna
    if (typeof dataPengguna === 'undefined') {
        alert("Error: Data pengguna tidak ditemukan.");
        return;
    }
    const emailSudahAda = dataPengguna.some(u => u.email === email);
    if (emailSudahAda) {
        alert("Pendaftaran Gagal: Email ini sudah terdaftar. Silakan gunakan email lain.");
        return;
    }

    // Simulasi penambahan akun baru (HANYA DI CLIENT-SIDE)
    const newId = dataPengguna.length + 1;
    const newAccount = {
        id: newId,
        nama: nama,
        email: email,
        password: password,
        role: "Mahasiswa", // Default role
        lokasi: "Unknown"
    };

    // Tambahkan ke array dataPengguna (hanya berlaku selama sesi browser)
    dataPengguna.push(newAccount);
    
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
});

function tampilkandetailproduk(kodeBarang) {
    //Cari data buku yang cocok di dataBahanAjar
    const buku = dataBahanAjar.find(b => b.kodeBarang === kodeBarang);

    if (!buku) {
        alert("Detail produk tidak ditemukan.");
        return;
    }

    //Ambil elemen-elemen di modal
    const coverDetail = document.getElementById('cover-detail');
    const infoDetail = document.getElementById('info-detail');
    const modalId = 'modal-detail-produk';

    //Konten Cover Buku
    coverDetail.innerHTML = `<img src="${buku.cover}" alt="Cover ${buku.namaBarang}">`;

    //Isi Konten Informasi Detail Buku
    infoDetail.innerHTML = `
        <p><strong>Nama Buku</strong>: ${buku.namaBarang}</p>
        <p><strong>Kode Barang</strong>: ${buku.kodeBarang}</p>
        <p><strong>Kode Lokasi</strong>: ${buku.kodeLokasi}</p>
        <p><strong>Jenis</strong>: ${buku.jenisBarang}</p>
        <p><strong>Edisi</strong>: ${buku.edisi}</p>
        <p><strong>Stok</strong>: ${buku.stok}</p>
    `;

    //Tampilkan Modal
    bukamodal(modalId);
}

// form Tambah Buku
document.getElementById('form-tambah-buku').addEventListener('submit', tambahBukuBaru);

function tambahBukuBaru(event) {
    // Mencegah halaman reload
    event.preventDefault(); 

    // Input Form
     const nama = document.getElementById('nama-barang').value.trim();
    const kodeBarang = document.getElementById('kode-barang').value.trim().toUpperCase();
    const jenis = document.getElementById('jenis-barang').value;
    const kodeLokasi = document.getElementById('kode-lokasi').value.trim();
    const edisi = document.getElementById('edisi').value.trim();
    const stok = parseInt(document.getElementById('stok').value);
    const fileInput = document.getElementById('input-cover');
    const file = fileInput.files[0];

    //Validasi sederhana
    if (!nama || !kodeBarang || !jenis || !kodeLokasi || !edisi || isNaN(stok) || stok < 1 || !file) {
        alert("Harap isi semua kolom dengan benar.");
        return;
    }

    //Cek apakah Kode Barang sudah ada atau belum
    const kodeSudahAda = dataBahanAjar.some(b => b.kodeBarang === kodeBarang);
    if (kodeSudahAda) {
        alert(`Gagal: Kode Barang ${kodeBarang} sudah ada dalam daftar.`);
        return;
    }

    // Proses file gambar
    const coverUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = function(e) {
        const coverDataUrl = e.target.result;
    }
    
    //Buat objek buku baru
    const bukuBaru = {
        kodeLokasi: kodeLokasi,
        kodeBarang: kodeBarang,
        namaBarang: nama,
        jenisBarang: jenis,
        edisi: edisi,
        stok: stok,
        cover: coverUrl
    };

    //Simpan ke array dataBahanAjar
    dataBahanAjar.push(bukuBaru);

    //Tampilkan notifikasi dan reset
    alert(`Buku "${nama}" (Kode: ${kodeBarang}) berhasil ditambahkan dengan stok ${stok}!`);
    renderUlangDaftarBuku(); 

    document.getElementById('form-tambah-buku').reset();
    document.getElementById('preview-gambar').style.display = 'none';
    tutupmodal('modal-tambah-buku');

    reader.onerror = function() {
        alert('Error membaca file. Coba lagi.');
    };
    
    reader.readAsDataURL(file);
}

// Preview gambar sebelum upload
document.getElementById('input-cover').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('preview-gambar');
    const previewImg = document.getElementById('preview-img');
    
    if (file) {
        // Validasi ukuran file (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('Ukuran file terlalu besar. Maksimal 10MB.');
            this.value = '';
            previewDiv.style.display = 'none';
            return;
        }
        
        // Validasi tipe file
        if (!file.type.match('image.*')) {
            alert('Hanya file gambar yang diizinkan.');
            this.value = '';
            previewDiv.style.display = 'none';
            return;
        }
        
        // Tampilkan preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewDiv.style.display = 'block';
        }
        reader.readAsDataURL(file);
    } else {
        previewDiv.style.display = 'none';
    }
});

// Fungsi untuk menampilkan buku dari dataBahanAjar
function tampilkanBuku() {
    const kontenGrid = document.getElementById('daftar-buku');
    
    if (!kontenGrid) {
        console.error('Elemen #daftar-buku tidak ditemukan');
        return;
    }
    
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

//mencari data tracking
function caridatatracking(event) {
    const nomorDO = document.getElementById('nomor-do').value.trim();
    document.getElementById('form-tracking').addEventListener('submit', function(event) {
        // Mencegah form reload halaman
        event.preventDefault();
        caridatatracking();
    });

    if (!nomorDO) {
        alert("Harap masukkan Nomor Delivery Order (DO)");
        return;
    }
    
    const dataTrackingDitemukan = dataTracking[nomorDO];
    tampilkanHasilTracking(dataTrackingDitemukan);
}

// hasil tracking
function tampilkanHasilTracking(data) {
    const hasilTracking = document.getElementById('hasil-tracking');
    const detailPengiriman = document.getElementById('detail-pengiriman');
    
    if (!data) {
        detailPengiriman.innerHTML = '<p>Nomor DO tidak ditemukan</p>';
        hasilTracking.style.display = 'block';
        return;
    }
    
    //warna status berdasarkan status pengiriman
    let warnaStatus = 'orange';
    if (data.status === 'Dikirim') {
        warnaStatus = 'blue';
    } else if (data.status === 'Selesai') {
        warnaStatus = 'green';
    }
    
    //HTML detail pengiriman
    let html = `
        <div class="info-pengiriman">
            <p><strong>Nomor DO:</strong> ${data.nomorDO}</p>
            <p><strong>Nama Mahasiswa:</strong> ${data.nama}</p>
            <p><strong>Status:</strong> <span style="color: ${warnaStatus}">${data.status}</span></p>
            <p><strong>Ekspedisi:</strong> ${data.ekspedisi}</p>
            <p><strong>Tanggal Kirim:</strong> ${data.tanggalKirim}</p>
            <p><strong>Jenis Paket:</strong> ${data.paket}</p>
            <p><strong>Total Pembayaran:</strong> ${data.total}</p>
        </div>
    `;
    
    // riwayat perjalanan
    if (data.perjalanan && data.perjalanan.length > 0) {
        html += '<div class="riwayat-perjalanan"><h3>Riwayat Perjalanan</h3><ul><div class="timeline">';
        
        data.perjalanan.forEach((perjalanan, index) => {
            const isLast = index === data.perjalanan.length - 1;
            html += `
                <div class="timeline-item ${isLast ? 'timeline-item-last' : ''}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <div class="timeline-waktu">${perjalanan.waktu}</div>
                        <div class="timeline-keterangan">${perjalanan.keterangan}</div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        html += '</ul></div>';
    }
    
    detailPengiriman.innerHTML = html;
    hasilTracking.style.display = 'block';
}