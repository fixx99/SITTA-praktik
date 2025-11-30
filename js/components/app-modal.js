const { createApp } = Vue;

createApp({
    data() {
        return {
            // State untuk mengontrol tampilan modal
            modalAktif: false,
            modalTipe: '', // 'info', 'konfirmasi', 'form'
            modalJudul: '',
            modalKonten: '',
            modalAksi: null,
            
            // Data untuk modal form
            formData: {},
            validasiError: ''
        }
    },
    
    methods: {
        //Method untuk membuka modal
        bukaModal(tipe, judul, konten, aksi = null, data = {}) {
            this.modalTipe = tipe;
            this.modalJudul = judul;
            this.modalKonten = konten;
            this.modalAksi = aksi;
            this.formData = { ...data };
            this.validasiError = '';
            this.modalAktif = true;
        },
        
        //Method untuk menutup modal
        tutupModal() {
            this.modalAktif = false;
            this.modalTipe = '';
            this.modalJudul = '';
            this.modalKonten = '';
            this.modalAksi = null;
            this.formData = {};
            this.validasiError = '';
        },
        
        //Method untuk konfirmasi aksi
        konfirmasiAksi() {
            if (this.modalAksi && typeof this.modalAksi === 'function') {
                this.modalAksi(this.formData);
            }
            this.tutupModal();
        },
        
        //Method untuk validasi form
        validasiForm() {
            // Validasi dasar - bisa dikustomisasi sesuai kebutuhan
            if (this.modalTipe === 'form') {
                if (!this.formData.nama || !this.formData.email) {
                    this.validasiError = 'Nama dan email harus diisi';
                    return false;
                }
            }
            this.validasiError = '';
            return true;
        },
        
        // Method untuk submit form
        submitForm() {
            if (this.validasiForm()) {
                this.konfirmasiAksi();
            }
        }
    },
    
    computed: {
        // Computed property untuk menentukan class modal berdasarkan tipe
        modalClass() {
            return {
                'modal-info': this.modalTipe === 'info',
                'modal-konfirmasi': this.modalTipe === 'konfirmasi',
                'modal-form': this.modalTipe === 'form',
                'modal-error': this.validasiError
            };
        },
        
        //Computed property untuk menentukan apakah tombol aksi ditampilkan
        tampilkanAksi() {
            return this.modalTipe === 'konfirmasi' || this.modalTipe === 'form';
        }
    },
    
    // Lifecycle hook - dijalankan ketika komponen dimount
    mounted() {
        console.log('Komponen Modal siap digunakan');
    }
}).mount('#app-modal');