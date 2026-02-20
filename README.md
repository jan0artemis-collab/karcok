# 📋 Sistem Kartu Siswa Digital

Sistem scan QR / input manual untuk menampilkan kartu identitas siswa. Data disimpan di Google Sheets, endpoint via Google Apps Script, dan frontend di-host di GitHub Pages — **tanpa server, tanpa biaya hosting**.

---

## Struktur Repo

```
├── index.html            ← Scanner QR + input manual
├── card.html             ← Tampilan kartu siswa
├── assets/
│   ├── css/style.css     ← Global styles
│   ├── js/main.js        ← Fetch & render logic
│   └── default.svg       ← Placeholder foto
├── apps_script/
│   └── Code.gs           ← Paste ke Google Apps Script
├── sample-data.csv       ← Contoh 5 data siswa
└── README.md
```

---

## Langkah Deploy (urut)

### 1. Siapkan Google Sheet

1. Buka [Google Sheets](https://sheets.google.com) → buat spreadsheet baru.
2. Rename sheet pertama menjadi **`students`**.
3. Buat header di baris pertama (persis seperti ini, case-sensitive):

   ```
   student_id | nomor_induk | nama | kelas | foto_url | kompetensi_kedisiplinan | kompetensi_kepemimpinan | kompetensi_kerajinan | kompetensi_publikasi | catatan
   ```

4. Isi data siswa. Untuk `foto_url`, bisa pakai link Google Drive (pastikan public) atau URL gambar eksternal.  
   Nilai kompetensi: angka **0–100**.
5. Catat **Spreadsheet ID** dari URL:  
   `https://docs.google.com/spreadsheets/d/`**`<SPREADSHEET_ID>`**`/edit`

### 2. Deploy Google Apps Script

1. Di spreadsheet → **Extensions → Apps Script**.
2. Hapus isi default, paste seluruh isi `apps_script/Code.gs`.
3. Ganti `SPREADSHEET_ID` di baris 10 dengan ID spreadsheet kamu.
4. Klik **Deploy → New deployment**.
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone** *(atau "Anyone within [organisasi]" jika ada Google Workspace)*
5. Klik **Deploy** → izinkan akses yang diminta.
6. Salin **Web App URL** (format: `https://script.google.com/macros/s/<DEPLOY_ID>/exec`).

> **Test endpoint:** Buka di browser:  
> `https://script.google.com/macros/s/<DEPLOY_ID>/exec?id=10001`  
> Harus muncul JSON `{"success":true,"data":{...}}`

### 3. Konfigurasi Frontend

Buka `assets/js/main.js` dan ganti:

```js
const ENDPOINT = 'https://script.google.com/macros/s/GANTI_DENGAN_DEPLOY_ID/exec';
```

menjadi URL deploy kamu.

### 4. Push ke GitHub & Aktifkan Pages

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Lalu di GitHub:  
**Settings → Pages → Branch: main / root → Save**

Tunggu 1–2 menit → akses:  
`https://<username>.github.io/<repo>/`

### 5. Generate QR Code

Untuk setiap siswa, buat QR code yang meng-encode:
- Student ID saja (misal: `10001`), **atau**
- URL lengkap: `https://<username>.github.io/<repo>/card.html?id=10001`

Tools gratis: [qr-code-generator.com](https://www.qr-code-generator.com), [goqr.me](https://goqr.me).

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| Fetch gagal / CORS error | Pastikan deployment Apps Script sudah `Anyone`. Jika masih gagal, deploy ulang (buat deployment baru, bukan update). |
| Data tidak muncul | Cek nama sheet harus `students`, dan header harus persis sama. |
| Foto tidak muncul | Pastikan URL foto bisa diakses publik (Google Drive: *Share → Anyone with link*). |
| Kamera tidak aktif di ponsel | Situs harus HTTPS (GitHub Pages sudah HTTPS ✓). Safari iOS perlu izin kamera eksplisit. |
| Perubahan data tidak terlihat | Apps Script men-cache respons. Buat **deployment baru** setelah perubahan signifikan, atau tambah `?cache=` timestamp di fetch URL. |

---

## Catatan Keamanan

- **Jangan simpan credential** di repo publik.
- Endpoint Apps Script publik berarti siapa pun yang tahu URL-nya bisa query data. Jika data sensitif, pertimbangkan:
  - Batasi akses ke `Anyone within [organisation]` (butuh Google Workspace).
  - Tambahkan API key sederhana sebagai query param di Apps Script.
- `student_id` sebaiknya non-prediktif (bukan sekadar 1, 2, 3…) untuk mencegah enumerasi data.
