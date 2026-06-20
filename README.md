# EcoSphere AI - Carbon Intelligence Platform (Vite & React Edition)

EcoSphere AI is a next-generation, AI-powered carbon intelligence coach designed to automatically measure, analyze, predict, and reduce an individual's carbon footprint. It features passive data simulation, advanced behavioral science nudges, community engagement, and a verified offsets ledger.

This version introduces a complete **Vite + React Single-Page Application (SPA)** structure containing a procedurally generated **3D Rotating miniature planet** (rendered with Three.js) and an **Interactive AI Carbon Coach** dialog client.

---

## 1. Chosen Challenge Vertical & Persona
- **Vertical**: Daily Commute & Lifestyle Optimization for Urban Professionals (The Smart Commuter)
- **Persona**: *Alex, the Tech-Savvy Urbanite* (28 years old, hybrid worker, commutes by car occasionally, buys average retail, banking conventionally). Alex wants to measure and offset carbon emissions through simple daily actions without dealing with complex calculations or static tables.

---

## 2. Carbon Coefficient Formulas (Scope 1, 2, and 3)
The platform performs calculations based on the following daily emission coefficients ($kg\ CO_2e$):

### A. Transportation (Scope 1)
Calculated as: `daily_emissions = transport_mode_coefficient * daily_km`
* **Gas Car:** `0.18 kg CO₂e / km`
* **Electric Vehicle (EV):** `0.04 kg CO₂e / km` (accounts for regional grid charging emissions)
* **Public Transit:** `0.05 kg CO₂e / km`
* **Bicycle / Walking:** `0.00 kg CO₂e / km`

### B. Nutritional Diet (Scope 3 - Agriculture & Logistics)
Calculated as a flat daily factor based on diet style:
* **Heavy Meat Eater:** `7.2 kg CO₂e / day`
* **Balanced / Average Diet:** `4.8 kg CO₂e / day`
* **Low Meat / Vegetarian:** `3.1 kg CO₂e / day`
* **Strict Vegan:** `1.6 kg CO₂e / day`

### C. Home Energy (Scope 2 & Scope 1 Heating)
Calculated as: `daily_emissions = home_size_coefficient * energy_source_multiplier`
* **Home Sizes (Baseline):** Apartment (`2.2`), Townhouse (`4.5`), Stand-alone House (`7.0`)
* **Source Multipliers:** Fossil Fuels (Coal/Gas: `1.5`), Standard Grid Mix (`1.0`), 100% Renewables / Solar (`0.1`)

### D. Consumer Shopping (Scope 3 - Manufacturing & Supply Chain)
Flat daily factor representing household goods consumption:
* **High Purchases:** `6.2 kg CO₂e / day`
* **Average Purchases:** `3.5 kg CO₂e / day`
* **Minimal / Second-hand:** `1.2 kg CO₂e / day`

### E. Waste & Recycling (Scope 3 - End-of-life)
Flat daily factor representing municipal waste processing:
* **No Recycling / Composting:** `1.8 kg CO₂e / day`
* **Partial Recycling:** `0.9 kg CO₂e / day`
* **Full Composting & Recycling:** `0.1 kg CO₂e / day`

### F. Digital Footprint (Scope 3 - Financed Data Center Energy)
* **Low (<1 hr/day):** `0.1 kg CO₂e / day`
* **Average (1-4 hrs/day):** `0.5 kg CO₂e / day`
* **High (4+ hrs/day HD/4K):** `1.5 kg CO₂e / day`

### G. Financial Financed Emissions (Scope 3 - Indirect Capital Investment)
* **Green Banks / ESG portfolios:** `0.2 kg CO₂e / day`
* **Balanced Mix:** `1.8 kg CO₂e / day`
* **Conventional Commercial Banks:** `4.5 kg CO₂e / day` (high fossil fuel financing)

---

## 3. Assumptions and Standards Alignment
* **Sustainable Target Budget:** The platform sets a target daily budget of **8.0 kg CO₂e**. This aligns with the United Nations IPCC pathways targeting a limit of 1.5°C global warming by 2030 (scaled down to individual daily shares).
* **Scope 3 Financed Emissions:** Emphasizes that traditional banking deposits fund fossil fuels. Moving capital to an ESG bank cuts indirect emissions by ~4.5 kg CO₂e/day.
* **Additionality in Offsets:** Offset credits assume verified standards (Verra and Gold Standard) with confidence scores reflecting durability and additionality.

---

## 4. Technology Stack & Directory Structure
- **Vite & React (SPA):** Modular component structure, local state context provider.
- **Three.js:** Procedural WebGL 3D rendering for the interactive 3D planet.
- **CSS3:** Custom styles, custom range sliders, glassmorphic styling, keyframe animations, and transitions.
- **Local Storage:** State serialization and cookie consent persistence.

### Key Directory Layout
- `index.html`: Main layout viewport and metadata.
- `src/main.jsx`: Application bootstrap entry point.
- `src/App.jsx`: Component manager and layout grid.
- `src/AppStateContext.jsx`: Context provider hosting state variables, carbon calculations, and unit tests.
- `src/index.css`: Style sheets (Abeto and abtc.com dark themed layout).
- `src/components/`:
  - `CourierPlanet.jsx`: WebGL Three.js canvas rendering the 3D interactive planet.
  - `DashboardTab.jsx`: User twin display, carbon category breakdown, GPS auto-sync, and receipt parsing.
  - `QuizTab.jsx`: Step-by-step onboarding questionnaire.
  - `ActionsTab.jsx`: Habit logger checklist.
  - `AICoachTab.jsx`: Dialog coach and weekly agenda planner.
  - `CommunityTab.jsx`: Social feed and leagues.
  - `MarketplaceTab.jsx`: Offset ledger sponsorship.
  - `DeveloperTools.jsx`: Interactive unit test runner.

---

## 5. Verification & Unit Testing
An interactive test dashboard is built directly into the application. Click **"Run Tests"** in the header to launch the test suite, which runs assertions verifying:
1. **Carbon Calculator Engines:** Correct transport, diet, and energy factors calculations.
2. **Receipt AI Parsing Logic:** Accuracy in scanning apparel, transit, and aviation keywords.
3. **AI Coach Bot Router:** Intent routing for greetings, carbon twin audits, and green banking queries.
4. **State Sync & Live Calculations:** Live points calculations and footprint updates on habit logging.
5. **WebGL Scene Initialization:** Verifies Three.js library loading and scene rendering constructors.

---

## 6. How to Run Locally

### Prerequisites
- Node.js (v18+) and npm installed.

### Steps
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open the local address shown in your terminal (typically `http://localhost:5173`) in your web browser.
4. Sign in with the preloaded mock credentials:
   - **Email:** `jane.doe@example.com`
   - **Password:** `password123`
   - (Or click **Google Account** to trigger simulated OAuth).
