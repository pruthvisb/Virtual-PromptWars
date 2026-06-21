# Testing Strategy - EcoVerse

This document explains the testing framework, test assertions structure, and instructions to run unit/component tests in the **EcoVerse** project.

---

## 🧪 Testing Framework

EcoVerse uses **Vitest** as its primary test runner:
- **Fast Execution**: Operates as a ESM-first test runner compatible with Vite.
- **Hoisted Mocking**: Utilizes `vi.hoisted` blocks to setup mock environments (such as mocking `window.localStorage` and global `fetch` routes) before Zustand store modules are loaded.
- **Client-Side Fallbacks**: Validates that store methods fall back gracefully when backend Node or PHP services are unreachable.

---

## 📈 Test Coverage Areas

Our suite [useStore.test.ts](file:///c:/Users/AstroCluster/Desktop/physics/src/store/useStore.test.ts) runs 14 comprehensive tests verifying:

### 1. Leveling System Helpers
- Lvl 1 to 5 progression bounds based on XP accumulation thresholds.
- Safe clamping logic to handle boundaries (e.g. `<= 0` XP or extreme values).

### 2. State Setters & Game Logic
- Authentication toggle states.
- Toast notifications scheduling and clearing.
- Customizations locking (equipping items).
- Publishing achievements to the community feed.

### 3. Footprint twin Engine
- Correct Scope 1, 2, 3 carbon footprint calculations matching the IPCC coefficients formulas.
- Validates the `updateCarbonTwin` action and the correct emissions saved math.

---

## ⚙️ Running the Test Suite

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Execute Tests**:
   ```bash
   npm run test
   ```
3. **Verify Build**:
   ```bash
   npm run build
   ```
