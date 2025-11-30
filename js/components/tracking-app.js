const { createApp } = Vue;
    createApp({
        data(){
            return{
                //data untuk pencarian DO
                nomorDO: '',
                hasilTracking: null,
                showHasilTracking: false,
                //data membuat DO baru
                showFormDOBaru: false,
                doBaru: {
                    nim: '',
                    nama: '',
                    ekspedisi: '',
                    paket: '',
                    tanggalKirim: new Date().toISOString().split('T')[0]
                },

                //data droodwn option
                ekspedisiList: [],
                paketList: [],

                //daftar DO
                daftarDO: [],
                doCounter: 1,

                statusFormDO: 'menunggu semua kolom terisi.',
                statusClassDO: 'status-tunggu',
                isLoading: false
            }
        },

        computed: {
            // nomor do otomatis
            nomorDOOtomatis() {
                const tahun = new Date().getFullYear();
                const sequence = (this.doCounter).toString().padStart(4, '0');
                return `DO${tahun}-${sequence}`;
            },
            
            // detail paket yg dipilih
            detailPaket() {
                if (!this.doBaru.paket) return null;
                return this.paketList.find(p => p.kode === this.doBaru.paket);
            },
            
            // total harga otomatis
            totalHarga() {
                if (!this.detailPaket) return 0;
                return this.detailPaket.harga;
            },
            
            // format harga rupiah
            totalHargaFormatted() {
                return new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                }).format(this.totalHarga);
            },

            jumlahPengirimanAktif() {
                if (!this.daftarDO || this.daftarDO.length === 0) return 0;
                
                const aktif = this.daftarDO.filter(doItem => {
                    return doItem.status && 
                        doItem.status !== 'Selesai' && 
                        doItem.status !== 'Ditolak';
                }).length;
                
                console.log('Pengiriman aktif dihitung:', aktif, 'dari total:', this.daftarDO.length);
                return aktif;
            }
        },

        methods: {
            // cari do 
            async cariDO() {
                const nomorCari = this.nomorDO.trim();
                
                if (!nomorCari) {
                    alert('Harap masukkan nomor DO');
                    return;
                }
                
                console.log('Mencari DO:', nomorCari);
                this.isLoading = true;
                this.hasilTracking = null;
                this.showHasilTracking = true;

                try {
                    // 1. Cari di localStorage (DO dari order dan tracking)
                    const doLocal = this.daftarDO.find(doItem => doItem.nomor === nomorCari);
                    if (doLocal) {
                        this.hasilTracking = doLocal;
                        console.log('DO ditemukan di localStorage:', doLocal);
                        return;
                    }
                    
                    // 2. Cari di API/data JSON (data statis)
                    const trackingData = await ApiService.getTrackingData(nomorCari);
                    if (trackingData) {
                        this.hasilTracking = trackingData;
                        console.log('DO ditemukan di API:', trackingData);
                        return;
                    }
                    
                    // 3. Tidak ditemukan
                    this.hasilTracking = null;
                    alert('Nomor DO tidak ditemukan. Pastikan nomor DO sudah benar.');
                    
                } catch (error) {
                    console.error('Cari DO error:', error);
                    alert('Error mencari DO');
                } finally {
                    this.isLoading = false;
                }
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
                        
            // buat do baru
            async buatDOBaru() {
                // validasi input
                if (!this.doBaru.nim || !this.doBaru.nama || !this.doBaru.ekspedisi || !this.doBaru.paket) {
                    alert('Harap lengkapi semua data yang diperlukan');
                    return;
                }

                this.isLoading = true;

                try {
                    const result = await ApiService.buatDOBaru({
                        nim: this.doBaru.nim,
                        nama: this.doBaru.nama,
                        ekspedisi: this.doBaru.ekspedisi,
                        paket: this.doBaru.paket,
                        tanggalKirim: this.doBaru.tanggalKirim,
                        total: this.totalHarga
                    });
                    
                    if (result.success) {
                        // Simpan ke localStorage untuk akses cepat
                        this.daftarDO.push(result.do);
                        this.doCounter++;
                        this.simpanKeLocalStorage();
                        
                        this.resetFormDOBaru();
                        this.showFormDOBaru = false;
                        
                        this.showBadgeNotification(`DO berhasil dibuat!\nNomor DO: ${result.do.nomor}`, 'succes');

                        // Otomatis tampilkan hasil
                        this.nomorDO = result.do.nomor;
                        this.hasilTracking = result.do;
                        this.showHasilTracking = true;
                    } else {
                        this.showBadgeNotification(result.error || 'Gagal membuat DO', 'error');
                    }
                } catch (error) {
                    console.error('Buat DO error:', error);
                    this.showBadgeNotification('Error membuat DO', 'error');
                } finally {
                    this.isLoading = false;
                }

                console.log('Membuat Do baru:', doBaru);
                
                // tambah ke dafar do
                this.daftarDO.push(doBaru);

                //increment counter
                this.doCounter++;
                
                // simpan di local
                this.simpanKeLocalStorage();
                
                //reset
                this.resetFormDOBaru();
                
                //tutup
                this.showFormDOBaru = false;

                console.log('DO Counter setelah buat:', this.doCounter);
                console.log('Daftar DO setelah buat:', this.daftarDO);
            },
            
            // reset form do baru
            resetFormDOBaru() {
                this.doBaru = {
                    nim: '',
                    nama: '',
                    ekspedisi: '',
                    paket: '',
                    tanggalKirim: new Date().toISOString().split('T')[0]
                };
            },
            
            // toggle form do baru
            toggleFormDOBaru() {
                this.showFormDOBaru = !this.showFormDOBaru;
                if (this.showFormDOBaru) {
                    this.showHasilTracking = false;
                    this.hasilTracking = null;
                }
            },
            
            // simpan di local
            simpanKeLocalStorage() {
                localStorage.setItem('daftarDO', JSON.stringify(this.daftarDO));
                localStorage.setItem('doCounter', this.doCounter.toString());
                console.log('Data disimpan - Counter:', this.doCounter, 'Daftar DO:', this.daftarDO);
            },
            
            // load data dari local 
            loadDariLocalStorage() {
                try {
                    const savedData = localStorage.getItem('daftarDO');
                    if (savedData) {
                        this.daftarDO = JSON.parse(savedData);
                        console.log('Data DO dari localStorage:', this.daftarDO);
                        // Hitung pengiriman aktif
                        const pengirimanAktif = this.daftarDO.filter(doItem => 
                            doItem.status && 
                            doItem.status !== 'Selesai' && 
                            doItem.status !== 'Ditolak'
                        ).length;
                        
                        console.log('Pengiriman aktif:', pengirimanAktif);
                    } else {
                        this.daftarDO = [];
                        console.log('Tidak ada data DO di localStorage');
                    }

                    const savedCounter = localStorage.getItem('doCounter');
                    if (savedCounter) {
                        this.doCounter = parseInt(savedCounter);
                        console.log('DO Counter:', this.doCounter);
                    } else {
                        // Cari counter dari DO yang ada
                        const maxCounter = this.daftarDO.reduce((max, doItem) => {
                            const match = doItem.nomor?.match(/DO\d+-(\d+)/);
                            if (match) {
                                const counter = parseInt(match[1]);
                                return Math.max(max, counter);
                            }
                            return max;
                        }, 0);
                        
                        this.doCounter = maxCounter + 1;
                        console.log('DO Counter dihitung dari data:', this.doCounter);
                    }
                } catch (error) {
                    console.error('Error loading from localStorage:', error);
                    this.daftarDO = [];
                    this.doCounter = 4;
                }
            },
            
            // load data dari sumber
            async loadDataFromAPI() {
                try {
                    this.paketList = await ApiService.getAllPaket();
                    const list = await ApiService.getList();
                    this.ekspedisiList = list.ekspedisiList;
                } catch (error) {
                    console.error('Load data error:', error);
                    alert('Gagal memuat data paket dan ekspedisi');
                    }
            },
            
            // nama ekspedisi dari kode
            getNamaEkspedisi(kode) {
                const ekspedisi = this.ekspedisiList.find(e => e.kode === kode);
                return ekspedisi ? ekspedisi.nama : kode;
            },
            
            // nama paket dari kode
            getNamaPaket(kode) {
                const paket = this.paketList.find(p => p.kode === kode);
                return paket ? paket.nama : kode;
            },
            
            // format tanggal
            formatTanggal(tanggal) {
                return new Date(tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            },
            
            getTrackingBadgeClass(status) {
                const classMap = {
                    'Diproses': 'badge-info',
                    'Dikirim': 'badge-warning', 
                    'Selesai': 'badge-success',
                    'Dalam Perjalanan': 'badge-info',
                    'Ditolak': 'badge-error'
                };
                return classMap[status] || 'badge-default';
            },

            getTrackingIcon(status) {
                const iconMap = {
                    'Diproses': 'fas fa-spinner',
                    'Dikirim': 'fas fa-shipping-fast', 
                    'Selesai': 'fas fa-check-circle',
                    'Dalam Perjalanan': 'fas fa-truck',
                    'Ditolak': 'fas fa-times-circle'
                };
                return iconMap[status] || 'fas fa-circle';
            },

            getStatusColor(status) {
                const colors = {
                    'Diproses': '#ffc107',
                    'Dikirim': '#007bff', 
                    'Selesai': '#28a745',
                    'Dalam Perjalanan': '#17a2b8'
                };
                return colors[status] || '#6c757d';
            },
        },
        
        watch: {
            // Watcher untuk memantau semua field dalam doBaru
            'doBaru': {
                handler(newValue) {
                    // Cek apakah semua field wajib sudah terisi
                    const semuaTerisi = newValue.nim && 
                                    newValue.nama && 
                                    newValue.ekspedisi && 
                                    newValue.paket && 
                                    newValue.tanggalKirim;
                    
                    if (semuaTerisi) {
                        this.statusFormDO = 'semua kolom sudah di isi.';
                        this.statusClassDO = 'status-siap';
                    } else {
                        this.statusFormDO = 'menunggu semua kolom terisi.';
                        this.statusClassDO = 'status-tunggu';
                    }
                },
                deep: true,
                immediate: true
            }
        },

        // dijalankan ketika apk dimuat pertama kali
        mounted() {
            this.loadDariLocalStorage();
            this.loadDataPaket();
            if (typeof dataBahanAjarV3 !== 'undefined' && dataBahanAjarV3.tracking) {
                for (let nomor in dataBahanAjarV3.tracking) {
                const sudahAda = this.daftarDO.some(item => item.nomor === nomor);
                if (!sudahAda) {
                    this.daftarDO.push({
                    nomor,
                    ...dataBahanAjarV3.tracking[nomor]
                    });
                }
                }
                this.simpanKeLocalStorage();
            }
            console.log('Aplikasi Tracking DO siap digunakan');
            console.log('Daftar DO:', this.daftarDO);
            console.log('DO Counter:', this.doCounter);
            console.log('Data tracking dari data.js:', dataTracking);
            console.log('Data tracking dari dataBahanAjarV3:', dataBahanAjarV3 ? dataBahanAjarV3.tracking : 'tidak ada');
        }

    }).mount('#tracking-app');    