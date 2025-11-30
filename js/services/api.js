const ApiService = {
  // Base URL untuk fetch data (relative path)
  baseUrl: '../data/dataBahanAjar.json',
  cache: null,

  //Method utama untuk fetch data dari JSON
  async fetchData() {
    if (this.cache) {
        return this.cache;
    }

    try {
        console.log('Loading data dari:', this.baseUrl);
        const response = await fetch(this.baseUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        this.cache = await response.json();
        console.log('Data berhasil di-load, struktur tracking:', this.cache.tracking);
        return this.cache;
    } catch (error) {
        console.error('Error fetching data:', error);
        return this.getFallbackData();
    }
  },

  //autentifikasi
  async login(email, password) {
    const data = await this.fetchData();
    const user = data.pengguna.find(u => u.email === email && u.password === password);
    
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: false, error: 'Email atau password salah' };
  },

  async register(userData) {
    const data = await this.fetchData();
    const emailExists = data.pengguna.some(u => u.email === userData.email);
    
    if (emailExists) {
      return { success: false, error: 'Email sudah terdaftar' };
    }
    
    const newUser = {
      id: data.pengguna.length + 1,
      ...userData,
      role: "Mahasiswa",
      lokasi: "Unknown"
    };
    
    return { success: true, user: newUser };
  },

  // DATA FETCHING
  async fetchDataBahanAjar() {
    try {
      const response = await fetch('../data/dataBahanAjar.json');
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return this.getFallbackData();
    }
  },

  // STOK/BUKU
  async getStokBuku() {
    const data = await this.fetchData();
    return data.stok || [];
  },

  async getDetailBuku(kodeBarang) {
    const data = await this.fetchData();
    return data.stok.find(b => b.kode === kodeBarang) || null;
  },

  async tambahBukuBaru(bukuData) {
    const data = await this.fetchData();
    const kodeExists = data.stok.some(b => b.kode === bukuData.kodeBarang);
    if (kodeExists) {
      return { success: false, error: 'Kode barang sudah ada' };
    }
    const bukuBaru = {
      kode: bukuData.kodeBarang,
      judul: bukuData.namaBarang,
      kategori: bukuData.jenisBarang,
      upbjj: bukuData.upbjj,
      lokasiRak: bukuData.kodeLokasi,
      harga: bukuData.harga || 0,
      qty: bukuData.stok,
      safety: bukuData.safetyStock,
      gambar: bukuData.cover || 'img/default-cover.jpg',
      catatanHTML: bukuData.catatan || `Buku ${bukuData.jenisBarang} baru ditambahkan`,
      edisi: bukuData.edisi || '-'
    };
    data.stok.push(bukuBaru);
    return { success: true, buku: bukuBaru };
  },

  async updateStokBuku(kodeBarang, stokBaru) {
    const data = await this.fetchData();
    const bukuIndex = data.stok.findIndex(b => b.kode === kodeBarang);
    
    if (bukuIndex !== -1) {
        data.stok[bukuIndex].qty = stokBaru;
        return { success: true, buku: data.stok[bukuIndex] };
    }
    
    return { success: false, error: 'Buku tidak ditemukan' };
},

  // TRACKING DO
  async getTrackingData(nomorDO) {
    const data = await this.fetchData();
    for (let item of data.tracking) {
      if (item[nomorDO]) {
        return item[nomorDO];
      }
    }
    return null;
  },

  async getAllPaket() {
    const data = await this.fetchData();
    return data.paket || [];
  },

  async buatDOBaru(doData) {
    const data = await this.fetchData();
    const nomorDOBaru = `DO${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    
    const doBaru = {
      nomor: nomorDOBaru,
      ...doData,
      status: 'Diproses',
      perjalanan: [
        {
          waktu: new Date().toLocaleString('id-ID'),
          keterangan: 'Pesanan diterima dan sedang diproses'
        }
      ]
    };
    
    // Simulasi - tambahkan ke tracking data
    if (!data.tracking) data.tracking = [];
    const newTrackingItem = {};
    newTrackingItem[nomorDOBaru] = doBaru;
    data.tracking.push(newTrackingItem);
    
    return { success: true, do: doBaru };
  },

  // LIST/DROPDOWN
  async getList() {
    return this.getList();
  
  },

  generateNomorDO() {
    // Cek counter terakhir dari localStorage
    let doCounter = localStorage.getItem('doCounter');
    if (!doCounter) {
        doCounter = 1;
    } else {
        doCounter = parseInt(doCounter) + 1;
    }
    
    const tahun = new Date().getFullYear();
    const sequence = doCounter.toString().padStart(4, '0');
    const nomorDO = `DO${tahun}-${sequence}`;
    
    // Update counter
    localStorage.setItem('doCounter', doCounter.toString());
    
    return nomorDO;
  },

    async buatDOBaru(doData) {
    const data = await this.fetchData();
    
    // Gunakan generateNomorDO yang konsisten
    const nomorDOBaru = this.generateNomorDO();
    
    const doBaru = {
        nomor: nomorDOBaru,
        ...doData,
        status: 'Diproses',
        tanggalDibuat: new Date().toISOString(),
        perjalanan: [
            {
                waktu: new Date().toLocaleString('id-ID'),
                keterangan: 'Pesanan diterima dan sedang diproses'
            }
        ]
    };
    
    // Simpan ke localStorage untuk sinkronisasi dengan tracking
    this.simpanDOkeLocalStorage(doBaru);
    
    return { success: true, do: doBaru };
  },

  // Tambahkan method untuk menyimpan DO ke localStorage
  simpanDOkeLocalStorage(doBaru) {
    try {
        // Ambil daftar DO yang sudah ada
        let daftarDO = JSON.parse(localStorage.getItem('daftarDO')) || [];
        
        // Tambahkan DO baru
        daftarDO.push(doBaru);
        
        // Simpan kembali ke localStorage
        localStorage.setItem('daftarDO', JSON.stringify(daftarDO));
        
        console.log('DO berhasil disimpan ke localStorage:', doBaru.nomor);
    } catch (error) {
        console.error('Error menyimpan DO ke localStorage:', error);
    }
  },

  // FALLBACK DATA
  getFallbackData() {
    return {
      pengguna: [
        { id: 1, nama: "Admin", email: "admin@ut.ac.id", password: "admin123", role: "Admin", lokasi: "Jakarta" }
      ],
      stok: [],
      tracking: [],
      paket: [],
      list: {
        upbjjList: ["Jakarta", "Surabaya", "Makassar", "Padang", "Denpasar"],
        kategoriList: ["MK Wajib", "MK Pilihan", "Praktikum", "Problem-Based"],
        ekspedisiList: [
          { kode: 'JNE_REG', nama: 'JNE Regular' },
          { kode: 'JNE_EXP', nama: 'JNE Express' }
        ]
      }
    };
  }
};