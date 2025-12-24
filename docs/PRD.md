```markdown
# PRODUCT REQUIREMENTS DOCUMENT (PRD) – FINAL
# Competitor Analysis Dashboard
# Architecture: Scraping → n8n → Database → Dashboard

---

## 1. PRODUCT OVERVIEW

### 1.1 Product Name
Competitor Analysis Dashboard

### 1.2 Product Vision
Menyediakan sistem terpusat untuk mengubah data hasil scraping kompetitor menjadi insight bisnis yang terstruktur, objektif, dan siap digunakan melalui dashboard analisis.

### 1.3 Problem Statement
Analisis kompetitor saat ini memiliki masalah utama:
- Data tersebar dan tidak konsisten
- Sulit dilakukan perbandingan objektif
- Insight bergantung pada interpretasi manual
- Tidak scalable untuk banyak kompetitor atau market

### 1.4 Solution
Sebuah web app dashboard yang:
- Mengonsumsi data kompetitor hasil scraping
- Menggunakan n8n sebagai data processing & logic layer
- Menyajikan data yang sudah dinormalisasi, diskor, dan siap dianalisis

---

## 2. PRODUCT GOALS & SUCCESS METRICS

### 2.1 Goals
- Menjadi single source of truth data kompetitor
- Mempercepat proses competitor analysis
- Menyediakan dasar kuat untuk automation & AI analysis

### 2.2 Success Metrics (MVP)
| Metric | Target |
|------|--------|
Time-to-first-insight | < 5 menit
Jumlah kompetitor per project | ≥ 10
Penggunaan comparison view | ≥ 70%
Insight tercatat per user | ≥ 1

---

## 3. TARGET USERS

### 3.1 Primary Users
- Founder UMKM / Startup
- Digital Marketer
- Business Analyst
- Konsultan / Agency

### 3.2 User Persona
**Business Analyst / Founder**
- Mengandalkan data publik
- Membutuhkan analisis berbasis data
- Fokus pada positioning, peluang, dan risiko

---

## 4. SYSTEM ARCHITECTURE

### 4.1 High-Level Flow
````
Scraper
↓
n8n (Cleaning → Normalization → Enrichment → Scoring)
↓
Database / API
↓
Competitor Analysis Dashboard

```

### 4.2 Component Roles
- Scraper: Mengambil data mentah (Google Maps / Website)
- n8n: Satu-satunya layer logika & pengolahan data
- Database: Menyimpan data final & derived
- Dashboard: Read-only visualization & analysis

---

## 5. SCOPE DEFINITION

### 5.1 In Scope (MVP)
- Ingest data hasil scraping
- Normalisasi & validasi data via n8n
- Perhitungan skor & indikator kompetitif
- Dashboard overview & comparison
- SWOT berbasis data turunan
- Insight & notes

### 5.2 Out of Scope
- Live / real-time scraping
- AI prediction lanjutan
- Kolaborasi multi-user
- Export laporan (PDF / CSV)

---

## 6. FUNCTIONAL REQUIREMENTS

### 6.1 Data Ingestion
- Sistem menerima data terstruktur dari n8n
- Data harus tervalidasi sebelum disimpan
- Raw data tidak boleh langsung masuk dashboard

---

### 6.2 Competitor Entity
Field wajib:
- place_id
- name
- main_category
- rating
- reviews
- website
- address
- operational_status
- market_query

---

### 6.3 Dashboard Overview
Menampilkan:
- Total kompetitor
- Distribusi rating
- Jumlah kompetitor per kategori
- Risk indicator (low rating / closed)
- Market keyword (query)

---

### 6.4 Comparison View
Perbandingan antar kompetitor berdasarkan:
- Rating
- Review count
- Website availability
- Ads indicator
- Digital readiness score
- Reputation score

---

### 6.5 SWOT Analysis (Derived)
SWOT dihasilkan dari data turunan:
- Strength: rating tinggi, review banyak
- Weakness: tanpa website, review rendah
- Opportunity: kompetisi rendah
- Threat: kompetitor dengan reputasi tinggi

---

### 6.6 Insight & Notes
- User dapat menambahkan insight manual
- Insight memiliki tag & timestamp
- Insight terhubung ke kompetitor terkait

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance
- Dashboard load time < 2 detik
- API response < 500 ms

### 7.2 Security
- Data isolation per user / project
- Dashboard hanya membaca data final

### 7.3 Scalability
- Siap multi-market & multi-source
- Logika scoring modular (via n8n)

---

## 8. DATA MODEL (FINAL)

### 8.1 Competitors
```json
{
  "id": "uuid",
  "place_id": "string",
  "name": "string",
  "main_category": "string",
  "categories": ["string"],
  "rating": 4.6,
  "reviews": 128,
  "website": "string|null",
  "address": "string",
  "is_spending_on_ads": false,
  "operational_status": "open|closed|temporary",
  "market_query": "string",
  "last_updated": "ISO_DATE"
}
````

---

### 8.2 Derived Metrics

```json
{
  "digital_readiness_score": 0.75,
  "reputation_score": 0.82,
  "competition_level": "Low|Medium|High",
  "risk_flag": false
}
```

---

### 8.3 SWOT

```json
{
  "strength": ["High rating", "Strong reviews"],
  "weakness": ["No website"],
  "opportunity": ["Low competitor density"],
  "threat": ["High-rated competitor nearby"]
}
```

---

## 9. SCORING LOGIC (MVP)

```
Reputation Score =
(rating * 0.6) + (normalized_reviews * 0.4)

Digital Readiness Score =
(website ? 0.4 : 0) +
(is_spending_on_ads ? 0.3 : 0) +
(featured_image ? 0.3 : 0)

Competition Level =
competitors_count / market_threshold
```

---

## 10. MVP TIMELINE

| Week   | Activity                    |
| ------ | --------------------------- |
| Week 1 | Final schema & n8n workflow |
| Week 2 | Data ingestion & scoring    |
| Week 3 | Dashboard UI                |
| Week 4 | Testing & deployment        |

---

## 11. RISKS & MITIGATION

| Risk                    | Mitigation                  |
| ----------------------- | --------------------------- |
| Dirty scraping data     | Strict normalization di n8n |
| Insight kurang bernilai | Fokus derived metrics       |
| Feature creep           | Lock scope MVP              |

---

## 12. DEFINITION OF DONE

* Pipeline scraping → n8n → dashboard berjalan end-to-end
* Semua data tervalidasi & ternormalisasi
* Dashboard hanya konsumsi final schema
* Insight dapat dihasilkan tanpa interpretasi subjektif berlebih

---

## 13. FUTURE ENHANCEMENTS

* AI-generated SWOT & summary
* Competitor change detection
* Geo-based competition map
* Collaboration & reporting layer

---

Document Status: FINAL
Ready for: Engineering Implementation
Last Updated: 2025-01-12