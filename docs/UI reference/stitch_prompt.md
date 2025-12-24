# 📘 Dokumentasi Penggunaan Prompt  
## Regenerasi UI/UX – Competitor Analysis Dashboard (Stitch with Google)

Dokumentasi ini menjelaskan **cara menggunakan prompt UI/UX** untuk melakukan *regenerate design* di **Stitch with Google** secara **konsisten dengan PRD.md dan dataset kompetitor** yang digunakan pada proyek *Competitor Analysis Dashboard* sebagai UI reference.

Dokumen ini ditujukan untuk:
- Product Owner
- UI/UX Designer
- Frontend Engineer
- Founder / Analyst (non-designer)

---

## 1. Tujuan Prompt

Prompt ini digunakan untuk:
- Menghasilkan desain UI/UX dashboard analisis kompetitor
- Memastikan desain **100% sesuai PRD**
- Mencegah fitur di luar scope (feature creep)
- Menjamin desain **data-driven & read-only**

Prompt **BUKAN** untuk:
- Ideasi fitur baru
- Eksperimen visual bebas
- Admin panel
- AI chat / prediction UI

---

## 2. Kapan Prompt Ini Digunakan

Gunakan prompt ini ketika:
- Melakukan **regenerate UI/UX** di Stitch
- Mendesain ulang dashboard berdasarkan PRD final
- Menyamakan persepsi desain antara PM, Designer, dan Engineer
- Membuat desain yang siap langsung diimplementasikan (Next.js + Shadcn)

---

## 3. Prasyarat Sebelum Menggunakan Prompt

Pastikan hal berikut sudah **FINAL**:

1. **PRD.md**
   - Scope MVP sudah dikunci
   - Data flow: Scraping → n8n → Database → Dashboard
   - Dashboard bersifat **read-only**

2. **Dataset Kompetitor**
   - Data sudah:
     - Dinormalisasi
     - Diskor
     - Diperkaya (derived metrics & SWOT)
   - Tidak ada raw data di UI

3. **Arsitektur**
   - n8n = satu-satunya logic layer
   - UI hanya konsumsi final schema

---

## 4. Cara Menggunakan Prompt di Stitch

### Langkah-langkah:

1. Buka **Stitch with Google**
2. Pilih mode:
   - `Generate UI`
   - atau `Regenerate Design`
3. Paste **SELURUH prompt** tanpa dipotong
4. Jangan menambahkan prompt tambahan di luar dokumen
5. Jalankan generasi desain

> ⚠️ **PENTING:**  
> Jangan mencampur prompt ini dengan prompt ideasi atau visual bebas.

---

## 5. Struktur Prompt (Ringkasan)

Prompt terdiri dari bagian-bagian berikut:

### 5.1 Product Context
- Nama produk
- Visi produk
- Target user
- Tujuan analisis

### 5.2 Data Assumptions
- Competitor core fields
- Derived metrics
- SWOT hasil olahan n8n
- Penegasan: **tidak ada logic di frontend**

### 5.3 Tech & Design Constraints
- Next.js (App Router)
- Tailwind CSS
- Shadcn/UI
- Recharts
- Supabase

### 5.4 Global Layout
- Top bar
- Sidebar navigasi
- Desktop-first SaaS layout

### 5.5 Page Definitions
- Dashboard Overview
- Competitors List
- Competitor Detail
- Comparison View
- SWOT Analysis
- Insights & Notes

### 5.6 UX Principles
- Data-first
- Read-only
- High clarity
- Zero ambiguity

---

## 6. Hasil yang Diharapkan dari Stitch

Output desain **WAJIB** memiliki karakteristik:

✅ Dashboard analitik (bukan marketing UI)  
✅ KPI berbasis data nyata  
✅ Table & chart realistis  
✅ Tidak ada tombol edit data kompetitor  
✅ Tidak ada fitur export / AI / real-time  

Jika hasil Stitch menampilkan:
- Admin tools
- Editable competitor data
- AI assistant
- Live scraping indicator  

➡️ **Anggap hasil INVALID** dan regenerate ulang.

---

## 7. Mapping Desain ke Implementasi

Desain hasil Stitch seharusnya:
- Bisa langsung dipecah menjadi:
  - Pages (`/dashboard`, `/competitors`, dll)
  - Components (Card, Table, Chart)
- Konsisten dengan:
  - Shadcn/UI components
  - Recharts chart types
  - TanStack Query data flow

Prompt ini **sengaja membatasi kreativitas visual** demi:
- Kecepatan implementasi
- Konsistensi produk
- Kesiapan production

---

## 8. Best Practices

✔ Gunakan prompt ini sebagai **single source of truth UI**  
✔ Jangan mengedit prompt tanpa diskusi product scope  
✔ Simpan prompt di repo (`/docs/ui-prompt.md`)  
✔ Gunakan kembali prompt ini untuk:
- Redesign
- Design review
- Onboarding designer baru

---

## 9. Anti-Pattern (Yang Harus Dihindari)

❌ Menambahkan fitur di luar PRD  
❌ Mengubah dashboard jadi CRUD  
❌ Menambahkan scoring logic di UI  
❌ Menggunakan prompt generik SaaS dashboard  
❌ Menggabungkan prompt ini dengan brainstorming prompt  

---

## 10. Definition of Success

Prompt ini dianggap berhasil jika:
- UI hasil Stitch konsisten dengan PRD
- Tidak ada interpretasi subjektif berlebih
- Engineer dapat langsung implement tanpa debat
- Dashboard fokus pada **insight, bukan noise**

---

## 11. Catatan Akhir

Prompt ini adalah:
- Dokumen **produk**, bukan sekadar prompt desain
- Kontrak tidak tertulis antara Product, Design, dan Engineering

Jika PRD berubah:
➡️ Prompt **WAJIB** diperbarui.

---

**Status Dokumen:** FINAL  
**Digunakan untuk:** UI/UX Regeneration – Stitch with Google  
**Scope:** MVP Competitor Analysis Dashboard
