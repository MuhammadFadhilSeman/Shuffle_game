# Shuffle Game & Solar System Spinner 🃏🌌

**Shuffle Game & Solar System Spinner** adalah aplikasi web interaktif bergaya permainan kartu dan pemutar roda interaktif (spinner) bertema luar angkasa. Aplikasi ini dirancang untuk menjadi pencair suasana (*icebreaker*), teman nongkrong, atau permainan seru bersama teman-teman.

Proyek ini memiliki dua permainan utama:
1. **Card Shuffle Game (`/game`)**: Mengocok dek kartu poker secara virtual, memilih kartu secara acak, dan menjawab pertanyaan seru di baliknya.
2. **Solar System Funny Question Spinner (`/spinner`)**: Roda pemutar bertema tata surya dengan efek kosmik, animasi Big Bang, dan partikel ledakan bintang untuk memilih pertanyaan lucu secara acak.

---

## ✨ Fitur Utama

### 1. Card Shuffle Game 🃏
- **Animasi 3D Halus**: Animasi mengocok tumpukan kartu (*deck shuffling*) dan membalik kartu (*3D flip*) yang sangat responsif.
- **Efek Suara Sintetis**: Menggunakan *Web Audio API* bawaan browser untuk menghasilkan efek suara desiran kartu (*shuffle*) dan ketukan *flip* tanpa memuat file audio eksternal.
- **Dukungan Dua Bahasa**: Tersedia tombol ganti bahasa secara instan (Bahasa Indonesia / English).

### 2. Solar System Funny Question Spinner 🌌
- **Interactive Orbit & Kawaii Planets**: Planet-planet bergaya kawaii yang mengitari Matahari. Mengarahkan kursor (*hover*) ke Matahari akan memicu efek getaran dan pengisian energi (*charge*).
- **Animasi Big Bang & Ledakan Partikel**: Ketika roda diputar, Matahari akan meledak dalam efek cahaya kilat (Big Bang) diikuti oleh ledakan partikel kosmik di latar belakang menggunakan HTML5 Canvas.
- **Meteor Shower Background**: Latar belakang bertema luar angkasa dengan animasi hujan meteor dinamis secara real-time.
- **Bilingual & Database Pertanyaan Unik**: Menampilkan pertanyaan-pertanyaan lucu dan unik seputar kehidupan Gen Z, perkuliahan, wibu, hingga hubungan sosial.

### 3. Sistem Audio Terpusat (AudioManager) 🎵
- **Bypass Autoplay Restriction**: AudioManager memiliki sistem interaksi awal (*user gesture trigger*) yang membuka kunci audio browser secara otomatis pada klik/sentuhan pertama.
- **Preloaded Audio Pool**: Memuat 12 aset audio berkualitas tinggi di latar belakang untuk menjamin pemutaran instan tanpa jeda:
  - Musik Latar: `Space Ambient Sleep Music.mp3` (Loop otomatis, volume 0.25)
  - Efek Suara: Sun hover, Sun charge, Big bang impact, Particle burst, Planet select, Card reveal, Loader tick, Question reveal, Button hover, Spin again, dan Modal close.
- **Kontrol Musik Latar**: Dilengkapi tombol Mute khusus (`🔊 Music` / `🔇 Muted`) pada antarmuka untuk menyalakan atau mematikan musik latar secara instan tanpa memengaruhi efek suara permainan.

### 4. Responsivitas Mobile Unggul (Mobile-Friendly)📱
- **Multi-tier Responsive Design**: Penyesuaian tata letak yang presisi untuk berbagai ukuran layar (Tablet $\le$ 768px, HP/Mobile $\le$ 480px, dan HP ultra-kecil $\le$ 360px).
- **Bottom-sheet Modal**: Di perangkat mobile, kartu pertanyaan akan muncul sebagai lembaran dari bawah layar (*bottom-sheet*) untuk kenyamanan penggunaan satu tangan yang ergonomis.

---

## 🛠️ Teknologi yang Digunakan
- **Backend**: Python (Flask)
- **Frontend**: HTML5, Vanilla CSS3 (3D Perspective, Transform, CSS Variables & Keyframes), Vanilla JavaScript (DOM, Canvas API, & Web Audio API)
- **Deployment**: Vercel (Konfigurasi `vercel.json` disertakan)

---

## 🚀 Cara Menjalankan Secara Lokal (Local Development)

Jika Anda ingin menjalankan atau mengembangkan proyek ini di komputer Anda:

1. **Pastikan Python sudah terinstal** di perangkat Anda.
2. **Clone repositori ini**:
   ```bash
   git clone https://github.com/MuhammadFadhilSeman/Shuffle_game.git
   cd Shuffle_game
   ```
3. **Buat dan aktifkan Virtual Environment** (Opsional tapi direkomendasikan):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Untuk Mac/Linux
   # venv\Scripts\activate   # Untuk Windows
   ```
4. **Instal dependensi (Flask)**:
   ```bash
   pip install Flask
   ```
5. **Jalankan Aplikasi**:
   ```bash
   python app.py
   ```
6. Buka browser dan kunjungi:
   - Halaman Utama: `http://127.0.0.1:5000/`
   - Shuffle Game: `http://127.0.0.1:5000/game`
   - Spinner Tata Surya: `http://127.0.0.1:5000/spinner`

---

## 🌍 Cara Deploy ke Vercel

Game ini siap di-deploy ke Vercel secara gratis:
1. Buat akun atau masuk ke [Vercel](https://vercel.com/).
2. Hubungkan akun GitHub Anda dan impor repositori `Shuffle_game`.
3. Vercel akan otomatis mendeteksi file `vercel.json` dan memproses deployment Flask web app Anda.
4. Setelah selesai, bagikan tautan yang diberikan Vercel kepada teman-teman Anda!

---
**Credit by Daigo**
