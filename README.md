# EcoSphere AI - Carbon Intelligence Platform

EcoSphere AI is a next-generation, AI-powered carbon intelligence coach designed to automatically measure, analyze, predict, and reduce an individual's carbon footprint. It features passive data simulation, advanced behavioral science nudges, community engagement, and a verified offsets ledger.

This version introduces the **Carbon Courier 3D Planet**, a gamified WebGL simulator inspired by Vicente Lucendo's cozy planet delivery game *Messenger* (abeto.co).

---

## 1. Chosen Challenge Vertical
**Carbon Footprint Tracking & Behavior Modification**

EcoSphere AI targets long-term behavior modification by translating complex ecological data into a playful, interactive experience. Instead of static tables, the dashboard displays a **3D Rotating miniature planet** (procedurally rendered with Three.js). The user controls a **Carbon Courier** sprite standing on the planet. By logging green actions, users trigger quest markers above landmarks on the planet, guiding the courier to complete the delivery and visually clean up the ecosystem.

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

## 4. User Guide & Features

To run the platform locally, simply open `index.html` in any web browser.

1. **Authentication:** Sign in using the mock credentials (`jane.doe@example.com` / `password123`) or click **Google Account** to trigger a simulated Google Sign-In.
2. **Onboarding Quiz:** Access the quiz tab to calibrate your initial carbon baseline. Adjust options across transport, diet, energy, shopping, digital activities, and finance.
3. **Carbon Courier 3D Planet:** View your rotating planet on the dashboard.
   * **Controls:** Press `A` / `D` or `Left` / `Right` Arrow keys to walk the courier on the surface. Click and drag the ocean to spin the planet manually.
   * **Deliveries:** When a green action is unlocked or simulated, a bouncing mail/arrow icon appears above its landmark. Walk the courier to it, and press `SPACE` or click it to complete the delivery and log the action!
   * **Visual Climate States:**
     * *Clean state (<= 8.0 kg/day):* Green continents, blue oceans, healthy trees, and rotating clean energy wind turbines.
     * *Polluted state (> 8.0 kg/day):* Dusty brown land, dark grey oceans, withered trees, and stationary turbine blades.
4. **GPS mobility tracker:** Toggle the switch to simulate automated travel tracking. The GPS simulator automatically detects transit rides and triggers a quest marker at the Train Station.
5. **E-Commerce receipt scanner:** Type or select a mock receipt (e.g. Amazon jacket, Uber trip, grocery bill) and click "AI Parse" to parse the item, display emissions, confidence bar, and trigger a delivery quest above the market landmark.
6. **AI Sustainability Coach:** Talk to the coach chatbot (type questions about "highest emitter", "digital", "finance", "weekly plan", or "transit") to receive context-aware, personalized footprint metrics.
7. **Social Feed:** Share custom posts, comment on neighbors' achievements, or applaud posts.
8. **Marketplace:** Check your points and spend them on sustainable discount vouchers or sponsor certified carbon offsets.

---

## 5. Accessibility (WCAG 2.1 Compliance)
* **Keyboard Navigation:** Custom option cards, sidebar navigation, and weekly planner cards are fully focusable using `Tab` and selectable using `Space` or `Enter`.
* **ARIA Attributes:** Landmark elements, modal screens, progress sliders, and text boxes are labeled with proper ARIA attributes (`role="radio"`, `aria-checked`, `aria-label`).
* **Visual Focus Rings:** Explicit visible outline borders appear on focused elements for low-vision and keyboard-only users.

---

## 6. Technology Stack
* **HTML5:** Semantic architecture, accessible forms, overlays.
* **Three.js:** Procedural WebGL 3D rendering, mesh geometry generation, and directional lighting animation.
* **Vanilla CSS3:** Custom styles, custom range sliders, glassmorphic styling, keyframe animations, and transitions.
* **Vanilla JavaScript (ES6):** State serialization, cookie persistence, popups, dynamic charts, context-aware chatbot router, and WebGL physics.
