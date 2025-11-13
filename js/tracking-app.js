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
                ekspedisiList: [
                    { kode: 'JNE_REG', nama: 'JNE Regular' },
                    { kode: 'JNE_EXP', nama: 'JNE Express' },
                    { kode: 'POS_REG', nama: 'Pos Indonesia Regular' },
                    { kode: 'POS_KILAT', nama: 'Pos Indonesia Kilat' },
                ],

                //daftar DO
                daftarDO: [],
                //data paket dari file tugas 2
                paketList: [],
                doCounter: 1
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
            }
        },

        methods: {
            // cari do 
            cariDO() {
                const nomorCari = this.nomorDO.trim();
                
                if (!nomorCari) {
                    alert('Harap masukkan nomor DO');
                    return;
                }
                
                console.log('Mencari DO:', nomorCari);
                console.log('daftar DO tersimpan:', this.daftarDO) 
                this.loadDariLocalStorage();
                this.hasilTracking = null;
                this.showHasilTracking = true;

                // cari do baru
                const doDitemukan = this.daftarDO.find(doItem => {
                    console.log('Cek DO:', doItem.nomor, '==', nomorCari, '?', doItem.nomor === nomorCari);
                    return doItem.nomor === nomorCari;
                });

                if (doDitemukan) {
                    console.log('DO ditemukan di local storage:', doDitemukan)
                    this.hasilTracking = doDitemukan;
                    this.showHasilTracking = true;
                    return;
                }
                
                // do lama (data.js)
                if (typeof dataTracking !== 'undefined' && dataTracking[nomorCari]) {
                    console.log('DO ditemukan di dataTracking');
                    const doDataJS = dataTracking[nomorCari];
                    this.hasilTracking = {
                        nomor: doDataJS.nomorDO,
                        nama: doDataJS.nama,
                        status: doDataJS.status,
                        ekspedisi: doDataJS.ekspedisi,
                        tanggalKirim: doDataJS.tanggalKirim,
                        paket: doDataJS.paket,
                        total: doDataJS.total,
                        perjalanan: doDataJS.perjalanan
                    };
                    return;
                }
                
                // cari do di dataBahanAjarV3
                if (typeof dataBahanAjarV3.tracking !== 'undefined' && dataBahanAjarV3.tracking && dataBahanAjarV3.tracking[nomorCari]) {
                    console.log('DO ditemukan di dataBahanAjarV3');
                    const doDataV3 = dataBahanAjarV3.tracking[nomorCari];
                    this.hasilTracking = {
                        nomor: nomorCari,
                        nim: doDataV3.nim,
                        nama: doDataV3.nama,
                        status: doDataV3.status,
                        ekspedisi: doDataV3.ekspedisi,
                        tanggalKirim: doDataV3.tanggalKirim,
                        paket: doDataV3.paket,
                        total: 'Rp ' + doDataV3.total.toLocaleString('id-ID'),
                        perjalanan: doDataV3.perjalanan
                    };
                    return;
                }

                this.hasilTracking = '';
                this.showHasilTracking = true;
            },
            
            // buat do baru
            buatDOBaru() {
                // validasi input
                if (!this.doBaru.nim || !this.doBaru.nama || !this.doBaru.ekspedisi || !this.doBaru.paket) {
                    alert('Harap lengkapi semua data yang diperlukan');
                    return;
                }

                const nomorDOBaru = this.nomorDOOtomatis;
                
                // buat objek do
                const doBaru = {
                    nomor: nomorDOBaru,
                    nim: this.doBaru.nim,
                    nama: this.doBaru.nama,
                    ekspedisi: this.doBaru.ekspedisi,
                    paket: this.doBaru.paket,
                    tanggalKirim: this.doBaru.tanggalKirim,
                    total: this.totalHargaFormatted,
                    status: 'Diproses', // Status default
                    perjalanan: [
                        {
                            waktu: new Date().toLocaleString('id-ID'),
                            keterangan: 'Pesanan diterima dan sedang diproses'
                        }
                    ]
                };

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
                
                alert(`DO berhasil dibuat!\nNomor DO: ${doBaru.nomor}`);

                // Otomatis tampilkan hasil DO yang baru dibuat
                this.nomorDO = doBaru.nomor;
                this.hasilTracking = doBaru;
                this.showHasilTracking = true;

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
                const savedData = localStorage.getItem('daftarDO');
                if (savedData) {
                    this.daftarDO = JSON.parse(savedData);
                    console.log('Data DO dari localStorage:', this.daftarDO);
                }

                const savedCounter = localStorage.getItem('doCounter');
                if (savedCounter) {
                    this.doCounter = parseInt(savedCounter);
                    console.log('DO Counter:', this.doCounter);
                } else {
                    // Jika counter belum ada, set berdasarkan jumlah DO
                    this.doCounter = 2;
                    console.log('DO Counter mulai dari 2');
                }
            },
            
            // load data dari sumber
            loadDataPaket() {
                // load dari dataBahanAjarV3
                if (typeof dataBahanAjarV3 !== 'undefined' && dataBahanAjarV3.paket) {
                    this.paketList = dataBahanAjarV3.paket;
                    console.log('Paket dari dataBahanAjarV3:', this.paketList);
                    return;
                }
                
                // fallback jika tidak ada
                this.paketList = [
                    { kode: "PAKET-UT-001", nama: "PAKET IPS Dasar", isi: ["EKMA4116","EKMA4115"], harga: 120000 },
                    { kode: "PAKET-UT-002", nama: "PAKET IPA Dasar", isi: ["BIOL4201","FISIP4001"], harga: 140000 },
                    { kode: "PAKET-UT-003", nama: "PAKET BAHASA", isi: ["ING4001","IND4001"], harga: 110000 }
                ];
            },
            
            // nama ekspedisi dari kode
            getNamaEkspedisi(kode) {
                if (kode === 'JNE') return 'JNE Regular';
                if (kode === 'JNE_REG') return 'JNE Regular';
                if (kode === 'POS') return 'Pos Indonesia';
                if (kode === 'POS_REG') return 'Pos Indonesia Regular';
                
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
            
            getStatusColor(status) {
                const colors = {
                    'Diproses': '#ffc107',
                    'Dikirim': '#007bff', 
                    'Selesai': '#28a745',
                    'Dalam Perjalanan': '#17a2b8'
                };
                return colors[status] || '#6c757d';
            }
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
            },
            
            // Watcher untuk memantau perubahan paket
            'doBaru.paket'(newPaket) {
                console.log('Paket dipilih:', newPaket);
                if (newPaket) {
                    // Bisa tambahkan logic tambahan di sini
                    this.tampilkanDetailPaket = true;
                }
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