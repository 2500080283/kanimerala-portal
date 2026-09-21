# 🌾 Kanimerala Village Portal | కనిమెరల గ్రామ సమాచార వేదిక
> **Unnat Bharat Abhiyan (UBA) Rural Development & Analytics Intelligence Platform**  
> *Mylavaram Mandal, NTR District, Andhra Pradesh • PIN: 521230*

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F2500080283%2Fkanimerala-portal)

---

## 📌 About the Project

This portal provides an interactive dashboard, socio-economic census register, and village development roadmap for **Kanimerala Village (Kanimerla)** in Mylavaram Mandal, NTR District, Andhra Pradesh.

The portal synthesizes granular field survey data from **49 households (140 residents)** surveyed on **June 7, 2026** by student enumerator teams under the **Unnat Bharat Abhiyan (UBA)** initiative of the Ministry of Education, Government of India.

---

## 🚀 Live Demo & Deployment

Deploy directly to Vercel with one click:
👉 **[Deploy to Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F2500080283%2Fkanimerala-portal)**

Or import `2500080283/kanimerala-portal` from your Vercel dashboard at [vercel.com/new](https://vercel.com/new).

---

## 📊 Key Village Statistics

| Indicator | Value | Reality on the Ground |
| :--- | :--- | :--- |
| **Total Households Surveyed** | **49** | Complete baseline coverage |
| **Total Population** | **140** | 73 Females (52.1%) • 67 Males (47.9%) |
| **Sex Ratio** | **1,090** | Healthy sex ratio (females per 1,000 males) |
| **Tribal Composition (ST)** | **85.7%** | 120 Banjara / Sugali Lambadi community members |
| **Poverty Status (BPL)** | **51.0%** | 25 households earning ≤ ₹1 Lakh annually |
| **Pucca Housing** | **93.9%** | 46 concrete/brick homes |
| **Drainage Deficit** | **67.3%** | 33 homes report no drainage / stagnant wastewater |
| **Mineral Water Cans** | **46.9%** | 23 households buy 20L commercial RO cans due to tap water quality |
| **MNREGA Job Card Gap** | **79.3%** | 111 out of 140 individuals lack active MNREGA cards |
| **Primary Horticultural Crop** | **Mango** | Major mango cultivation belt in Mylavaram/Nuzvid |

---

## 🛠️ Features

- 📱 **Interactive Executive Dashboard**: KPI cards, alert banners, demographic summaries.
- 🔍 **Dynamic Household Directory**: Instant multi-field search and multi-facet filtering (Category, BPL/APL, House Type, Drainage, Grievances).
- 📋 **Full Family Roster Modal**: Granular profiles of all 49 households with individual member rosters, assets, crops, and verbatim remarks.
- 📈 **Interactive Visualizations**: Powered by Chart.js (Categories, Age Pyramids, Literacy, Crop produces, Drainage status, Health ailments).
- 🚨 **Citizen Grievance Matrix**: Categorized community voices on Drainage, Drinking Water Tanks, RTC Bus transit, and Land Titles ("Paatalu").
- 🗺️ **Village Development Plan (VDP)**: Actionable 3-phase policy and engineering roadmap.
- 💾 **CSV & Print Export**: Instant export of household register and individual population census.
- 🌓 **Adaptive Theme**: Dark mode and Light mode with persistent preferences.

---

## 📂 Repository Structure

```
kanimerala-portal/
├── index.html                  # Core portal interface
├── css/
│   └── styles.css              # Custom responsive CSS design system
├── js/
│   ├── data.js                 # Consolidated dataset (49 HH, 140 members)
│   ├── charts.js               # Responsive Chart.js visualizations
│   └── app.js                  # Search, filter, modal, and export logic
├── assets/
│   └── favicon.svg             # Village vector emblem
├── kanimerala/                 # 49 raw UBA survey JSON files
├── build_dataset.py            # Data preprocessing & aggregation pipeline
├── vercel.json                 # Vercel deployment & security headers config
├── .vercelignore               # Deployment exclusion rules
└── README.md                   # Project documentation
```

---

## 💻 Local Development

To run locally without dependencies:

```bash
# Clone the repository
git clone https://github.com/2500080283/kanimerala-portal.git

# Navigate into directory
cd kanimerala-portal

# Start local server (Python or Node)
python -m http.server 8080

# Open in browser: http://localhost:8080
```
