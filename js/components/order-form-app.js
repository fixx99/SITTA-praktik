const { createApp } = Vue;

createApp({
    data() {
        return {
            // Data form pemesanan
            formPemesanan: {
                nim: '',
                nama: '',
                email: '',
                telepon: '',
                alamat: '',
                paket: '',
                ekspedisi: '',
                catatan: '',
                metodePembayaran: 'transfer'
            },
            
            // Data untuk dropdown options
            daftarPaket: [],
            daftarEkspedisi: [],
            
            daftarMetodePembayaran: [
                { kode: 'transfer', nama: 'Transfer Bank' },
                { kode: 'kredit', nama: 'Kartu Kredit' },
                { kode: 'debit', nama: 'Kartu Debit' },
                { kode: 'cod', nama: 'Cash on Delivery' }
            ],
            
            // State untuk validasi dan UI
            errors: {},
            isLoading: false,
            isSubmitted: false,
            showSummary: false,
            nomorDO: '',

            statusForm: 'semua kolom harus terisi.',
            statusClass: 'status-tunggu'
        }
    },

    methods: {
        //Method untuk validasi form
        validasiForm() {   
            this.errors = {}; // Reset errors

            // Validasi NIM (8-12 digit)
            if (!this.formPemesanan.nim.trim()) {
                this.errors.nim = 'NIM harus diisi';
            } else if (!/^\d{8,12}$/.test(this.formPemesanan.nim)) {
                this.errors.nim = 'NIM harus 8-12 digit angka';
            }
            
            // Validasi Nama
            if (!this.formPemesanan.nama.trim()) {
                this.errors.nama = 'Nama lengkap harus diisi';
            }
            
            // Validasi Email
            if (!this.formPemesanan.email.trim()) {
                this.errors.email = 'Email harus diisi';
            } else if (!this.validasiEmail(this.formPemesanan.email)) {
                this.errors.email = 'Format email tidak valid';
            }
            
            // Validasi Telepon
            if (!this.formPemesanan.telepon.trim()) {
                this.errors.telepon = 'Nomor telepon harus diisi';
            } else if (!/^\d{10,13}$/.test(this.formPemesanan.telepon)) {
                this.errors.telepon = 'Nomor telepon harus 10-13 digit angka';
            }
            
            // Validasi Alamat
            if (!this.formPemesanan.alamat.trim()) {
                this.errors.alamat = 'Alamat pengiriman harus diisi';
            }
            
            // Validasi Paket
            if (!this.formPemesanan.paket) {
                this.errors.paket = 'Pilih paket yang diinginkan';
            }
            
            // Validasi Ekspedisi
            if (!this.formPemesanan.ekspedisi) {
                this.errors.ekspedisi = 'Pilih ekspedisi pengiriman';
            }
            
            // Jika ada error, tampilkan alert untuk error pertama
            if (Object.keys(this.errors).length > 0) {
                const firstError = Object.values(this.errors)[0];
                alert(firstError);
                return false;
            }
            
            return true; // Validasi berhasil
        },
        
        //Method untuk validasi format email
        validasiEmail(email) {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return regex.test(email);
        },
        
        //Method untuk submit form pemesanan
        async submitPemesanan() {
            console.log('Tombol submit diklik');
            
            // Validasi form
            if (!this.validasiForm()) {
                console.log('Validasi gagal');
                return;
            }
            
            this.isLoading = true;
            console.log('Memulai proses pemesanan...');
            
            try {
                // Siapkan data untuk DO
                const doData = {
                    nim: this.formPemesanan.nim,
                    nama: this.formPemesanan.nama,
                    email: this.formPemesanan.email,
                    telepon: this.formPemesanan.telepon,
                    alamat: this.formPemesanan.alamat,
                    paket: this.formPemesanan.paket,
                    ekspedisi: this.formPemesanan.ekspedisi,
                    catatan: this.formPemesanan.catatan,
                    metodePembayaran: this.formPemesanan.metodePembayaran,
                    total: this.totalBiaya,
                    detailPaket: this.detailPaketTerpilih,
                    detailEkspedisi: this.detailEkspedisiTerpilih
                };
                
                // Gunakan API service untuk membuat DO baru
                const result = await ApiService.buatDOBaru(doData);
                
                if (result.success) {
                    console.log('Pemesanan berhasil:', result.do);
                    
                    // Generate nomor DO dari API response
                    this.nomorDO = result.do.nomor;
                    
                    // Tampilkan summary
                    this.showSummary = true;
                    this.isSubmitted = true;
                    
                    alert(`Pemesanan berhasil!\nNomor DO: ${this.nomorDO}\nTotal: ${this.totalBiayaFormatted}`);
                    
                } else {
                    alert('Gagal membuat pesanan: ' + result.error);
                }
                
            } catch (error) {
                console.error('Error saat memproses pemesanan:', error);
                alert('Terjadi error saat memproses pemesanan. Silakan coba lagi.');
            } finally {
                this.isLoading = false;
            }
        },
        
        //Method untuk simulasi proses pemesanan
        simulasiProsesPemesanan() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve(true);
                }, 2000);
            });
        },
        
        // Method untuk reset form
        resetForm() {
            this.formPemesanan = {
                nim: '',
                nama: '',
                email: '',
                telepon: '',
                alamat: '',
                paket: '',
                ekspedisi: '',
                catatan: '',
                metodoPembayaran: 'transfer'
            };
            this.errors = {};
            this.isSubmitted = false;
            this.showSummary = false;
            this.nomorDO = '';
        },
        
        // Method untuk mendapatkan detail paket berdasarkan kode
        getDetailPaket(kode) {
            return this.daftarPaket.find(paket => paket.kode === kode) || {};
        },
        
        // Method untuk mendapatkan detail ekspedisi berdasarkan kode
        getDetailEkspedisi(kode) {
            return this.daftarEkspedisi.find(exp => exp.kode === kode) || {};
        },

        // Method untuk format rupiah
        formatRupiah(amount) {
            if (!amount) return 'Rp 0';
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(amount);
        },
                
        // Method untuk cetak pesanan
        cetakPesanan() {
            window.print();
        },
                
        // Method untuk load data tambahan
        async loadDataTambahan() {
            try {
                console.log('Loading data paket dan ekspedisi...');
                
                // Load data paket dari API
                const paketData = await ApiService.getAllPaket();
                this.daftarPaket = paketData || [];
                console.log('Paket loaded:', this.daftarPaket);
                
                // Load data ekspedisi dari API
                const listData = await ApiService.getList();
                this.daftarEkspedisi = listData.ekspedisiList || [];
                console.log('Ekspedisi loaded:', this.daftarEkspedisi);
                
                // Jika data kosong, gunakan fallback
                if (this.daftarPaket.length === 0) {
                    this.daftarPaket = [
                        { kode: 'PAKET-UT-001', nama: 'PAKET IPS Dasar', harga: 120000, deskripsi: 'Paket untuk mata kuliah IPS dasar', isi: ['EKMA4116', 'EKMA4115'] },
                        { kode: 'PAKET-UT-002', nama: 'PAKET IPA Dasar', harga: 140000, deskripsi: 'Paket untuk mata kuliah IPA dasar', isi: ['BIOL4201', 'FISIP4001'] }
                    ];
                }
                
                if (this.daftarEkspedisi.length === 0) {
                    this.daftarEkspedisi = [
                        { kode: 'JNE_REG', nama: 'JNE Regular', estimasi: '3-5 hari', biaya: 15000 },
                        { kode: 'JNE_EXP', nama: 'JNE Express', estimasi: '1-2 hari', biaya: 25000 },
                        { kode: 'POS_REG', nama: 'Pos Indonesia Regular', estimasi: '4-7 hari', biaya: 12000 },
                        { kode: 'POS_KILAT', nama: 'Pos Indonesia Kilat', estimasi: '2-3 hari', biaya: 20000 }
                    ];
                }

                if (this.daftarEkspedisi.length === 0) {
                    this.daftarEkspedisi = [
                        { kode: 'JNE_REG', nama: 'JNE Regular', estimasi: '3-5 hari', biaya: 15000 },
                        { kode: 'JNE_EXP', nama: 'JNE Express', estimasi: '1-2 hari', biaya: 25000 },
                        { kode: 'POS_REG', nama: 'Pos Indonesia Regular', estimasi: '4-7 hari', biaya: 12000 },
                        { kode: 'POS_KILAT', nama: 'Pos Indonesia Kilat', estimasi: '2-3 hari', biaya: 20000 }
                    ];
                }
                
            } catch (error) {
                console.error('Error loading data:', error);
                // Fallback data
                this.loadFallbackData();
            }
        },
        
        loadFallbackData() {
            this.daftarPaket = [
                { kode: 'PAKET-UT-001', nama: 'PAKET IPS Dasar', harga: 120000, deskripsi: 'Paket untuk mata kuliah IPS dasar', isi: ['EKMA4116', 'EKMA4115'] },
                { kode: 'PAKET-UT-002', nama: 'PAKET IPA Dasar', harga: 140000, deskripsi: 'Paket untuk mata kuliah IPA dasar', isi: ['BIOL4201', 'FISIP4001'] }
            ];
            
            this.daftarEkspedisi = [
                { kode: 'JNE_REG', nama: 'JNE Regular', estimasi: '3-5 hari', biaya: 15000 },
                { kode: 'JNE_EXP', nama: 'JNE Express', estimasi: '1-2 hari', biaya: 25000 },
                { kode: 'POS_REG', nama: 'Pos Indonesia Regular', estimasi: '4-7 hari', biaya: 12000 },
                { kode: 'POS_KILAT', nama: 'Pos Indonesia Kilat', estimasi: '2-3 hari', biaya: 20000 }
            ];
        }
    },

    computed: {
        // Computed property untuk detail paket yang dipilih
        detailPaketTerpilih() {
            return this.getDetailPaket(this.formPemesanan.paket);
        },
        
        //Computed property untuk detail ekspedisi yang dipilih
        detailEkspedisiTerpilih() {
            return this.getDetailEkspedisi(this.formPemesanan.ekspedisi);
        },
        
        //Computed property untuk subtotal (harga paket)
        subtotal() {
            return this.detailPaketTerpilih.harga || 0;
        },
        
        //Computed property untuk biaya pengiriman
        biayaPengiriman() {
            return this.detailEkspedisiTerpilih.biaya || 0;
        },
        
        //Computed property untuk total biaya
        totalBiaya() {
            return this.subtotal + this.biayaPengiriman;
        },
        
        //Computed property untuk total biaya dalam format Rupiah
        totalBiayaFormatted() {
            return this.formatRupiah(this.totalBiaya);
        },
        
        //Computed property untuk menentukan apakah form bisa disubmit
        canSubmit() {
            return !this.isLoading && 
                   this.formPemesanan.nim.trim() && 
                   this.formPemesanan.nama.trim() && 
                   this.formPemesanan.email.trim() && 
                   this.formPemesanan.telepon.trim() && 
                   this.formPemesanan.alamat.trim() && 
                   this.formPemesanan.paket && 
                   this.formPemesanan.ekspedisi;
        }
    },

    watch: {
        // Watcher untuk memantau semua field dalam formPemesanan
        'formPemesanan': {
            handler(newValue) {
                // Cek apakah semua field wajib sudah terisi
                const semuaTerisi = newValue.nim.trim() && 
                                newValue.nama.trim() && 
                                newValue.email.trim() && 
                                newValue.telepon.trim() && 
                                newValue.alamat.trim() && 
                                newValue.paket && 
                                newValue.ekspedisi;
                
                if (semuaTerisi) {
                    this.statusForm = 'Semua kolom sudah diisi. Form siap dikirim.';
                    this.statusClass = 'status-siap';
                } else {
                    this.statusForm = 'Menunggu semua kolom terisi.';
                    this.statusClass = 'status-tunggu';
                }
            },
            deep: true,
            immediate: true
        }
    },
    
    // Lifecycle hook
    async mounted() {
        console.log('Komponen Order Form siap digunakan');
        
        // Load data tambahan
        await this.loadDataTambahan();
        console.log('Data loaded:', {
            paket: this.daftarPaket,
            ekspedisi: this.daftarEkspedisi
        });
    }
}).mount('#order-app');