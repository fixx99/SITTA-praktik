const { createApp } = Vue;

createApp({
    data() {
        return {
            // Data contoh untuk demonstrasi
            daftarStatus: [
                { 
                    id: 1, 
                    teks: 'Stok Aman', 
                    tipe: 'success',
                    ikon: 'fas fa-check-circle'
                },
                { 
                    id: 2, 
                    teks: 'Stok Menipis', 
                    tipe: 'warning',
                    ikon: 'fas fa-exclamation-triangle'
                },
                { 
                    id: 3, 
                    teks: 'Stok Kosong', 
                    tipe: 'error',
                    ikon: 'fas fa-times-circle'
                },
                { 
                    id: 4, 
                    teks: 'Dalam Proses', 
                    tipe: 'info',
                    ikon: 'fas fa-spinner'
                },
                { 
                    id: 5, 
                    teks: 'Selesai', 
                    tipe: 'success',
                    ikon: 'fas fa-check'
                },
                { 
                    id: 6, 
                    teks: 'Pending', 
                    tipe: 'warning',
                    ikon: 'fas fa-clock'
                },
                { 
                    id: 7, 
                    teks: 'Ditolak', 
                    tipe: 'error',
                    ikon: 'fas fa-ban'
                },
                { 
                    id: 8, 
                    teks: 'Informasi', 
                    tipe: 'info',
                    ikon: 'fas fa-info-circle'
                }
            ],
            
            statusAktif: 'Stok Aman',
            tipeAktif: 'success',
            
            customBadge: {
                teks: '',
                tipe: 'success',
                ikon: 'fa-check-circle'
            },
            
            customBadges: []
        }
    },
    
    methods: {
        // Method untuk mengubah status aktif
        ubahStatus(status, tipe) {
            this.statusAktif = status;
            this.tipeAktif = tipe;
            
            // Tambahkan efek visual feedback
            const badgeElement = document.querySelector('.status-badge-container .status-badge');
            if (badgeElement) {
                badgeElement.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    badgeElement.style.transform = 'scale(1)';
                }, 200);
            }
        },
        
        // Method untuk mendapatkan class CSS berdasarkan tipe status
        getStatusClass(tipe) {
            const classMap = {
                'success': 'badge-success',
                'warning': 'badge-warning',
                'error': 'badge-error',
                'info': 'badge-info',
                'default': 'badge-default'
            };
            return classMap[tipe] || classMap['default'];
        },
        
        // Method untuk membuat badge custom
        buatBadge(teks, tipe = 'default', ikon = null) {
            return {
                teks: teks,
                tipe: tipe,
                ikon: ikon || this.getStatusIcon(tipe),
                class: this.getStatusClass(tipe)
            };
        },
        
        // Method untuk mendapatkan ikon berdasarkan tipe status
        getStatusIcon(tipe) {
            const iconMap = {
                'success': 'fas fa-check-circle',
                'warning': 'fas fa-exclamation-triangle',
                'error': 'fas fa-times-circle',
                'info': 'fas fa-info-circle',
                'default': 'fas fa-circle'
            };
            return iconMap[tipe] || iconMap['default'];
        },
        
        // Method untuk menambah custom badge
        tambahCustomBadge() {
            if (!this.customBadge.teks.trim()) {
                alert('Harap masukkan teks untuk badge');
                return;
            }
            
            const newBadge = this.buatBadge(
                this.customBadge.teks,
                this.customBadge.tipe,
                'fas ' + this.customBadge.ikon
            );
            
            this.customBadges.push(newBadge);
            this.resetCustomBadge();
            
            // Simpan ke localStorage
            this.simpanCustomBadges();
        },
        
        // Method untuk menghapus custom badge
        hapusCustomBadge(index) {
            if (confirm('Apakah Anda yakin ingin menghapus badge ini?')) {
                this.customBadges.splice(index, 1);
                this.simpanCustomBadges();
            }
        },
        
        // Method untuk reset custom badge form
        resetCustomBadge() {
            this.customBadge = {
                teks: '',
                tipe: 'success',
                ikon: 'fa-check-circle'
            };
        },
        
        // Method untuk menyimpan custom badges ke localStorage
        simpanCustomBadges() {
            localStorage.setItem('customBadges', JSON.stringify(this.customBadges));
        },
        
        // Method untuk memuat custom badges dari localStorage
        muatCustomBadges() {
            const savedBadges = localStorage.getItem('customBadges');
            if (savedBadges) {
                this.customBadges = JSON.parse(savedBadges);
            }
        }
    },
    
    computed: {
        // Computed property untuk badge aktif
        badgeAktif() {
            return this.buatBadge(this.statusAktif, this.tipeAktif);
        },
        
        // Computed property untuk custom badge class
        customBadgeClass() {
            return this.getStatusClass(this.customBadge.tipe);
        },
        
        // Computed property untuk statistik status
        statistikStatus() {
            const allStatuses = [...this.daftarStatus, ...this.customBadges];
            const statistik = {
                total: allStatuses.length,
                success: allStatuses.filter(s => s.tipe === 'success').length,
                warning: allStatuses.filter(s => s.tipe === 'warning').length,
                error: allStatuses.filter(s => s.tipe === 'error').length,
                info: allStatuses.filter(s => s.tipe === 'info').length
            };
            
            return statistik;
        }
    },
    
    // Lifecycle hook
    mounted() {
        console.log('Komponen Status Badge siap digunakan');
        
        // Muat custom badges dari localStorage
        this.muatCustomBadges();
    }
}).mount('#status-badge-app');