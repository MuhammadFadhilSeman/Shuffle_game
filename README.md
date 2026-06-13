# Shuffle Game 🃏

Shuffle Game adalah aplikasi web interaktif bergaya permainan kartu poker yang dirancang untuk menjadi pencair suasana (*icebreaker*), teman nongkrong, atau permainan kejujuran (*Truth*). Pemain akan mengocok dek kartu, memilih satu dari tiga kartu yang dibagikan secara acak, dan menjawab pertanyaan seru yang muncul di baliknya!

## ✨ Fitur Utama
- **Animasi 3D Halus**: Animasi mengocok tumpukan kartu (*deck shuffling*) dan membalik kartu (*3D flip*) yang sangat interaktif dan responsif.
- **Efek Suara Sintetis**: Menggunakan *Web Audio API* bawaan browser untuk menghasilkan efek suara desiran kartu (*shuffle*) dan ketukan *flip* tanpa perlu memuat file MP3 eksternal.
- **Dukungan Dua Bahasa**: Tersedia tombol pergantian bahasa secara instan (Bahasa Indonesia / English) untuk daftar pertanyaannya.
- **Mobile-Friendly**: Tampilan antarmuka yang 100% adaptif untuk layar *handphone*. Kartu akan saling menumpuk rapi layaknya menggenggam setumpuk kartu sungguhan di tangan Anda.
- **Sistem Cerdas Overlay**: Memiliki layar konfirmasi awal untuk menghindari aturan pemblokiran *autoplay audio* dari browser terbaru, sehingga suara dijamin mulus tanpa *bug*.

## 🛠️ Teknologi yang Digunakan
- **Backend**: Python (Flask)
- **Frontend**: HTML5, Vanilla CSS3 (3D Perspective, Transform & Keyframes), Vanilla JavaScript (DOM Manipulation & Web Audio API)
- **Deployment**: Vercel (Konfigurasi `vercel.json` sudah disertakan)

## 🚀 Cara Menjalankan Secara Lokal (Local Development)

Jika Anda ingin menjalankan, bereksperimen, atau menambah pertanyaan di game ini secara *offline* di komputer Anda:

1. **Pastikan Python sudah terinstal** di perangkat Anda.
2. **Clone repositori ini**:
   ```bash
   git clone https://github.com/MuhammadFadhilSeman/Shuffle_game.git
   cd Shuffle_game
   ```
3. **Buat dan aktifkan Virtual Environment** (Opsional tapi sangat direkomendasikan):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Untuk pengguna Mac/Linux
   # venv\Scripts\activate   # Untuk pengguna Windows
   ```
4. **Instal dependensi (Flask)**:
   ```bash
   pip install Flask
   ```
5. **Jalankan Aplikasi Flask**:
   ```bash
   python app.py
   ```
6. Buka *browser* Anda dan kunjungi: `http://127.0.0.1:5000`

## 🌍 Cara Deploy ke Vercel

Game ini sudah diatur sedemikian rupa agar bisa langsung di-*deploy* ke server awan Vercel secara gratis.
1. Buat akun di [Vercel](https://vercel.com/).
2. Hubungkan akun GitHub Anda.
3. Buat *Project* baru dan *import* repositori GitHub ini.
4. Vercel akan otomatis membaca konfigurasi `vercel.json` untuk menjalankan server Python/Flask.
5. Tunggu proses selesai, dan link website game Anda sudah bisa dibagikan ke teman-teman!

---
**Credit by Daigo**
