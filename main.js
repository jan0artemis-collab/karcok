/**
 * main.js — Kartu Siswa
 * Fetch data dari Google Apps Script dan render ke card.html
 *
 * GANTI nilai ENDPOINT di bawah dengan URL deploy Apps Script kamu.
 * Contoh: 'https://script.google.com/macros/s/AKfycbxXXXXXXXXX/exec'
 */
const ENDPOINT = 'https://script.google.com/macros/s/AKfycbza_7KWD66iJZGIh6xBuzRaphKHDyMaZZ3Evo_F6fTgF8N13rjRyCGfKCuFFi4lUhW5cA/exec';

/* ── Kompetensi yang ditampilkan ── */
const KOMPETENSIS = [
  { key: 'kompetensi_kedisiplinan',  label: 'Kedisiplinan'  },
  { key: 'kompetensi_kepemimpinan', label: 'Kepemimpinan'  },
  { key: 'kompetensi_kerajinan',    label: 'Kerajinan'     },
  { key: 'kompetensi_publikasi',    label: 'Publikasi'      },
];

/* ── Helpers ── */
function el(id) { return document.getElementById(id); }

function showError(title, msg) {
  el('loading').style.display   = 'none';
  el('card-view').style.display = 'none';
  el('error-view').style.display = 'flex';
  el('error-title').textContent = title || 'Terjadi Kesalahan';
  el('error-msg').textContent   = msg   || '';
}

function showCard() {
  el('loading').style.display    = 'none';
  el('error-view').style.display = 'none';
  el('card-view').style.display  = 'block';
}

/* ── Render competency bars ── */
function renderKompetensi(data) {
  const list = el('competency-list');
  list.innerHTML = '';

  KOMPETENSIS.forEach(({ key, label }) => {
    const raw = data[key];
    // Nilai bisa 0–100 atau kosong
    const val = raw !== undefined && raw !== '' ? Number(raw) : null;
    const pct = val !== null ? Math.min(100, Math.max(0, val)) : 0;

    const item = document.createElement('div');
    item.className = 'comp-item';
    item.innerHTML = `
      <span class="comp-label">${label}</span>
      <div class="comp-bar-wrap">
        <div class="comp-bar" style="width:0%" data-pct="${pct}"></div>
      </div>
      <span class="comp-val">${val !== null ? val : '—'}</span>
    `;
    list.appendChild(item);
  });

  // Animate bars after paint
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      list.querySelectorAll('.comp-bar').forEach(bar => {
        bar.style.width = bar.dataset.pct + '%';
      });
    });
  });
}

/* ── Main load ── */
async function loadCard() {
  const params = new URLSearchParams(location.search);
  const id = params.get('id');

  if (!id) {
    showError('ID Tidak Ditemukan', 'URL tidak mengandung parameter id. Kembali ke scanner dan coba lagi.');
    return;
  }

  try {
    const url = `${ENDPOINT}?id=${encodeURIComponent(id)}`;
    const res = await fetch(url, { mode: 'cors' });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();

    if (!json.success) {
      showError('Data Tidak Ditemukan', `Siswa dengan ID "${id}" tidak terdaftar dalam sistem.`);
      return;
    }

    const d = json.data;

    /* ── Set fields ── */
    // Foto
    const photo = el('photo');
    if (d.foto_url && d.foto_url.trim()) {
      photo.src = d.foto_url.trim();
      photo.onerror = () => { photo.src = 'assets/default.svg'; };
    }

    el('nama').textContent         = d.nama         || '—';
    el('kelas').textContent        = d.kelas         || '—';
    el('nomor-induk').textContent  = d.nomor_induk   || '—';
    el('student-id-chip').textContent = d.student_id || id;

    // Catatan
    const catatanEl = el('catatan');
    if (d.catatan && d.catatan.trim()) {
      catatanEl.textContent = d.catatan.trim();
      catatanEl.classList.remove('empty');
    } else {
      catatanEl.textContent = 'Tidak ada catatan.';
      catatanEl.classList.add('empty');
    }

    // Kompetensi
    renderKompetensi(d);

    // Update page title
    document.title = `Kartu Siswa — ${d.nama || id}`;

    showCard();

  } catch (err) {
    console.error(err);
    showError(
      'Gagal Mengambil Data',
      'Periksa koneksi internet atau konfigurasi endpoint Apps Script. Detail: ' + err.message
    );
  }
}

window.addEventListener('DOMContentLoaded', loadCard);
