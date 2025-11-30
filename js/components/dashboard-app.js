const { createApp } = Vue;

createApp({
    data() {
        return {
            daftarBuku: [],
            daftarDO: [],
            isLoading: true
        }
    },
    
    computed: {
        statistikStok() {
            const total = this.daftarBuku.length;
            const kosong = this.daftarBuku.filter(b => b.qty === 0).length;
            const menipis = this.daftarBuku.filter(b => b.qty > 0 && b.qty < b.safety).length;
            const aman = this.daftarBuku.filter(b => b.qty >= b.safety).length;
                
            return {
                total,
                kosong,
                menipis,
                aman
            };
        },
        
        statistikPengiriman() {
            console.log('Data DO untuk statistik:', this.daftarDO);
            
            const total = this.daftarDO.length;
            const aktif = this.daftarDO.filter(doItem => {
                const status = doItem.status || '';
                return status === 'Diproses' || status === 'Dikirim' || status === 'Dalam Perjalanan';
            }).length;
            
            const selesai = this.daftarDO.filter(doItem => {
                const status = doItem.status || '';
                return status === 'Selesai';
            }).length;
            
            const ditolak = this.daftarDO.filter(doItem => {
                const status = doItem.status || '';
                return status === 'Ditolak';
            }).length;
            
            console.log('Statistik pengiriman:', { total, aktif, selesai, ditolak });
            
            return {
                total,
                aktif,
                selesai,
                ditolak
            };
        }
    },
    
    methods: {
        async loadData() {
            this.isLoading = true;
            try {
                // Load data buku dari API
                const bukuData = await ApiService.getStokBuku();
                this.daftarBuku = bukuData;
                
                // Load data DO
                await this.loadAllTrackingData();
                
                console.log('Data dashboard berhasil di-load:', {
                    buku: this.daftarBuku.length,
                    do: this.daftarDO.length,
                    doData: this.daftarDO
                });
            } catch (error) {
                console.error('Error loading dashboard data:', error);
                // Fallback data
                this.daftarBuku = this.getFallbackBukuData();
                await this.loadAllTrackingData();
            } finally {
                this.isLoading = false;
            }
        },
        
        async loadAllTrackingData() {
            // Reset daftar DO
            this.daftarDO = [];
            
            // 1. Load dari localStorage (DO yang dibuat user)
            this.loadDariLocalStorage();
            
            // 2. Load dari API/data JSON
            await this.loadTrackingFromAPI();
            
            console.log('Total DO setelah load semua:', this.daftarDO.length);
        },
        
        loadDariLocalStorage() {
            const savedData = localStorage.getItem('daftarDO');
            if (savedData) {
                try {
                    const doData = JSON.parse(savedData);
                    // Pastikan doData adalah array
                    if (Array.isArray(doData)) {
                        this.daftarDO = [...this.daftarDO, ...doData];
                        console.log('Data DO dari localStorage:', doData.length, 'items');
                    }
                } catch (error) {
                    console.error('Error parsing localStorage data:', error);
                }
            }
        },
        
        async loadTrackingFromAPI() {
            try {
                // Load data tracking dari JSON melalui API
                const data = await ApiService.fetchData();
                console.log('Data tracking dari API:', data.tracking);
                
                if (data.tracking && Array.isArray(data.tracking)) {
                    data.tracking.forEach(trackingItem => {
                        // Struktur tracking: [{ "DO2025-0001": { ... } }, { "2023001234": { ... } }]
                        Object.keys(trackingItem).forEach(nomorDO => {
                            const doData = trackingItem[nomorDO];
                            
                            // Format data DO yang konsisten
                            const formattedDO = {
                                nomor: nomorDO,
                                nim: doData.nim || '',
                                nama: doData.nama || '',
                                status: doData.status || '',
                                ekspedisi: doData.ekspedisi || '',
                                tanggalKirim: doData.tanggalKirim || '',
                                paket: doData.paket || '',
                                total: doData.total || 0,
                                perjalanan: doData.perjalanan || []
                            };
                            
                            // Cek apakah DO sudah ada untuk menghindari duplikat
                            const sudahAda = this.daftarDO.some(item => item.nomor === nomorDO);
                            if (!sudahAda) {
                                this.daftarDO.push(formattedDO);
                                console.log('DO dari JSON ditambahkan:', nomorDO, formattedDO.status);
                            }
                        });
                    });
                }
                
                console.log('Total DO setelah load API:', this.daftarDO.length);
                
            } catch (error) {
                console.error('Error loading tracking data from API:', error);
            }
        },
        
        getFallbackBukuData() {
            return [
                {
                    kode: "EKMA4116",
                    judul: "Pengantar Manajemen",
                    kategori: "MK Wajib",
                    lokasiRak: "R1-A3",
                    edisi: "-",
                    qty: 28,
                    safety: 8,
                    upbjj: "Jakarta",
                    gambar: "img/Pengantar manajemen EKMA4116.jpg",
                    catatanHTML: "Edisi 2024, cetak ulang"
                },
                {
                    kode: "EKMA4115",
                    judul: "Pengantar Akuntansi",
                    kategori: "MK Wajib",
                    lokasiRak: "R1-A4",
                    edisi: "-",
                    qty: 7,
                    safety: 15,
                    upbjj: "Jakarta",
                    gambar: "img/Pengantar Akuntansi EKMA411502.jpg",
                    catatanHTML: "Cover baru"
                }
            ];
        }
    },
    
    mounted() {
        this.loadData();
        console.log('Dashboard app mounted');
    }
}).mount('#dashboard-stats');