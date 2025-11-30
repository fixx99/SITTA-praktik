const { createApp } = Vue;

createApp({
    data() {
        return {
            // Data dasar untuk filter
            upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
            kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],

            // Data buku utama
            daftarBuku: [],
            isLoading: true,
                    
            // Filter state
            filterUpbjj: '',
            filterKategori: '',
            filterStatus: '',
            sortBy: 'judul',
                    
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
            statusClass: 'status-menunggu',
            pencarianKeyword: ''
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
                buku = buku.filter(b => b.kategori === this.filterKategori);
            }
                        
            // Filter berdasarkan status stok
            if (this.filterStatus) {
                if (this.filterStatus === 'kosong') {
                    buku = buku.filter(b => b.qty === 0);
                } else if (this.filterStatus === 'menipis') {
                    buku = buku.filter(b => b.qty > 0 && b.qty < b.safety);
                } else if (this.filterStatus === 'aman') {
                    buku = buku.filter(b => b.qty >= b.safety);
                }
            }

            if (this.pencarianKeyword) {
                const keyword = this.pencarianKeyword.toLowerCase();
                buku = buku.filter(b => 
                    b.judul.toLowerCase().includes(keyword) ||
                    b.kode.toLowerCase().includes(keyword) ||
                    b.lokasiRak.toLowerCase().includes(keyword)
                );
            }
                        
            // Sorting berdasarkan pilihan user
            if (this.sortBy === 'judul') {
                // Urutkan berdasarkan judul buku (A-Z)
                buku.sort((a, b) => a.judul.localeCompare(b.judul));
            } else if (this.sortBy === 'stok') {
                // Urutkan berdasarkan stok (terbanyak ke terkecil)
                buku.sort((a, b) => b.qty - a.qty);
            } else if (this.sortBy === 'kodeBarang') {
                // Urutkan berdasarkan kode barang (A-Z)
                buku.sort((a, b) => a.kodeBarang.localeCompare(b.kode));
            } else if(this.sortBy === 'harga'){
                buku.sort((a,b)=> (b.harga || 0) - (a.harga || 0));
            }return buku;
        },
        
        //statistik stok
        statistikStok() {
            const total = this.daftarBuku.length;
            const kosong = this.daftarBuku.filter(b => b.qty === 0).length;
            const menipis = this.daftarBuku.filter(b => b.qty > 0 && b.qty < b.safety).length;
            const aman = this.daftarBuku.filter(b => b.qty >= b.safety).length;
                
            return {
                total,
                kosong,
                menipis,
                aman,
                persenKosong: total > 0 ? ((kosong / total) * 100).toFixed(1) : 0,
                persenMenipis: total > 0 ? ((menipis / total) * 100).toFixed(1) : 0,
                persenAman: total > 0 ? ((aman / total) * 100).toFixed(1) : 0
            };
        }
    },
            
    methods: {
        /*Load data dari berbagai sumber*/
        async loadDataFromAPI() {
            this.isLoading = true;
            try {
                // Load data buku
                const bukuData = await ApiService.getStokBuku();
                this.daftarBuku = bukuData;
                
                // Load dropdown data
                const list = await ApiService.getList();
                this.upbjjList = list.upbjjList;
                this.kategoriList = list.kategoriList;
                
                console.log('Data stok berhasil di-load:', this.daftarBuku.length, 'buku');
            } catch (error) {
                console.error('Error loading data:', error);
                alert('Gagal memuat data stok');
            } finally {
                this.isLoading = false;
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
                    judul: "Pengantar Manajemen",
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
                    judul: "Pengantar Akuntansi",
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
                    judul: "Biologi Umum (Praktikum)",
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
                    judul: "Dasar-Dasar Sosiologi",
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
        if (buku.qty === 0) return 'badge-error';
        if (buku.qty < buku.safety) return 'badge-warning';
        return 'badge-success';
        },
                
        /*Method untuk mendapatkan teks status berdasarkan stok*/
        getStatusText(buku) {
            if (buku.qty === 0) return 'Stock bahan ajar kosong.';
            if (buku.qty < buku.safety) return 'Stock bahan ajar menipis.';
            return 'Stock bahan ajar aman.';
        },

        getStatusIcon(buku) {
            if (!buku || buku.qty === undefined) return 'fas fa-circle';
            if (buku.qty === 0) return 'fas fa-times-circle';
            if (buku.qty < (buku.safety || 5)) return 'fas fa-exclamation-triangle';
            return 'fas fa-check-circle';
        },
                
        /*Handler untuk error loading gambar*/
        gambarError(event) {
            // Jika gambar error, ganti dengan gambar default
            event.target.src = 'img/default-cover.jpg';
            event.target.onerror = null;
        },
                
        /* Reset semua filter ke nilai default*/
        resetFilter() {
            this.filterUpbjj = '';
            this.filterKategori = '',
            this.filterStatus = '';
            this.sortBy = 'judul';
            this.pencarianKeyword = '';
        },
                
        // Buka modal detail buku
        bukaDetail(buku) {
            this.bukuDetail = buku;
            this.modalDetailAktif = true;
        },

        // Tutup modal detail buku
        tutupDetail() {
            this.modalDetailAktif = false;
            this.bukuDetail = {};
        },

        // Method untuk show notification badge
        showBadgeNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `status-badge ${this.getStatusClass({tipe: type})} notification-badge`;
            notification.innerHTML = `
                <i class="${this.getStatusIcon(type)}"></i>
                ${message}
            `;
            
            // Style untuk notification
            notification.style.position = 'fixed';
            notification.style.top = '20px';
            notification.style.right = '20px';
            notification.style.zIndex = '1000';
            notification.style.animation = 'slideIn 0.3s ease';
            
            document.body.appendChild(notification);
            
            // Auto remove setelah 3 detik
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },
                
        //Edit stok buku via prompt
        async editStokBuku(buku) {
            const stokBaru = prompt(`Edit stok untuk ${buku.judul}:`, buku.qty);
            if (stokBaru !== null && !isNaN(stokBaru)) {
                const stokNum = parseInt(stokBaru);
                if (stokNum >= 0) {
                    try {
                        const result = await ApiService.updateStokBuku(buku.kode, stokNum);
                        if (result.success) {
                            const index = this.daftarBuku.findIndex(b => b.kode === buku.kode);
                            if (index !== -1) {
                                const newDaftarBuku = [...this.daftarBuku];
                                newDaftarBuku[index] = { ...newDaftarBuku[index], qty: stokNum };
                                this.daftarBuku = newDaftarBuku;
                            }
                            if (this.modalDetailAktif && this.bukuDetail.kode === buku.kode) {
                                this.bukuDetail = { ...this.bukuDetail, qty: stokNum };
                            }
                            
                            this.showBadgeNotification('Stok berhasil diupdate!', 'success');
                        } else {
                            alert(result.error || 'Gagal update stok');
                        }
                    } catch (error) {
                        console.error('Update stok error:', error);
                        alert('Error update stok');
                    }
                } else {
                    alert('Stok tidak boleh negatif');
                }
            }
        },
                        
        /*Tambah buku baru ke daftar*/
        async tambahBukuBaru() {
            // Validasi input
            if (!this.bukuBaru.kodeBarang || !this.bukuBaru.namaBarang) {
                alert('Kode Barang dan Nama Buku harus diisi');
                return;
            }
                    
            try {
                const result = await ApiService.tambahBukuBaru(this.bukuBaru);
                
                if (result.success) {
                    // Tambahkan ke daftar lokal
                    this.daftarBuku.push(result.buku);
                    
                    this.resetFormBukuBaru();
                    this.tampilkanModalTambah = false;
                    alert('Buku berhasil ditambahkan!');
                } else {
                    alert(result.error || 'Gagal menambah buku');
                }
            } catch (error) {
                console.error('Tambah buku error:', error);
                alert('Error menambah buku');
            }
                    
            this.showBadgeNotification('Buku berhasil ditambahkan!','succes');
        },
                
        // Reset form tambah buku
        resetFormBukuBaru() {
            this.bukuBaru = {
                kodeBarang: '',
                judul: '',
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
                                newValue.judul && 
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
        }
    },
            
    //Lifecycle hook - dijalankan ketika komponen Vue dimount
    mounted() {
        this.loadDataFromAPI();
        console.log('Aplikasi Stok berhasil dimuat dengan', this.daftarBuku.length, 'buku');
    }
}).mount('#stok-app');