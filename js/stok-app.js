const { createApp } = Vue;

createApp({
    data() {
        return {
            // Data dasar untuk filter
            upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
            kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],

            // Data buku utama
            daftarBuku: [],
                    
            // Filter state
            filterUpbjj: '',
            filterKategori: '',
            filterStatus: '',
            sortBy: 'namaBarang',
                    
            // Modal states
            tampilkanModalTambah: false,
            modalDetailAktif: false,
            bukuDetail: {},
                    
            // Data untuk buku baru
            bukuBaru: {
                kodeBarang: '',
                namaBarang: '',
                jenisBarang: 'BMP',
                kodeLokasi: '',
                edisi: '',
                stok: 0,
                safetyStock: 0,
                upbjj: '',
                cover: '',
                catatan: ''
            },

            statusForm: 'menunggu semua kolom terisi.',
            statusClass: 'status-menunggu'
        }
    },
            
    computed: {
        /*Computed property untuk buku yang sudah difilter dan diurutkan
        Ini akan otomatis update ketika filter berubah*/
        bukuTerfilter() {
            // Salin array buku untuk menghindari mutasi data asli
            let buku = [...this.daftarBuku];
                        
            // Filter berdasarkan UT-Daerah
            if (this.filterUpbjj) {
                buku = buku.filter(b => b.upbjj === this.filterUpbjj);
            }

            if (this.filterKategori) {
            buku = buku.filter(b => b.jenisBarang === this.filterKategori);
            }
                        
            // Filter berdasarkan status stok
            if (this.filterStatus) {
                if (this.filterStatus === 'kosong') {
                    buku = buku.filter(b => b.stok === 0);
                } else if (this.filterStatus === 'menipis') {
                    buku = buku.filter(b => b.stok > 0 && b.stok < (b.safetyStock || 0));
                } else if (this.filterStatus === 'aman') {
                    buku = buku.filter(b => b.stok >= (b.safetyStock || 0));
                }
            }
                        
            // Sorting berdasarkan pilihan user
            if (this.sortBy === 'namaBarang') {
                // Urutkan berdasarkan judul buku (A-Z)
                buku.sort((a, b) => a.namaBarang.localeCompare(b.namaBarang));
            } else if (this.sortBy === 'stok') {
                // Urutkan berdasarkan stok (terbanyak ke terkecil)
                buku.sort((a, b) => b.stok - a.stok);
            } else if (this.sortBy === 'kodeBarang') {
                // Urutkan berdasarkan kode barang (A-Z)
                buku.sort((a, b) => a.kodeBarang.localeCompare(b.kodeBarang));
            } else if(this.sortBy === 'harga'){
                buku.sort((a,b)=> (b.harga || 0) - (a.harga || 0));
            }return buku;
        }
    },
            
    methods: {
        /*Load data dari data.js*/
        loadDataDariSumber() {
            let sumberData = [];
                    
            // Load dari dataBahanAjar (dari data.js)
            if (typeof dataBahanAjar !== 'undefined' && Array.isArray(dataBahanAjar)) {
                sumberData = sumberData.concat(dataBahanAjar.map(item => ({
                    kodeBarang: item.kodeBarang,
                    namaBarang: item.namaBarang,
                    jenisBarang: item.jenisBarang || 'BMP',
                    kodeLokasi: item.kodeLokasi,
                    edisi: item.edisi || '-',
                    stok: item.stok || 0,
                    safetyStock: item.safetyStock || Math.floor((item.stok || 0) * 0.3),
                    upbjj: this.getRandomUpbjj(),
                    cover: item.cover || 'img/default-cover.jpg',
                    catatan: item.catatan || this.generateCatatan(item),
                    harga: item.harga || 0
                })));
            }

            //load dari app
            if (typeof dataBahanAjarV3.stok !== 'undefined' && dataBahanAjarV3.stok && Array.isArray(dataBahanAjarV3.stok)) {
                sumberData = sumberData.concat(dataBahanAjarV3.stok.map(item => ({
                    kodeBarang: item.kode || item.kodeBarang || '-',
                    namaBarang: item.judul || item.namaBarang || 'Tanpa Nama',
                    jenisBarang: item.kategori || item.jenisBarang || 'BMP',
                    kodeLokasi: item.lokasiRak || item.kodeLokasi || 'R0-UNK',
                    edisi: item.edisi || '-',
                    stok: item.qty || item.stok || 0,
                    safetyStock: item.safety || Math.floor((item.qty || 0) * 0.3),
                    upbjj: item.upbjj || this.getRandomUpbjj(),
                    cover: item.gambar || item.cover || 'img/default-cover.jpg',
                    catatan: item.catatanHTML || item.catatan || this.generateCatatan(item),
                    harga: item.harga || 0
                })));
            }

            // --- Gabungkan ke daftarBuku ---
            this.daftarBuku = sumberData;

            console.log("Total data termuat:", this.daftarBuku.length);
            console.table(this.daftarBuku);
                    
            // Jika tidak ada data, gunakan fallback
            if (sumberData.length === 0) {
                console.warn('Data dari sumber tidak ditemukan, menggunakan fallback.');
                sumberData = this.getFallbackData();
            }
           
            
        },
                
        /*Generate UPBJJ random untuk demo*/
        getRandomUpbjj() {
            const upbjj = this.upbjjList;
            return upbjj[Math.floor(Math.random() * upbjj.length)];
        },
                
        //Generate catatan otomatis berdasarkan data buku
        generateCatatan(buku) {
            const catatanList = [
                `Buku ${buku.jenisBarang || 'BMP'} untuk ${buku.namaBarang || buku.judul}`,
                `Edisi ${buku.edisi || '-'} - Stok tersedia`,
                `Bahan ajar ${buku.jenisBarang || 'BMP'} berkualitas`,
                `Distribusi ke berbagai UPBJJ`
            ];
            return catatanList[Math.floor(Math.random() * catatanList.length)];
        },
                
        // Fallback data untuk demo jika data utama tidak ada
        getFallbackData() {
            return [
                {
                    kodeBarang: "EKMA4116",
                    namaBarang: "Pengantar Manajemen",
                    jenisBarang: "MK Wajib",
                    kodeLokasi: "R1-A3",
                    edisi: "-",
                    stok: 28,
                    safetyStock: 8,
                    upbjj: "Jakarta",
                    gambar: "img/Pengantar manajemen EKMA4116.jpg",
                    catatan: "Edisi 2024, cetak ulang"
                },
                {
                    kodeBarang: "EKMA4115",
                    namaBarang: "Pengantar Akuntansi",
                    jenisBarang: "MK Wajib",
                    kodeLokasi: "R1-A4",
                    edisi: "-",
                    stok: 7,
                    safetyStock: 15,
                    upbjj: "Jakarta",
                    gambar: "img/Pengantar Akuntansi EKMA411502.jpg",
                    catatan: "Cover baru"
                },
                {
                    kodeBarang: "BIOL4201",
                    namaBarang: "Biologi Umum (Praktikum)",
                    jenisBarang: "Praktikum",
                    kodeLokasi: "R3-B2",
                    edisi: "-",
                    stok: 12,
                    safetyStock: 10,
                    upbjj: "Surabaya",
                    gambar: "img/Biologi umum BIOL411002.jpg",
                    catatan: "Butuh pendingin untuk kit basah"
                },
                {
                    kodeBarang: "FISIP4001",
                    namaBarang: "Dasar-Dasar Sosiologi",
                    jenisBarang: "MK Pilihan",
                    kodeLokasi: "R2-C1",
                    edisi: "-",
                    stok: 2,
                    safetyStock: 8,
                    upbjj: "Makassar",
                    cover: "img/default-cover.jpg",
                    catatan: "Stok menipis, prioritaskan reorder"
                }
            ];
        },
                
        // Method untuk mendapatkan class CSS berdasarkan status stok
        getStatusClass(buku) {
        if (buku.stok === 0) return 'status-kosong';
        if (buku.stok < (buku.safetyStock || 0)) return 'status-menipis';
            return 'status-aman';
        },
                
        /*Method untuk mendapatkan teks status berdasarkan stok*/
        getStatusText(buku) {
            if (buku.stok === 0) return 'Stock bahan ajar kosong.';
            if (buku.stok < (buku.safetyStock || 0)) return 'Stock bahan ajar menipis.';
            return 'Stock bahan ajar aman.';
        },
                
        /*Handler untuk error loading gambar*/
        gambarError(event) {
            // Jika gambar error, ganti dengan gambar default
            event.target.src = 'img/default-cover.jpg';
        },
                
        /* Reset semua filter ke nilai default*/
        resetFilter() {
            this.filterUpbjj = '';
            this.filterKategori = '',
            this.filterStatus = '';
            this.sortBy = 'namaBarang';
        },
                
        // Buka modal detail buku
        bukaDetail(buku) {
            this.bukuDetail = buku;
            this.modalDetailAktif = true;
        },

        // Tutup modal detail buku
        tutupDetail() {
            this.modalDetailAktif = true;
            this.bukuDetail = {};
        },
                
        //Edit stok buku via prompt
        editStokBuku(buku) {

            const stokBaru = prompt(`Edit stok untuk ${buku.namaBarang}:`, buku.stok);
            if (stokBaru !== null && !isNaN(stokBaru)) {
                const stokNum = parseInt(stokBaru);
                if (stokNum >= 0) {
                buku.stok = stokNum;
                    if (this.modalDetailAktif && this.bukuDetail.kodeBarang === buku.kodeBarang) {
                    this.bukuDetail.stok = stokNum;
                    }                         
                        alert('Stok berhasil diupdate!');
                    }   else {
                    alert('Stok tidak boleh negatif');
                }
            }
        },
                
        /*Tambah buku baru ke daftar*/
        tambahBukuBaru() {
            // Validasi input
            if (!this.bukuBaru.kodeBarang || !this.bukuBaru.namaBarang) {
                alert('Kode Barang dan Nama Buku harus diisi');
                return;
            }
                    
            // Validasi kode unik
            const kodeSudahAda = this.daftarBuku.some(b => b.kodeBarang === this.bukuBaru.kodeBarang);
            if (kodeSudahAda) {
                alert(`Kode Barang ${this.bukuBaru.kodeBarang} sudah ada!`);
                return;
            }
                    
            // Default cover jika tidak diisi
            const coverUrl = this.bukuBaru.cover || 'img/default-cover.jpg';
                    
            // Buat objek buku baru
            const bukuBaru = {
                kodeBarang: this.bukuBaru.kodeBarang,
                namaBarang: this.bukuBaru.namaBarang,
                jenisBarang: this.bukuBaru.jenisBarang,
                kodeLokasi: this.bukuBaru.kodeLokasi,
                edisi: this.bukuBaru.edisi,
                stok: parseInt(this.bukuBaru.stok),
                safetyStock: parseInt(this.bukuBaru.safetyStock),
                upbjj: this.bukuBaru.upbjj,
                cover: coverUrl,
                catatan: this.bukuBaru.catatan || `Buku ${this.bukuBaru.jenisBarang} baru ditambahkan`
            };
                    
            // Tambahkan ke daftar buku
            this.daftarBuku.push(bukuBaru);
                    
            // Reset form
            this.resetFormBukuBaru();
                    
            // Tutup modal
            this.tampilkanModalTambah = false;
                    
            alert('Buku berhasil ditambahkan!');
        },
                
        // Reset form tambah buku
        resetFormBukuBaru() {
            this.bukuBaru = {
                kodeBarang: '',
                namaBarang: '',
                jenisBarang: 'BMP',
                kodeLokasi: '',
                edisi: '',
                stok: 0,
                safetyStock: 0,
                upbjj: '',
                cover: '',
                catatan: ''
            };
        }
    },

    watch: {
        // Watcher untuk memantau semua field dalam bukuBaru
        'bukuBaru': {
            handler(newValue) {
                // Cek apakah semua field wajib sudah terisi
                const semuaTerisi = newValue.kodeBarang && 
                                newValue.namaBarang && 
                                newValue.kodeLokasi && 
                                newValue.edisi && 
                                newValue.upbjj;
                
                if (semuaTerisi) {
                    this.statusForm = 'semua kolom sudah di isi.';
                    this.statusClass = 'status-siap';
                } else {
                    this.statusForm = 'menunggu semua kolom terisi.';
                    this.statusClass = 'status-tunggu';
                }
            },
            deep: true, // Penting! untuk memantau perubahan nested object
            immediate: true // Jalankan segera saat komponen dimuat
        },
        
        // Watcher tambahan untuk memantau perubahan stok
        'bukuBaru.stok'(newStok) {
            console.log('Stok berubah:', newStok);
            if (newStok < 0) {
                alert('Stok tidak boleh negatif!');
                this.bukuBaru.stok = 0;
            }
        }
    },
            
    //Lifecycle hook - dijalankan ketika komponen Vue dimount
    mounted() {
        this.loadDataDariSumber();
        console.log('Aplikasi Stok berhasil dimuat dengan', this.daftarBuku.length, 'buku');
    }
}).mount('#stok-app');
