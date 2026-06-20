// EcoSphere AI - Core Application Script (with "Abeto Messenger" WebGL Planet)

// 1. Initial State
const defaultState = {
  isLoggedIn: false,
  userName: 'Jane Doe',
  userEmail: 'jane.doe@example.com',
  points: 450,
  streak: 4,
  carbonSaved: 12.4, // total lifetime savings in kg
  baselineCarbon: 18.2, // daily baseline footprint in kg
  currentCarbon: 18.2,  // active footprint today
  dailyBudget: 8.0, // target sustainable daily carbon budget in kg
  completedActions: [], // IDs of actions completed today
  quizAnswers: {
    transportMode: 'car',
    transportKm: 20,
    dietType: 'average',
    homeSize: 'medium',
    energySource: 'grid',
    shoppingLevel: 'average',
    wasteRecycle: 'partial',
    digitalStreaming: 'average',
    financialInvest: 'conventional'
  },
  chatHistory: [
    { sender: 'bot', text: 'Hi! I am EcoSphere AI, your personal Carbon Intelligence Coach. Ask me anything about reducing your footprint, sustainable habits, or how your score is calculated!' }
  ],
  socialPosts: [
    {
      id: 'post_1',
      avatar: 'S',
      avatarBg: '#3b82f6',
      author: 'Sarah Jenkins',
      time: '2 hours ago',
      content: 'Just switched my conventional savings account to a green banking provider that does not finance fossil fuels. Removed about 4.5 kg of indirect CO₂ per day! 🏦🌱',
      applauds: 22,
      userApplauded: false,
      comments: [
        { author: 'Ben Miller', text: 'Awesome move Sarah! Money is a silent footprint driver.' }
      ]
    },
    {
      id: 'post_2',
      avatar: 'A',
      avatarBg: '#a78bfa',
      author: 'Alex Rivera',
      time: '5 hours ago',
      content: 'Biked to my volunteer clean-up meeting. Swapping the SUV saved 4.2 kg today! 🚴🧹',
      applauds: 15,
      userApplauded: false,
      comments: []
    }
  ],
  gpsActive: false,
  parsedTransaction: null,
  activeWeeklyPlan: null // 'budget', 'impact', or 'quick'
};

let state = JSON.parse(JSON.stringify(defaultState));
let cookieConsent = null;

// 2. Cookie Handling Helpers
function setCookie(name, value, days = 7) {
  if (cookieConsent === 'decline' && name !== 'cookie-consent') return;
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  const serializedValue = (typeof value === 'object') ? JSON.stringify(value) : value;
  document.cookie = name + "=" + encodeURIComponent(serializedValue) + ";" + expires + ";path=/;SameSite=Lax";
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) {
      const val = decodeURIComponent(c.substring(nameEQ.length, c.length));
      try { return JSON.parse(val); } catch (e) { return val; }
    }
  }
  return null;
}

function deleteCookie(name) {
  document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;SameSite=Lax";
}

function saveStateToCookies() {
  if (state.isLoggedIn && cookieConsent === 'accept') {
    setCookie('ecosphere_ai_state', state, 7);
  }
}

function loadStateFromCookies() {
  cookieConsent = getCookie('cookie-consent');
  
  const cookieBanner = document.getElementById('cookie-banner');
  if (cookieBanner) {
    if (!cookieConsent) {
      cookieBanner.classList.add('active');
    } else {
      cookieBanner.classList.remove('active');
    }
  }

  const sessionToken = getCookie('ecosphere_session_token');
  if (sessionToken && cookieConsent === 'accept') {
    const savedState = getCookie('ecosphere_ai_state');
    if (savedState) {
      state = savedState;
      updateUIStats();
      syncSidebarProfile();
    }
  }
}

// 3. Action Items Database (Linked to Quest landmarks)
const actionsDatabase = [
  { id: 'commute_bike', name: 'Commute by Bike / Walk', desc: 'Swap a fossil-fuel vehicle trip for active travel.', category: 'transport', savings: 3.6, points: 50, landmark: 'station' },
  { id: 'public_transit', name: 'Take Public Transit', desc: 'Ride the bus or train instead of driving.', category: 'transport', savings: 2.2, points: 30, landmark: 'station' },
  { id: 'meatless_meal', name: 'Eat a Plant-Based Meal', desc: 'Skip meat and dairy for a healthy vegan or vegetarian dish.', category: 'food', savings: 1.8, points: 25, landmark: 'cafe' },
  { id: 'local_produce', name: 'Buy Local Produce', desc: 'Reduce food miles by purchasing from regional growers.', category: 'food', savings: 0.6, points: 15, landmark: 'market' },
  { id: 'turn_down_heating', name: 'Lower Thermostat by 2°F', desc: 'Conserve natural gas or electric space heating.', category: 'energy', savings: 1.2, points: 20, landmark: 'townhouse' },
  { id: 'cold_wash', name: 'Cold Water Laundry Wash', desc: 'Wash clothes at 30°C or colder to save grid heating energy.', category: 'energy', savings: 0.8, points: 15, landmark: 'townhouse' },
  { id: 'hang_dry', name: 'Line Dry Clothes', desc: 'Skip the high-energy electric tumble dryer.', category: 'energy', savings: 1.5, points: 25, landmark: 'townhouse' },
  { id: 'compost_waste', name: 'Compost Organic Waste', desc: 'Avoid landfill methane gas emissions.', category: 'waste', savings: 0.7, points: 15, landmark: 'recycle' },
  { id: 'reusable_cup', name: 'Use Reusable Items', desc: 'Skip plastic bottles, bags, and coffee cups.', category: 'shopping', savings: 0.3, points: 10, landmark: 'market' },
  { id: 'second_hand', name: 'Buy Second-Hand Goods', desc: 'Obtain books, apparel, or electronics pre-loved.', category: 'shopping', savings: 4.5, points: 40, landmark: 'market' },
  { id: 'digital_cleaning', name: 'Declutter Cloud & Streaming', desc: 'Clean old attachments and watch stream in SD instead of 4K.', category: 'digital', savings: 0.4, points: 10, landmark: 'datacenter' },
  { id: 'green_portfolio', name: 'Transition to Green Banking', desc: 'Switch deposits to a bank that does not invest in fossil fuels.', category: 'finance', savings: 4.5, points: 80, landmark: 'bank' }
];

// 4. Rewards & Offsets Marketplace
const rewardsDatabase = [
  { id: 'train_discount', partner: 'City Transit Authority', title: '50% Off Train Ticket', desc: 'Claim a half-price single trip voucher for public transit.', cost: 300, category: 'transport', redeemed: false },
  { id: 'plant_tree', partner: 'Eden Projects', title: 'Plant 2 Native Trees', desc: 'Directly fund planting 2 trees in certified mangrove regions.', cost: 200, category: 'ngo', redeemed: false },
  { id: 'eco_soap', partner: 'ZeroWaste Shop', title: 'Free Plastic-Free Soap', desc: 'Redeem a solid shampoo bar with zero packaging.', cost: 400, category: 'shopping', redeemed: false },
  { id: 'utility_credit', partner: 'CleanGrid Energy', title: '$10 Smart Meter Rebate', desc: 'Receive credit on your renewable energy electrical bill.', cost: 500, category: 'utility', redeemed: false }
];

const offsetsDatabase = [
  { id: 'offset_amazon', title: 'Amazon Forest Protection', registry: 'Verra ID: 2603', standard: 'VCS + CCB Gold', efficiency: 'High Additionality', cost: 150, confidence: 96 },
  { id: 'offset_india_solar', title: 'Rajasthan Community Solar', registry: 'Gold Standard: 5801', standard: 'GS CDM', efficiency: 'Social Benefits', cost: 100, confidence: 91 },
  { id: 'offset_blue_carbon', title: 'Blue Carbon Wetland Restore', registry: 'Verra ID: 3105', standard: 'VCS Wetlands', efficiency: 'High Carbon Sink', cost: 250, confidence: 94 }
];

// 5. Leaderboard Mock Data
const leaderboardData = [
  { rank: 1, name: 'EcoWarrior_Sarah', points: 980, me: false },
  { rank: 2, name: 'GreenTransitBen', points: 840, me: false },
  { rank: 3, name: 'ZeroWasteAlex', points: 760, me: false },
  { rank: 4, name: 'You (Jane Doe)', points: 450, me: true },
  { rank: 5, name: 'PlantPowerDan', points: 420, me: false },
  { rank: 6, name: 'SolarChloe', points: 390, me: false }
];

// 6. Carbon Coefficients (kg CO2e per day / unit)
const carbonCoefficients = {
  transport: { car: 0.18, ev: 0.04, public: 0.05, bike_walk: 0.0 },
  diet: { heavy_meat: 7.2, average: 4.8, low_meat: 3.1, vegan: 1.6 },
  homeEnergy: {
    small: 2.2,
    medium: 4.5,
    large: 7.0,
    coal_gas: 1.5,
    grid: 1.0,
    clean_renewables: 0.1
  },
  shopping: { high: 6.2, average: 3.5, low: 1.2 },
  waste: { none: 1.8, partial: 0.9, full: 0.1 },
  digital: { low: 0.1, average: 0.5, high: 1.5 },
  finance: { green: 0.2, balanced: 1.8, conventional: 4.5 }
};

// 7. Navigation
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = link.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });
}

function switchTab(tabId) {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (link.getAttribute('data-tab') === tabId) {
      item.classList.add('active');
      link.setAttribute('aria-selected', 'true');
    } else {
      item.classList.remove('active');
      link.setAttribute('aria-selected', 'false');
    }
  });

  const pages = document.querySelectorAll('.tab-page');
  pages.forEach(page => {
    if (page.id === `${tabId}-page`) {
      page.classList.add('active');
    } else {
      page.classList.remove('active');
    }
  });

  const titleText = document.getElementById('tab-title-text');
  const subtitleText = document.getElementById('tab-subtitle-text');
  if (titleText && subtitleText) {
    if (tabId === 'dashboard') {
      titleText.textContent = 'Carbon Intelligence Pulse';
      subtitleText.textContent = 'Observe your AI Carbon Twin, analyze categories, and sync automatic trackers.';
    } else if (tabId === 'quiz') {
      titleText.textContent = 'Intelligence Profiling';
      subtitleText.textContent = 'Complete your baseline carbon calculations across 6 core lifestyle domains.';
    } else if (tabId === 'actions') {
      titleText.textContent = 'Habit Tracker';
      subtitleText.textContent = 'Check off daily sustainable actions to dynamically cut your footprint.';
    } else if (tabId === 'ai') {
      titleText.textContent = 'AI Sustainability Coach';
      subtitleText.textContent = 'Ask your coach climate questions and generate tailored weekly action agendas.';
    } else if (tabId === 'community') {
      titleText.textContent = 'Citizen Feed & Leagues';
      subtitleText.textContent = 'Collaborate on neighborhood co-op quests, applaud friends, and view leaderboards.';
    } else if (tabId === 'marketplace') {
      titleText.textContent = 'Carbon Marketplace & Offsets';
      subtitleText.textContent = 'Redeem rewards and support verified carbon offset programs.';
    }
  }

  // Reload views
  if (tabId === 'dashboard') {
    renderDashboardCharts();
    updateProgressRing();
    drawProjectionsChart();
    // Trigger WebGL viewport resize if needed
    if (planetGame && planetGame.renderer) {
      planetGame.onWindowResize();
    }
  } else if (tabId === 'actions') {
    renderActionsList();
  } else if (tabId === 'ai') {
    renderRecommendations();
    renderWeeklyPlannerGrid();
    scrollToLastMessage();
  } else if (tabId === 'community') {
    renderLeaderboard();
    renderSocialFeed();
  } else if (tabId === 'marketplace') {
    renderRewards();
    renderOffsets();
  }
}

// 8. Onboarding Quiz Handler (6 Steps)
let currentQuizStep = 1;
const totalQuizSteps = 6;

function initQuizWizard() {
  const kmSlider = document.getElementById('quiz-km-slider');
  const kmValDisplay = document.getElementById('quiz-km-val');
  if (kmSlider && kmValDisplay) {
    kmSlider.addEventListener('input', (e) => {
      kmValDisplay.textContent = `${e.target.value} km`;
      state.quizAnswers.transportKm = parseInt(e.target.value);
      kmSlider.setAttribute('aria-valuenow', e.target.value);
    });
  }

  const optionCards = document.querySelectorAll('.quiz-option-card');
  optionCards.forEach(card => {
    // Click selection
    card.addEventListener('click', () => {
      selectQuizOption(card);
    });

    // Keyboard selection (Space/Enter)
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        selectQuizOption(card);
      }
    });
  });

  const nextBtn = document.getElementById('quiz-next-btn');
  const prevBtn = document.getElementById('quiz-prev-btn');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentQuizStep < totalQuizSteps) {
        currentQuizStep++;
        showQuizStep(currentQuizStep);
      } else {
        calculateBaselineFootprint();
        showToast('Advanced Carbon Twin calibrated!', 'success');
        switchTab('dashboard');
      }
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentQuizStep > 1) {
        currentQuizStep--;
        showQuizStep(currentQuizStep);
      }
    });
  }

  const restartQuizBtn = document.getElementById('recalculate-btn');
  if (restartQuizBtn) {
    restartQuizBtn.addEventListener('click', () => {
      currentQuizStep = 1;
      showQuizStep(1);
      switchTab('quiz');
    });
  }

  showQuizStep(currentQuizStep);
}

function selectQuizOption(card) {
  const parentGrid = card.parentElement;
  const category = parentGrid.getAttribute('data-category');
  const val = card.getAttribute('data-val');

  parentGrid.querySelectorAll('.quiz-option-card').forEach(sibling => {
    sibling.classList.remove('selected');
    sibling.setAttribute('aria-checked', 'false');
  });

  card.classList.add('selected');
  card.setAttribute('aria-checked', 'true');
  state.quizAnswers[category] = val;
}

function showQuizStep(step) {
  const steps = document.querySelectorAll('.quiz-step-panel');
  steps.forEach(s => s.classList.remove('active'));

  const activeStep = document.getElementById(`quiz-step-${step}`);
  if (activeStep) activeStep.classList.add('active');

  const progressLine = document.querySelector('.quiz-progress-line');
  if (progressLine) {
    const percent = ((step - 1) / (totalQuizSteps - 1)) * 100;
    progressLine.style.width = `${percent}%`;
  }

  const stepsIndicators = document.querySelectorAll('.quiz-progress-step');
  stepsIndicators.forEach((ind, index) => {
    const indStep = index + 1;
    ind.classList.remove('active', 'completed');
    if (indStep === step) {
      ind.classList.add('active');
    } else if (indStep < step) {
      ind.classList.add('completed');
    }
  });

  const prevBtn = document.getElementById('quiz-prev-btn');
  const nextBtn = document.getElementById('quiz-next-btn');
  if (prevBtn) {
    prevBtn.style.visibility = step === 1 ? 'hidden' : 'visible';
  }
  if (nextBtn) {
    nextBtn.textContent = step === totalQuizSteps ? 'Calibrate AI Twin' : 'Continue';
  }
}

// 9. Calculation Engine
function calculateBaselineFootprint() {
  const qa = state.quizAnswers;

  const transportDaily = carbonCoefficients.transport[qa.transportMode] * qa.transportKm;
  const dietDaily = carbonCoefficients.diet[qa.dietType];
  const homeBase = carbonCoefficients.homeEnergy[qa.homeSize];
  const energyMult = carbonCoefficients.homeEnergy[qa.energySource];
  const homeDaily = homeBase * energyMult;
  const shoppingDaily = carbonCoefficients.shopping[qa.shoppingLevel];
  const wasteDaily = carbonCoefficients.waste[qa.wasteRecycle];
  const digitalDaily = carbonCoefficients.digital[qa.digitalStreaming || 'average'];
  const financeDaily = carbonCoefficients.finance[qa.financialInvest || 'conventional'];

  state.baselineCarbon = parseFloat((transportDaily + dietDaily + homeDaily + shoppingDaily + wasteDaily + digitalDaily + financeDaily).toFixed(1));
  recalculateCurrentCarbon();
}

function recalculateCurrentCarbon() {
  let savingsToday = 0;
  state.completedActions.forEach(actionId => {
    const actionObj = actionsDatabase.find(a => a.id === actionId);
    if (actionObj) {
      if (actionId === 'commute_bike') {
        const qa = state.quizAnswers;
        if (qa.transportMode === 'car') {
          savingsToday += (carbonCoefficients.transport.car * qa.transportKm);
        } else {
          savingsToday += actionObj.savings;
        }
      } else if (actionId === 'public_transit') {
        const qa = state.quizAnswers;
        if (qa.transportMode === 'car') {
          const carSavings = carbonCoefficients.transport.car * qa.transportKm;
          const pubEmissions = carbonCoefficients.transport.public * qa.transportKm;
          savingsToday += Math.max(0.5, carSavings - pubEmissions);
        } else {
          savingsToday += actionObj.savings;
        }
      } else {
        savingsToday += actionObj.savings;
      }
    }
  });

  state.currentCarbon = parseFloat(Math.max(0, state.baselineCarbon - savingsToday).toFixed(1));
  
  updateUIStats();
  saveStateToCookies();

  // Dynamically update the 3D Planet visual climate state
  if (planetGame) {
    planetGame.updatePlanetClimate(state.currentCarbon);
  }
}

// 10. UI Stats Synchronizer
function updateUIStats() {
  const pointsEls = document.querySelectorAll('.user-points-val');
  pointsEls.forEach(el => el.textContent = state.points);

  const streakEls = document.querySelectorAll('.user-streak-val');
  streakEls.forEach(el => el.textContent = state.streak);

  const savedEls = document.querySelectorAll('.user-saved-val');
  savedEls.forEach(el => el.textContent = state.carbonSaved.toFixed(1));

  const baselineEl = document.getElementById('dash-baseline-val');
  if (baselineEl) baselineEl.textContent = state.baselineCarbon;

  const currentEl = document.getElementById('dash-current-val');
  if (currentEl) currentEl.textContent = state.currentCarbon;

  const activeSavedEl = document.getElementById('dash-saved-today-val');
  if (activeSavedEl) {
    const savedToday = parseFloat((state.baselineCarbon - state.currentCarbon).toFixed(1));
    activeSavedEl.textContent = savedToday;
  }

  const budgetStatusText = document.getElementById('dash-budget-status-text');
  if (budgetStatusText) {
    if (state.currentCarbon <= state.dailyBudget) {
      budgetStatusText.innerHTML = `Excellent! You are <span>${(state.dailyBudget - state.currentCarbon).toFixed(1)} kg</span> under the sustainable global carbon target.`;
    } else {
      budgetStatusText.innerHTML = `You are currently <span>${(state.currentCarbon - state.dailyBudget).toFixed(1)} kg</span> above the sustainable target. Try logging a green action.`;
    }
  }

  const userLevelVal = document.getElementById('user-level-val');
  if (userLevelVal) {
    const currentLevel = Math.floor(state.points / 500) + 1;
    userLevelVal.textContent = `Level ${currentLevel} Advocate`;
  }
}

// 11. AI Carbon Twin Avatar Visual Transitions
function updateProgressRing() {
  const avatarWrapper = document.getElementById('carbon-twin-avatar');
  if (!avatarWrapper) return;

  // Toggle visual states dynamically
  if (state.currentCarbon <= state.dailyBudget) {
    avatarWrapper.classList.remove('twin-polluted');
    avatarWrapper.classList.add('twin-clean');
  } else {
    avatarWrapper.classList.remove('twin-clean');
    avatarWrapper.classList.add('twin-polluted');
  }

  animateNumberDisplay('dash-pulse-num', state.currentCarbon, 1);
}

function animateNumberDisplay(elementId, targetVal, decimals = 0) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const startVal = parseFloat(el.textContent) || 0;
  if (startVal === targetVal) return;

  const duration = 800;
  const startTime = performance.now();

  function updateNumber(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const easeProgress = 1 - Math.pow(1 - progress, 3);
    const currentVal = startVal + (targetVal - startVal) * easeProgress;
    el.textContent = currentVal.toFixed(decimals);

    if (progress < 1) {
      requestAnimationFrame(updateNumber);
    }
  }

  requestAnimationFrame(updateNumber);
}

function renderDashboardCharts() {
  const qa = state.quizAnswers;

  const transportBase = carbonCoefficients.transport[qa.transportMode] * qa.transportKm;
  const dietBase = carbonCoefficients.diet[qa.dietType];
  const homeBase = carbonCoefficients.homeEnergy[qa.homeSize] * carbonCoefficients.homeEnergy[qa.energySource];
  const shoppingBase = carbonCoefficients.shopping[qa.shoppingLevel];
  const wasteBase = carbonCoefficients.waste[qa.wasteRecycle];
  const digitalBase = carbonCoefficients.digital[qa.digitalStreaming || 'average'];
  const financeBase = carbonCoefficients.finance[qa.financialInvest || 'conventional'];

  let transportDeduct = 0;
  let foodDeduct = 0;
  let energyDeduct = 0;
  let shoppingDeduct = 0;
  let wasteDeduct = 0;
  let digitalDeduct = 0;
  let financeDeduct = 0;

  state.completedActions.forEach(actionId => {
    const act = actionsDatabase.find(a => a.id === actionId);
    if (act) {
      let savings = act.savings;
      if (actionId === 'commute_bike' && qa.transportMode === 'car') {
        savings = carbonCoefficients.transport.car * qa.transportKm;
      } else if (actionId === 'public_transit' && qa.transportMode === 'car') {
        savings = Math.max(0.5, (carbonCoefficients.transport.car - carbonCoefficients.transport.public) * qa.transportKm);
      }

      if (act.category === 'transport') transportDeduct += savings;
      else if (act.category === 'food') foodDeduct += savings;
      else if (act.category === 'energy') energyDeduct += savings;
      else if (act.category === 'shopping') shoppingDeduct += savings;
      else if (act.category === 'waste') wasteDeduct += savings;
      else if (act.category === 'digital') digitalDeduct += savings;
      else if (act.category === 'finance') financeDeduct += savings;
    }
  });

  const categories = [
    { class: 'transport', name: 'Transit', val: Math.max(0, transportBase - transportDeduct), max: Math.max(6, transportBase) },
    { class: 'food', name: 'Diet', val: Math.max(0, dietBase - foodDeduct), max: Math.max(6, dietBase) },
    { class: 'energy', name: 'Home', val: Math.max(0, homeBase - energyDeduct), max: Math.max(6, homeBase) },
    { class: 'shopping', name: 'Shopping', val: Math.max(0, shoppingBase - shoppingDeduct), max: Math.max(6, shoppingBase) },
    { class: 'waste', name: 'Waste', val: Math.max(0, wasteBase - wasteDeduct), max: Math.max(6, wasteBase) },
    { class: 'digital', name: 'Digital', val: Math.max(0, digitalBase - digitalDeduct), max: Math.max(2, digitalBase) },
    { class: 'finance', name: 'Finance', val: Math.max(0, financeBase - financeDeduct), max: Math.max(6, financeBase) }
  ];

  const chartContainer = document.getElementById('dashboard-chart-container');
  if (!chartContainer) return;

  chartContainer.innerHTML = '';

  categories.forEach(cat => {
    const percentHeight = cat.max > 0 ? (cat.val / cat.max) * 100 : 0;

    const barWrapper = document.createElement('div');
    barWrapper.className = 'chart-bar-wrapper';

    // To ensure height animation runs cleanly upon load:
    barWrapper.innerHTML = `
      <div class="chart-bar-container">
        <div class="chart-bar-fill ${cat.class}" style="height: 0%">
          <span class="chart-value">${cat.val.toFixed(1)}</span>
        </div>
      </div>
      <span class="chart-label" title="${cat.name}">${cat.name}</span>
    `;

    chartContainer.appendChild(barWrapper);

    // Trigger height transition in next frame
    setTimeout(() => {
      const fill = barWrapper.querySelector('.chart-bar-fill');
      if (fill) fill.style.height = `${percentHeight}%`;
    }, 50);
  });

  // Render Equivalents
  const savedToday = parseFloat((state.baselineCarbon - state.currentCarbon).toFixed(1));
  const treeEquiv = Math.max(0, (state.carbonSaved + savedToday) * 0.05);
  const flightEquiv = Math.max(0, (state.carbonSaved + savedToday) * 0.004);
  const bulbEquiv = Math.max(0, (state.carbonSaved + savedToday) * 12);

  animateNumberDisplay('eq-trees-val', treeEquiv, 1);
  animateNumberDisplay('eq-flights-val', flightEquiv, 2);
  animateNumberDisplay('eq-bulbs-val', bulbEquiv, 0);
}

// 12. Dynamic Projections Chart
function drawProjectionsChart() {
  const baselineDot = document.getElementById('proj-baseline-dot');
  const baselineVal = document.getElementById('proj-baseline-val');
  const currentDot = document.getElementById('proj-current-dot');
  const currentVal = document.getElementById('proj-current-val');
  const targetDot = document.getElementById('proj-target-dot');
  const targetVal = document.getElementById('proj-target-val');

  if (!baselineDot || !currentDot || !targetDot) return;

  // Max scale is 25 kg
  const maxScale = 25;
  
  const basePercent = Math.min(100, (state.baselineCarbon / maxScale) * 100);
  const curPercent = Math.min(100, (state.currentCarbon / maxScale) * 100);
  const tarPercent = (state.dailyBudget / maxScale) * 100;

  baselineDot.style.bottom = `${basePercent}%`;
  if (baselineVal) baselineVal.textContent = `${state.baselineCarbon} kg`;

  currentDot.style.bottom = `${curPercent}%`;
  if (currentVal) currentVal.textContent = `${state.currentCarbon} kg`;

  targetDot.style.bottom = `${tarPercent}%`;
  if (targetVal) targetVal.textContent = `${state.dailyBudget} kg`;
}

// 13. Habit Checklist Logger
let currentActionsFilter = 'all';

function renderActionsList() {
  const container = document.getElementById('actions-checklist-container');
  if (!container) return;

  container.innerHTML = '';

  const filteredActions = actionsDatabase.filter(act => {
    if (currentActionsFilter === 'all') return true;
    return act.category === currentActionsFilter;
  });

  filteredActions.forEach(act => {
    const isChecked = state.completedActions.includes(act.id);

    let savingsVal = act.savings;
    if (act.id === 'commute_bike' && state.quizAnswers.transportMode === 'car') {
      savingsVal = parseFloat((carbonCoefficients.transport.car * state.quizAnswers.transportKm).toFixed(1));
    } else if (act.id === 'public_transit' && state.quizAnswers.transportMode === 'car') {
      savingsVal = parseFloat(((carbonCoefficients.transport.car - carbonCoefficients.transport.public) * state.quizAnswers.transportKm).toFixed(1));
    }

    const row = document.createElement('div');
    row.className = `action-row ${isChecked ? 'completed' : ''}`;
    row.innerHTML = `
      <div class="action-checkbox-container">
        <input type="checkbox" class="action-checkbox" id="chk-${act.id}" ${isChecked ? 'checked' : ''} aria-label="Log ${act.name}">
      </div>
      <div class="action-details">
        <span class="action-name">${act.name}</span>
        <span class="action-desc">${act.desc}</span>
        <div class="action-impact-stats">
          <span class="action-pill savings">-${savingsVal} kg CO₂</span>
          <span class="action-pill pts">+${act.points} pts</span>
          <span class="action-category-tag">${act.category}</span>
        </div>
      </div>
    `;

    const checkbox = row.querySelector('.action-checkbox');
    checkbox.addEventListener('change', () => {
      toggleAction(act.id, checkbox.checked);
    });

    container.appendChild(row);
  });
}

function toggleAction(actionId, isCompleted) {
  const actionObj = actionsDatabase.find(a => a.id === actionId);
  if (!actionObj) return;

  let savingsVal = actionObj.savings;
  if (actionId === 'commute_bike' && state.quizAnswers.transportMode === 'car') {
    savingsVal = parseFloat((carbonCoefficients.transport.car * state.quizAnswers.transportKm).toFixed(1));
  } else if (actionId === 'public_transit' && state.quizAnswers.transportMode === 'car') {
    savingsVal = parseFloat(((carbonCoefficients.transport.car - carbonCoefficients.transport.public) * state.quizAnswers.transportKm).toFixed(1));
  }

  if (isCompleted) {
    if (!state.completedActions.includes(actionId)) {
      state.completedActions.push(actionId);
      state.points += actionObj.points;
      state.carbonSaved += savingsVal;
      
      if (state.completedActions.length === 1) {
        state.streak += 1;
        showToast(`Streak extended to ${state.streak} days! 🔥`, 'success');
      }

      showToast(`Logged: ${actionObj.name}! +${actionObj.points} points.`, 'success');
      addAutoSocialPost(actionObj.name, savingsVal);
    }
  } else {
    const index = state.completedActions.indexOf(actionId);
    if (index > -1) {
      state.completedActions.splice(index, 1);
      state.points = Math.max(0, state.points - actionObj.points);
      state.carbonSaved = Math.max(0, state.carbonSaved - savingsVal);

      if (state.completedActions.length === 0) {
        state.streak = Math.max(0, state.streak - 1);
      }
      showToast(`Removed Action: ${actionObj.name}`, 'info');
    }
  }

  recalculateCurrentCarbon();
  renderActionsList();

  // If viewing the recommendations panel, update buttons
  const recPage = document.getElementById('ai-page');
  if (recPage && recPage.classList.contains('active')) {
    renderRecommendations();
  }

  // Update the 3D quests
  if (planetGame) {
    planetGame.refreshQuests();
  }
}

function addAutoSocialPost(actionName, carbonSaved) {
  const initials = getInitials(state.userName);
  const newPost = {
    id: `post_auto_${Date.now()}`,
    avatar: initials,
    avatarBg: '#f59e0b',
    author: state.userName,
    time: 'Just now',
    content: `I just completed "${actionName}" and cut my emissions by ${carbonSaved.toFixed(1)} kg today! 🌿📈`,
    applauds: 0,
    userApplauded: false,
    comments: []
  };

  state.socialPosts.unshift(newPost);
  saveStateToCookies();
}

function initActionsFilters() {
  const filterBtns = document.querySelectorAll('.actions-filters .filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentActionsFilter = btn.getAttribute('data-filter');
      renderActionsList();
    });
  });
}

// 14. Passive Tracker Simulators (GPS & Receipts Parser)
function initTrackingSimulators() {
  // GPS Toggle
  const gpsSwitch = document.getElementById('gps-sim-toggle');
  const gpsStatusText = document.getElementById('gps-sim-status');
  const gpsPanel = document.getElementById('gps-sim-panel');

  if (gpsSwitch && gpsStatusText && gpsPanel) {
    gpsSwitch.addEventListener('change', () => {
      state.gpsActive = gpsSwitch.checked;
      if (state.gpsActive) {
        gpsPanel.classList.add('sim-active-gps');
        gpsStatusText.textContent = 'Simulating background location tracking...';
        
        // Simulate finding a public transit commute after 2.5 seconds
        setTimeout(() => {
          if (state.gpsActive) {
            gpsStatusText.textContent = 'Transit Detected! Quest ready at Transit Hub (-2.2 kg)';
            showToast('GPS detected public transit! Bouncing quest marker active at the Train Station.', 'success');
            
            // Activate the station delivery quest in WebGL!
            if (planetGame) {
              planetGame.triggerQuest('public_transit');
            }
          }
        }, 2500);
      } else {
        gpsPanel.classList.remove('sim-active-gps');
        gpsStatusText.textContent = 'GPS mobility tracking is offline.';
      }
    });
  }

  // Receipt Dropdown Parsing
  const receiptSelect = document.getElementById('parser-receipt-dropdown');
  const receiptTextarea = document.getElementById('parser-textarea-input');
  const parseBtn = document.getElementById('parser-parse-btn');

  const receiptMockData = {
    jacket: `AMAZON CHECKOUT VOUCHER\nORDER #AMZ-99105-X\n1x Patagonia Recycled Polyester Jacket - $129.00\nPayment: Visa ****-1901\nDelivery: Standard Home`,
    uber: `UBER RIDE VOUCHER\nTRIP ID: UBR-882201\nDistance: 12.4 km\nVehicle Type: Uber Comfort (Standard ICE)\nFare: $22.40`,
    grocery: `WHOLE FOODS checkout\nSTORE: #1010 Portland\n1x Ground Beef (1.2 lbs) - $7.99\n1x Organic Romaine Lettuce - $2.49\n1x Almond Milk (1 Gal) - $3.99\nCheckout: Cash`
  };

  if (receiptSelect && receiptTextarea) {
    receiptSelect.addEventListener('change', () => {
      const selection = receiptSelect.value;
      if (selection && receiptMockData[selection]) {
        receiptTextarea.value = receiptMockData[selection];
      }
    });
  }

  if (parseBtn && receiptTextarea) {
    parseBtn.addEventListener('click', () => {
      const text = receiptTextarea.value.trim();
      if (!text) return;

      const resultBox = document.getElementById('parser-result-box');
      const resultName = document.getElementById('parser-result-name');
      const resultEmissions = document.getElementById('parser-result-emissions');
      const resultAdvice = document.getElementById('parser-result-advice');
      const confidenceFill = document.getElementById('parser-confidence-fill');
      const confidenceVal = document.getElementById('parser-confidence-val');

      if (resultBox && resultName && resultEmissions && resultAdvice && confidenceFill && confidenceVal) {
        // Calculate parser specs based on keywords
        let name = 'Unidentified Item';
        let emissions = 1.5;
        let confidence = 65;
        let advice = 'Try buying second-hand or shopping locally.';
        let actionId = 'reusable_cup';

        const normText = text.toLowerCase();

        if (normText.includes('jacket') || normText.includes('patagonia') || normText.includes('apparel') || normText.includes('shirt') || normText.includes('pants')) {
          name = normText.includes('patagonia') ? 'Patagonia Polyester Jacket' : 'Synthetic Apparel item';
          emissions = 3.2;
          confidence = 94;
          advice = 'Synthetic apparel has a heavy manufacturing footprint. Good job choosing recycled options, but buying second-hand saves even more!';
          actionId = 'second_hand';
        } else if (normText.includes('uber') || normText.includes('comfort') || normText.includes('taxi') || normText.includes('ride') || normText.includes('cab')) {
          name = 'Automobile Commute / Ride';
          emissions = 2.2;
          confidence = 88;
          advice = 'Ridesharing in single-occupant combustion engines contributes standard transportation carbon. Switch to public transit or an EV next time.';
          actionId = 'public_transit';
        } else if (normText.includes('beef') || normText.includes('meat') || normText.includes('steak') || normText.includes('burger')) {
          name = 'Emissions-Heavy Meat Groceries';
          emissions = 6.8;
          confidence = 82;
          advice = 'Beef is highly emissions-intensive due to cattle methane releases. Swapping beef for plant-based alternatives cuts emissions by ~85%.';
          actionId = 'meatless_meal';
        } else if (normText.includes('salad') || normText.includes('tofu') || normText.includes('vegan') || normText.includes('vegetables') || normText.includes('produce')) {
          name = 'Plant-Based Groceries';
          emissions = 0.5;
          confidence = 92;
          advice = 'Excellent plant-based purchase! Eating low on the food chain drastically decreases agricultural footprint.';
          actionId = 'meatless_meal';
        } else if (normText.includes('flight') || normText.includes('plane') || normText.includes('airline') || normText.includes('boarding pass')) {
          name = 'Aviation Air Commute';
          emissions = 120.0; // Air travel is massive
          confidence = 95;
          advice = 'Aviation carbon is highly intensive. Consider local vacations or purchase verified offsets to mitigate air-transit emissions.';
          actionId = 'commute_bike'; // Swap short trips to active
        } else if (normText.includes('electric') || normText.includes('utility') || normText.includes('bill') || normText.includes('power') || normText.includes('gas heating')) {
          name = 'Residential Energy Utility';
          emissions = 8.5;
          confidence = 89;
          advice = 'Home energy is a primary Scope 2 driver. Lowering your space heating thermostat by 2 degrees reduces usage by up to 10%.';
          actionId = 'turn_down_heating';
        } else if (normText.includes('thrift') || normText.includes('used') || normText.includes('ebay') || normText.includes('second')) {
          name = 'Second-Hand / Pre-Loved Item';
          emissions = 0.2;
          confidence = 96;
          advice = 'Wonderful choice! Buying second-hand extends product lifecycle and avoids supply chain manufacturing emissions entirely.';
          actionId = 'second_hand';
        }

        resultName.textContent = name;
        resultEmissions.textContent = `Emissions: ${emissions} kg CO₂e`;
        resultAdvice.textContent = advice;
        confidenceVal.textContent = `${confidence}%`;
        confidenceFill.style.width = `${confidence}%`;

        resultBox.classList.add('active');
        showToast(`AI Scanner successfully parsed transaction! Confidence: ${confidence}%`, 'success');

        // Trigger a quest marker above the respective landmark on the 3D planet!
        if (planetGame) {
          planetGame.triggerQuest(actionId);
        }
      }
    });
  }
}

// 15. AI Recommendations Panel
let currentRecFilter = 'impact';

function renderRecommendations() {
  const container = document.getElementById('recommendations-container');
  if (!container) return;

  container.innerHTML = '';

  let recs = [...actionsDatabase];
  if (currentRecFilter === 'impact') {
    recs.sort((a, b) => b.savings - a.savings);
  } else if (currentRecFilter === 'cost') {
    recs.sort((a, b) => b.points - a.points);
  } else {
    recs = recs.filter(r => r.category === 'waste' || r.category === 'shopping' || r.category === 'digital');
  }

  recs.slice(0, 3).forEach(rec => {
    const isAdded = state.completedActions.includes(rec.id);
    const impactTier = rec.savings > 3 ? 'high' : (rec.savings > 1.5 ? 'med' : 'low');

    const card = document.createElement('div');
    card.className = 'rec-card';
    card.innerHTML = `
      <div class="rec-badge-ribbon">
        <span class="rec-impact-badge ${impactTier}">${impactTier} impact</span>
        <span class="action-category-tag">${rec.category}</span>
      </div>
      <h4>${rec.name}</h4>
      <p>Recommended based on your lifestyle profile. Start this simple routine to quickly trim your footprint.</p>
      <div class="rec-stats-row">
        <div class="rec-stat savings">
          <svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" stroke-linecap="round"/></svg>
          -${rec.savings} kg CO₂/day
        </div>
        <div class="rec-stat cost">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>
          +${rec.points} pts
        </div>
      </div>
      <button class="rec-btn" id="rec-btn-${rec.id}">${isAdded ? 'Remove Action' : 'Deliver as Quest'}</button>
    `;

    const button = card.querySelector('.rec-btn');
    button.addEventListener('click', () => {
      if (isAdded) {
        toggleAction(rec.id, false);
      } else {
        // Trigger quest in WebGL planet first!
        showToast(`Quest activated! Deliver "${rec.name}" on the Carbon Courier planet.`, 'success');
        if (planetGame) {
          planetGame.triggerQuest(rec.id);
          switchTab('dashboard');
        } else {
          toggleAction(rec.id, true);
        }
      }
    });

    container.appendChild(card);
  });
}

function initRecFilters() {
  const tabs = document.querySelectorAll('.ai-filters .filter-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentRecFilter = tab.getAttribute('data-filter');
      renderRecommendations();
    });
  });
}

// 16. Dynamic Weekly Action Planner Generator
const weeklyPlanData = {
  budget: [
    { day: 'Mon', action: 'Cold Laundry Wash', savings: 0.8, actionId: 'cold_wash' },
    { day: 'Tue', action: 'Leftover Meal Log', savings: 0.5, actionId: 'compost_waste' },
    { day: 'Wed', action: 'Unplug Standby Devices', savings: 0.4, actionId: 'digital_cleaning' },
    { day: 'Thu', action: 'Line Dry Clothes', savings: 1.5, actionId: 'hang_dry' },
    { day: 'Fri', action: 'Lower Thermostat 2°', savings: 1.2, actionId: 'turn_down_heating' },
    { day: 'Sat', action: 'Thrift Shopping', savings: 4.5, actionId: 'second_hand' },
    { day: 'Sun', action: 'Vegetarian Dinner', savings: 1.8, actionId: 'meatless_meal' }
  ],
  impact: [
    { day: 'Mon', action: 'Commute by Bike', savings: 3.6, actionId: 'commute_bike' },
    { day: 'Tue', action: 'Green Portfolio Setup', savings: 4.5, actionId: 'green_portfolio' },
    { day: 'Wed', action: 'Vegan Meal Day', savings: 1.8, actionId: 'meatless_meal' },
    { day: 'Thu', action: 'Renewable Electricity', savings: 5.0, actionId: 'turn_down_heating' },
    { day: 'Fri', action: 'Commute by Bike', savings: 3.6, actionId: 'commute_bike' },
    { day: 'Sat', action: 'Zero Waste Recycle', savings: 0.9, actionId: 'compost_waste' },
    { day: 'Sun', action: 'Line Dry Clothes', savings: 1.5, actionId: 'hang_dry' }
  ],
  quick: [
    { day: 'Mon', action: 'Digital Cloud Cleanup', savings: 0.4, actionId: 'digital_cleaning' },
    { day: 'Tue', action: 'Cold Laundry Wash', savings: 0.8, actionId: 'cold_wash' },
    { day: 'Wed', action: 'Lower Thermostat 2°', savings: 1.2, actionId: 'turn_down_heating' },
    { day: 'Thu', action: 'Use Reusable Mug', savings: 0.3, actionId: 'reusable_cup' },
    { day: 'Fri', action: 'Plant-Based Lunch', savings: 1.8, actionId: 'meatless_meal' },
    { day: 'Sat', action: 'Buy Local Produce', savings: 0.6, actionId: 'local_produce' },
    { day: 'Sun', action: 'Line Dry Clothes', savings: 1.5, actionId: 'hang_dry' }
  ]
};

function initWeeklyPlanner() {
  const planButtons = document.querySelectorAll('.planner-options .filter-btn');
  planButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      planButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeWeeklyPlan = btn.getAttribute('data-plan');
      
      showToast(`Generating ${state.activeWeeklyPlan.toUpperCase()} Weekly Action Plan...`, 'success');
      
      setTimeout(() => {
        renderWeeklyPlannerGrid();
        saveStateToCookies();
      }, 500);
    });
  });
}

function renderWeeklyPlannerGrid() {
  const grid = document.getElementById('planner-weeks-grid');
  if (!grid) return;

  if (!state.activeWeeklyPlan) {
    grid.classList.remove('active');
    return;
  }

  grid.innerHTML = '';
  const days = weeklyPlanData[state.activeWeeklyPlan];

  days.forEach(dayInfo => {
    const card = document.createElement('div');
    card.className = 'planner-day-card';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Deliver ${dayInfo.action} on ${dayInfo.day}`);
    card.innerHTML = `
      <span class="planner-day-title">${dayInfo.day}</span>
      <span class="planner-day-action">${dayInfo.action}</span>
      <span class="planner-day-savings">-${dayInfo.savings} kg CO₂</span>
    `;

    // Hook click action to automatically toggle action items!
    const triggerPlanAction = () => {
      showToast(`Weekly action activated! Walk to the marked landmark to deliver.`, 'success');
      if (planetGame) {
        planetGame.triggerQuest(dayInfo.actionId);
        switchTab('dashboard');
      } else {
        toggleAction(dayInfo.actionId, true);
      }
    };

    card.addEventListener('click', triggerPlanAction);
    card.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        triggerPlanAction();
      }
    });

    grid.appendChild(card);
  });

  grid.classList.add('active');
}

// 17. Simulated Context-Aware NLP Chatbot Coach Router
function initChatbot() {
  const sendBtn = document.getElementById('chat-send-btn');
  const chatInput = document.getElementById('chat-input');

  if (sendBtn && chatInput) {
    const handleSend = () => {
      const text = chatInput.value.trim();
      if (!text) return;

      addChatMessage('user', text);
      chatInput.value = '';

      setTimeout(() => {
        const botResponse = generateBotResponse(text);
        addChatMessage('bot', botResponse);
      }, 700);
    };

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
}

function addChatMessage(sender, text) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  container.appendChild(bubble);

  scrollToLastMessage();
}

function scrollToLastMessage() {
  const container = document.getElementById('chat-messages-container');
  if (container) {
    container.scrollTop = container.scrollHeight;
  }
}

function generateBotResponse(userInput) {
  const text = userInput.toLowerCase();
  const qa = state.quizAnswers;

  // 1. Hello / Greeting
  if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
    return `Hello ${state.userName}! I am your Carbon Coach. Ask me about your **footprint**, **highest emitter**, **points**, or specific domains like **transit**, **food**, **digital** or **finance**!`;
  }

  // 2. Score check / Current progress
  if (text.includes('score') || text.includes('footprint') || text.includes('how am i doing') || text.includes('current carbon') || text.includes('budget')) {
    const difference = parseFloat(Math.abs(state.currentCarbon - state.dailyBudget).toFixed(1));
    const budgetStatus = state.currentCarbon <= state.dailyBudget 
      ? `You are doing awesome! You are currently **${difference} kg CO₂e/day under** your daily budget.` 
      : `You are currently **${difference} kg CO₂e/day above** your sustainable target of 8.0 kg.`;
    
    return `**Carbon Twin Audit:**\nYour current footprint is **${state.currentCarbon} kg CO₂e/day** (Baseline: ${state.baselineCarbon} kg).\n${budgetStatus}\n\n*Suggestion:* Open the Dashboard and walk to any flashing quest arrows on the planet to deliver eco-upgrades!`;
  }

  // 3. Highest category detection (Logical Decision Making)
  if (text.includes('highest') || text.includes('worst') || text.includes('biggest') || text.includes('emitter') || text.includes('domain')) {
    // Calculate current category contributions
    const transportVal = carbonCoefficients.transport[qa.transportMode] * qa.transportKm;
    const dietVal = carbonCoefficients.diet[qa.dietType];
    const energyVal = carbonCoefficients.homeEnergy[qa.homeSize] * carbonCoefficients.homeEnergy[qa.energySource];
    const shoppingVal = carbonCoefficients.shopping[qa.shoppingLevel];
    const digitalVal = carbonCoefficients.digital[qa.digitalStreaming || 'average'];
    const financeVal = carbonCoefficients.finance[qa.financialInvest || 'conventional'];

    const values = [
      { name: 'Transit & Mobility', val: transportVal, advice: 'Consider commuting by bicycle, walking, or swapping your single-occupant car rides for local transit.' },
      { name: 'Nutritional Diet', val: dietVal, advice: 'Reducing heavy meats and swapping beef/pork for vegan or vegetarian meals is highly impactful.' },
      { name: 'Residential Energy', val: energyVal, advice: 'Try switching to a 100% renewable grid mix, installing solar panels, or lowering your thermostat by 2°F.' },
      { name: 'Consumer Goods/Shopping', val: shoppingVal, advice: 'Buying second-hand clothes, books, and electronics is an effective way to bypass manufacturing emissions.' },
      { name: 'Digital Data Centers', val: digitalVal, advice: 'Streaming high-definition video utilizes large amounts of server grid energy. Try watching stream in HD/SD and clean up your cloud storage.' },
      { name: 'Financed Emissions (Banking)', val: financeVal, advice: 'Switching your conventional bank savings account to an ESG/Green bank prevents banks from lending your money to fossil fuel projects.' }
    ];

    values.sort((a, b) => b.val - a.val);
    const topEmitter = values[0];

    return `**Logical Footprint Diagnosis:**\nYour single largest carbon category is **${topEmitter.name}** contributing **${topEmitter.val.toFixed(1)} kg CO₂e/day**.\n\n*Coach Advice:* ${topEmitter.advice}`;
  }

  // 4. Transit advice
  if (text.includes('transport') || text.includes('car') || text.includes('commute') || text.includes('transit') || text.includes('bike') || text.includes('fly') || text.includes('flight')) {
    let customAdvice = '';
    if (qa.transportMode === 'car') {
      customAdvice = `You currently commute **${qa.transportKm} km** daily by gas car. Swapping just two commutes a week for public transit or a bicycle will reduce your footprint by ~**${(carbonCoefficients.transport.car * qa.transportKm * 2 * 0.75).toFixed(1)} kg CO₂** weekly!`;
    } else {
      customAdvice = `Your transport profile is already highly optimized. Great work using ${qa.transportMode === 'ev' ? 'an Electric Vehicle' : qa.transportMode === 'public' ? 'Public Transit' : 'active travel'}!`;
    }
    return `**Transportation Insight:**\n${customAdvice}\n\n*Quick Action:* Try enabling the **GPS Mobility Auto-Sync** in the dashboard to passively detect commutes.`;
  }

  // 5. Food and Diet advice
  if (text.includes('food') || text.includes('meat') || text.includes('diet') || text.includes('vegan') || text.includes('eat') || text.includes('beef')) {
    const dietImpact = carbonCoefficients.diet[qa.dietType];
    return `**Dietary Emissions Audit:**\nYour current diet profile (${qa.dietType.replace('_', ' ')}) contributes **${dietImpact} kg CO₂e/day**.\n- Plant-based foods release up to 10x less carbon than ruminant meats.\n- Swapping just one steak dinner for a plant-based alternative saves 2.5 kg of methane emissions.\n\n*Quick Action:* Walk your Courier to the **District Cafe** to deliver a plant-based meal package!`;
  }

  // 6. Digital Footprint
  if (text.includes('digital') || text.includes('streaming') || text.includes('cloud') || text.includes('device') || text.includes('netflix') || text.includes('internet')) {
    return `**Digital footprint advice:**\nHD and 4K streaming transmit gigabytes of cloud data through energy-intensive servers. Watching in standard definition and cleaning up old attachments cuts data-center cooling emissions by up to **75%**!\n\n*Quick Action:* Try delivering the **Declutter Cloud & Streaming** quest at the Data Center.`;
  }

  // 7. Financed Emissions (Banking)
  if (text.includes('finance') || text.includes('bank') || text.includes('investment') || text.includes('money') || text.includes('portfolio') || text.includes('esg')) {
    let custom = '';
    if (qa.financialInvest === 'conventional') {
      custom = `Your savings are in a conventional bank. Conventional commercial banks represent the highest silent capital funders of oil/gas grids. Switch deposits to a green/ESG bank to wipe out **4.5 kg CO₂e/day** of financed emissions!`;
    } else {
      custom = `Awesome job choosing green/ESG portfolios and clean banks! You are actively starving fossil fuel development of capital.`;
    }
    return `**Financial footprint advice:**\n${custom}\n\n*Quick Action:* Deliver the **Transition to Green Banking** action item (+80 pts) at the District Bank on your planet!`;
  }

  // 8. Streak & Points check
  if (text.includes('points') || text.includes('streak') || text.includes('level') || text.includes('earn')) {
    return `**Account Summary:**\n- **EcoPoints:** ${state.points} pts\n- **Active Streak:** ${state.streak} days\n- **Member Level:** Level ${Math.floor(state.points / 500) + 1} Advocate\n\nKeep logging green actions to maintain your daily streak and earn point bonuses!`;
  }

  // 9. Recommendations prompt
  if (text.includes('recommend') || text.includes('suggest') || text.includes('action') || text.includes('help')) {
    // Find uncompleted actions
    const uncompleted = actionsDatabase.filter(a => !state.completedActions.includes(a.id));
    if (uncompleted.length > 0) {
      const suggest = uncompleted[Math.floor(Math.random() * uncompleted.length)];
      return `**Personalized Recommendation:**\nI suggest activating the quest: **${suggest.name}** (-${suggest.savings} kg CO₂, +${suggest.points} pts). You can activate it via the Recommendations list or walk to its landmark on the planet.`;
    }
    return `You have logged all daily green actions! Outstanding commitment to climate mitigation. Try sponsoring certified offsets in the Marketplace to go net-negative!`;
  }

  // 10. Fallback
  return `Interesting query! Everyday carbon footprint is a combination of transport mode, dietary habits, home power size, and secondary consumer/finances. Is there a specific domain you would like my tips on? (e.g. diet, banking, digital activities)`;
}

// 18. Leaderboard rendering
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list-container');
  if (!container) return;

  container.innerHTML = '';

  const meIndex = leaderboardData.findIndex(item => item.me);
  if (meIndex > -1) {
    leaderboardData[meIndex].points = state.points;
    leaderboardData[meIndex].name = `You (${state.userName})`;
  }

  const sorted = [...leaderboardData].sort((a, b) => b.points - a.points);

  sorted.forEach((user, index) => {
    user.rank = index + 1;

    const row = document.createElement('div');
    row.className = `leaderboard-item ${user.me ? 'me' : ''}`;
    row.innerHTML = `
      <div class="rank-badge">${user.rank}</div>
      <div class="leaderboard-avatar">${user.name.charAt(0)}</div>
      <div class="leaderboard-name">${user.name}</div>
      <div class="leaderboard-points">${user.points} pts</div>
    `;

    container.appendChild(row);
  });
}

// 19. Social Feed Rendering & Actions
function renderSocialFeed() {
  const container = document.getElementById('social-feed-container');
  if (!container) return;

  container.innerHTML = '';

  state.socialPosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'feed-post-card';
    
    let commentsHTML = '';
    if (post.comments.length > 0) {
      commentsHTML = `
        <div class="post-comments-section">
          <div class="comments-list">
            ${post.comments.map(c => `
              <div class="comment-row">
                <span class="comment-author">${c.author}:</span>
                <span class="comment-text">${c.text}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="feed-post-header">
        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.8rem; background: ${post.avatarBg || '#10b981'}">${post.avatar}</div>
        <div class="feed-post-author">
          <span class="feed-post-author-name">${post.author}</span>
          <span class="feed-post-time">${post.time}</span>
        </div>
      </div>
      <div class="feed-post-content">${post.content}</div>
      
      <div class="feed-post-actions-row">
        <button class="applaud-btn ${post.userApplauded ? 'active' : ''}" id="applaud-btn-${post.id}">
          <span>👏</span> Applaud (${post.applauds})
        </button>
        <button class="comments-btn" id="comments-toggle-btn-${post.id}">
          <span>💬</span> Comments (${post.comments.length})
        </button>
      </div>

      ${commentsHTML}

      <div class="comment-input-row">
        <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment..." aria-label="Comment on ${post.author}'s post">
        <button class="comment-submit-btn" id="comment-submit-btn-${post.id}">Send</button>
      </div>
    `;

    const applaudBtn = card.querySelector(`.applaud-btn`);
    applaudBtn.addEventListener('click', () => {
      applaudPost(post.id);
    });

    const commentSubmitBtn = card.querySelector(`#comment-submit-btn-${post.id}`);
    const commentInput = card.querySelector(`#comment-input-${post.id}`);
    commentSubmitBtn.addEventListener('click', () => {
      submitComment(post.id, commentInput.value);
    });
    commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitComment(post.id, commentInput.value);
    });

    container.appendChild(card);
  });
}

function applaudPost(postId) {
  const post = state.socialPosts.find(p => p.id === postId);
  if (!post) return;

  if (!post.userApplauded) {
    post.applauds += 1;
    post.userApplauded = true;
    showToast(`Applauded ${post.author}'s update!`, 'success');
  } else {
    post.applauds -= 1;
    post.userApplauded = false;
  }

  saveStateToCookies();
  renderSocialFeed();
}

function submitComment(postId, commentText) {
  const trimmed = commentText.trim();
  if (!trimmed) return;

  const post = state.socialPosts.find(p => p.id === postId);
  if (!post) return;

  post.comments.push({
    author: state.userName,
    text: trimmed
  });

  saveStateToCookies();
  renderSocialFeed();
}

function initSocialPosting() {
  const postBtn = document.getElementById('social-post-btn');
  const postInput = document.getElementById('social-post-input');

  if (postBtn && postInput) {
    postBtn.addEventListener('click', () => {
      const text = postInput.value.trim();
      if (!text) return;

      const initials = getInitials(state.userName);
      const newPost = {
        id: `post_${Date.now()}`,
        avatar: initials,
        avatarBg: '#f59e0b',
        author: state.userName,
        time: 'Just now',
        content: text,
        applauds: 0,
        userApplauded: false,
        comments: []
      };

      state.socialPosts.unshift(newPost);
      postInput.value = '';
      showToast('Post shared to community feed!', 'success');
      saveStateToCookies();
      renderSocialFeed();
    });
  }
}

function getInitials(name) {
  const parts = name.split(' ');
  let initials = '';
  parts.forEach(p => initials += p.charAt(0));
  return initials.substring(0, 2).toUpperCase() || 'U';
}

// 20. Verified Offsets & Marketplace
function renderOffsets() {
  const container = document.getElementById('offsets-grid-container');
  if (!container) return;

  container.innerHTML = '';

  offsetsDatabase.forEach(offset => {
    const card = document.createElement('div');
    card.className = 'glass-card reward-card';

    card.innerHTML = `
      <div class="reward-image-container">
        <div class="reward-image-gradient" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(139, 92, 246, 0.15))"></div>
        <div class="reward-image-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v8M8 12h8"/></svg>
        </div>
        <span class="reward-category-badge">OFFSET</span>
      </div>
      <div class="reward-details">
        <span class="reward-partner">${offset.registry}</span>
        <h4 class="reward-title">${offset.title}</h4>
        <p class="reward-desc">Verified under <strong>${offset.standard}</strong> standard. Rating: <em>${offset.efficiency}</em></p>
        
        <div class="slider-wrapper" style="margin: 0.5rem 0;">
          <span style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">Calibrated Confidence:</span>
          <div class="parser-confidence-bar">
            <div class="parser-confidence-fill" style="width: ${offset.confidence}%; background: var(--color-primary)"></div>
          </div>
        </div>

        <div class="reward-cost-row">
          <div class="reward-cost">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round" stroke-width="2"/></svg>
            ${offset.cost} pts
          </div>
          <button class="reward-btn ${state.points < offset.cost ? 'disabled' : ''}" 
                  id="offset-btn-${offset.id}" 
                  ${state.points < offset.cost ? 'disabled' : ''}>
            Sponsor
          </button>
        </div>
      </div>
    `;

    const button = card.querySelector('.reward-btn');
    if (state.points >= offset.cost) {
      button.addEventListener('click', () => {
        sponsorOffset(offset.id);
      });
    }

    container.appendChild(card);
  });
}

function sponsorOffset(offsetId) {
  const offset = offsetsDatabase.find(o => o.id === offsetId);
  if (!offset || state.points < offset.cost) return;

  state.points -= offset.cost;
  state.carbonSaved += 100; // offset represents 100 kg CO2e offsetted!

  updateUIStats();
  renderOffsets();
  
  // Show Offset Confirmation modal
  const modalOverlay = document.getElementById('redeem-success-modal');
  const modalDetails = document.getElementById('modal-reward-details');
  const closeBtn = document.getElementById('modal-close-btn');

  if (modalOverlay && modalDetails && closeBtn) {
    modalDetails.innerHTML = `
      <p>You sponsored <strong>${offset.title}</strong> offset!</p>
      <p style="margin-top:5px; font-size:0.8rem; color:var(--text-muted)">Registry validation: <strong>${offset.registry}</strong> (${offset.standard})</p>
      <p style="margin-top: 10px; font-size: 1.2rem; font-family: var(--font-heading); color: var(--color-primary); font-weight: bold;">CERTIFICATE: CR-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
      <p style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">Your transaction block is submitted to the private carbon ledger. Clean credit added!</p>
    `;
    modalOverlay.classList.add('active');

    const handleClose = () => {
      modalOverlay.classList.remove('active');
      closeBtn.removeEventListener('click', handleClose);
    };
    closeBtn.addEventListener('click', handleClose);
  }

  showToast(`Sponsored: ${offset.title}! +100 kg offsetted.`, 'success');
  saveStateToCookies();
}

function renderRewards() {
  const container = document.getElementById('rewards-grid-container');
  if (!container) return;

  container.innerHTML = '';

  rewardsDatabase.forEach(reward => {
    const isAffordable = state.points >= reward.cost;
    const isRedeemed = reward.redeemed;

    let svgIcon = '';
    if (reward.category === 'transport') {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 10h4M14 10h4M6 14h12"/></svg>`;
    } else if (reward.category === 'ngo') {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v8M8 12h8"/></svg>`;
    } else if (reward.category === 'shopping') {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>`;
    } else {
      svgIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`;
    }

    const card = document.createElement('div');
    card.className = 'glass-card reward-card';
    card.innerHTML = `
      <div class="reward-image-container">
        <div class="reward-image-gradient"></div>
        <div class="reward-image-icon">${svgIcon}</div>
        <span class="reward-category-badge">${reward.category}</span>
      </div>
      <div class="reward-details">
        <span class="reward-partner">${reward.partner}</span>
        <h4 class="reward-title">${reward.title}</h4>
        <p class="reward-desc">${reward.desc}</p>
        <div class="reward-cost-row">
          <div class="reward-cost">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8" stroke-linecap="round" stroke-width="2"/></svg>
            ${reward.cost} pts
          </div>
          <button class="reward-btn ${(!isAffordable && !isRedeemed) ? 'disabled' : ''}" 
                  id="reward-btn-${reward.id}" 
                  ${(!isAffordable && !isRedeemed) ? 'disabled' : ''}>
            ${isRedeemed ? 'Redeemed' : 'Redeem'}
          </button>
        </div>
      </div>
    `;

    const button = card.querySelector('.reward-btn');
    if (!isRedeemed && isAffordable) {
      button.addEventListener('click', () => {
        redeemReward(reward.id);
      });
    } else if (isRedeemed) {
      button.classList.add('disabled');
    }

    container.appendChild(card);
  });
}

function redeemReward(rewardId) {
  const reward = rewardsDatabase.find(r => r.id === rewardId);
  if (!reward || reward.redeemed || state.points < reward.cost) return;

  state.points -= reward.cost;
  reward.redeemed = true;

  updateUIStats();
  renderRewards();
  showRedeemModal(reward);
  showToast(`Redeemed: ${reward.title}! 🥳`, 'success');
  saveStateToCookies();
}

function showRedeemModal(reward) {
  const modalOverlay = document.getElementById('redeem-success-modal');
  const modalDetails = document.getElementById('modal-reward-details');
  const closeBtn = document.getElementById('modal-close-btn');

  if (modalOverlay && modalDetails && closeBtn) {
    modalDetails.innerHTML = `
      <p>Your eco-voucher for <strong>${reward.title}</strong> is active!</p>
      <p style="margin-top: 10px; font-size: 1.2rem; font-family: var(--font-heading); color: var(--color-primary); font-weight: bold;">CODE: ECO-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
      <p style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">A copy of this code and usage instructions have been sent to your email.</p>
    `;
    modalOverlay.classList.add('active');

    const handleClose = () => {
      modalOverlay.classList.remove('active');
      closeBtn.removeEventListener('click', handleClose);
    };
    closeBtn.addEventListener('click', handleClose);
  }
}

// 21. Cookie Consent Events
function initCookieConsent() {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept-btn');
  const declineBtn = document.getElementById('cookie-decline-btn');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      cookieConsent = 'accept';
      setCookie('cookie-consent', 'accept', 365);
      if (banner) banner.classList.remove('active');
      showToast('Cookies accepted. Profile saved locally.', 'success');
      saveStateToCookies();
    });
  }

  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      cookieConsent = 'decline';
      setCookie('cookie-consent', 'decline', 365);
      if (banner) banner.classList.remove('active');
      showToast('Cookies declined. Profile remains temporary.', 'warning');
    });
  }
}

// 22. Authentication Handlers
function initAuthentication() {
  const overlay = document.getElementById('auth-overlay');
  const toRegisterBtn = document.getElementById('to-register-btn');
  const toLoginBtn = document.getElementById('to-login-btn');
  const loginCard = document.getElementById('login-card');
  const registerCard = document.getElementById('register-card');

  if (toRegisterBtn && toLoginBtn) {
    toRegisterBtn.addEventListener('click', () => {
      loginCard.classList.remove('active');
      registerCard.classList.add('active');
    });
    toLoginBtn.addEventListener('click', () => {
      registerCard.classList.remove('active');
      loginCard.classList.add('active');
    });
  }

  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      state.isLoggedIn = true;
      state.userEmail = email;
      state.userName = email.split('@')[0].replace('.', ' ');
      state.userName = state.userName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      completeAuthenticationFlow();
    });
  }

  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      state.isLoggedIn = true;
      state.userName = name;
      state.userEmail = email;
      completeAuthenticationFlow();
    });
  }

  const googleBtn = document.getElementById('google-signin-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', () => {
      state.isLoggedIn = true;
      state.userName = 'Jane Doe (Google)';
      state.userEmail = 'jane.doe@gmail.com';
      completeAuthenticationFlow();
    });
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      performLogout();
    });
  }
}

function completeAuthenticationFlow() {
  const overlay = document.getElementById('auth-overlay');
  setCookie('ecosphere_session_token', 'token_' + Date.now(), 7);
  syncSidebarProfile();
  saveStateToCookies();
  
  if (overlay) overlay.classList.remove('active');
  updateUIStats();
  switchTab('dashboard');
  
  showToast(`Welcome back, ${state.userName}! 👋`, 'success');
}

function performLogout() {
  const overlay = document.getElementById('auth-overlay');
  deleteCookie('ecosphere_session_token');
  deleteCookie('ecosphere_user_state');

  state = JSON.parse(JSON.stringify(defaultState));
  
  const checklist = document.getElementById('actions-checklist-container');
  if (checklist) checklist.innerHTML = '';
  
  if (overlay) overlay.classList.add('active');
  showToast('Logged out successfully.', 'success');
}

function syncSidebarProfile() {
  const nameEl = document.getElementById('sidebar-name-val');
  const avatarEl = document.getElementById('sidebar-avatar-val');
  const socialAvatarEl = document.getElementById('social-my-avatar');

  if (nameEl) nameEl.textContent = state.userName;
  const initials = getInitials(state.userName);
  if (avatarEl) avatarEl.textContent = initials;
  if (socialAvatarEl) socialAvatarEl.textContent = initials;
}

// 23. Toast Notification Engine (Bug Fix)
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-notification-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let iconSVG = '';
  if (type === 'success') {
    iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" stroke-linecap="round"/><path d="M22 4L12 14.01l-3-3" stroke-linecap="round"/></svg>`;
  } else if (type === 'warning') {
    iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><path d="M12 9v4M12 17h.01"/></svg>`;
  } else {
    iconSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSVG}</span>
    <span class="toast-text">${message}</span>
  `;

  container.appendChild(toast);

  // Smooth dismiss after 3.2 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      toast.remove();
    }, 500);
  }, 3200);
}

// 24. "Abeto Messenger" 3D WebGL Courier Planet Engine
class CarbonCourierPlanet {
  constructor() {
    this.container = document.getElementById('planet-canvas-container');
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.planetGroup = null;
    this.courierSprite = null;
    this.landmarks = {};
    this.quests = {}; // active delivery items
    this.materials = {};
    
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    
    // Courier walking physics
    this.planetTargetRotationX = 0;
    this.planetTargetRotationY = 0;
    this.walkingDirection = 0; // -1 = left, 1 = right, 0 = idle
    this.isWalking = false;
    this.walkAnimFrame = 0;
    this.walkAnimTime = 0;
    
    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    // 1. Scene & Camera Setup
    this.scene = new THREE.Scene();
    
    // Camera settings
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, 4.5, 9.5); // view from slightly above
    this.camera.lookAt(0, 0.4, 0);

    // 2. WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.container.appendChild(this.renderer.domElement);

    // 3. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 8, 4);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    // 4. Create materials
    this.initMaterials();

    // 5. Create Planet Group
    this.planetGroup = new THREE.Group();
    this.scene.add(this.planetGroup);

    // Ocean Core Sphere
    const oceanGeom = new THREE.SphereGeometry(3.5, 32, 32);
    this.oceanMesh = new THREE.Mesh(oceanGeom, this.materials.ocean);
    this.oceanMesh.receiveShadow = true;
    this.planetGroup.add(this.oceanMesh);

    // Land Continents (Stylized low-poly patches floating on ocean)
    this.createLandPatches();

    // Landmark District Structures
    this.createLandmarks();

    // Wind turbines & Trees
    this.createEnvironmentAssets();

    // 6. Create static 2D-in-3D Courier Sprite
    this.createCourierSprite();

    // 7. Event listeners
    this.initInteractionEvents();

    // Calibrate quests on start
    this.refreshQuests();

    // 8. Start Animation Loop
    this.animate();
  }

  initMaterials() {
    // Determine initial colors based on baseline carbon
    const healthy = state.currentCarbon <= state.dailyBudget;
    
    this.materials.ocean = new THREE.MeshStandardMaterial({
      color: healthy ? 0x0c4a6e : 0x3b3534, // vibrant blue or dead gray
      roughness: 0.2,
      metalness: 0.1,
      flatShading: true
    });

    this.materials.land = new THREE.MeshStandardMaterial({
      color: healthy ? 0x059669 : 0x78716c, // green forest or dry dust
      roughness: 0.8,
      metalness: 0.0,
      flatShading: true
    });

    this.materials.trunk = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.9,
      flatShading: true
    });

    this.materials.leaves = new THREE.MeshStandardMaterial({
      color: healthy ? 0x10b981 : 0xb45309, // green or brown/yellow
      roughness: 0.9,
      flatShading: true
    });

    this.materials.landmarkBase = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      roughness: 0.7,
      flatShading: true
    });

    this.materials.roof = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6, // violet roofs
      roughness: 0.7,
      flatShading: true
    });

    this.materials.metal = new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      roughness: 0.3,
      metalness: 0.8,
      flatShading: true
    });
  }

  createLandPatches() {
    this.landGroup = new THREE.Group();
    this.planetGroup.add(this.landGroup);

    // Programmatically place 10 land patches representing continents
    const patches = [
      { lat: 0, lon: 0, r: 1.8 },
      { lat: 0.4, lon: 0.8, r: 1.5 },
      { lat: -0.5, lon: -0.6, r: 1.6 },
      { lat: 0.8, lon: -1.2, r: 1.2 },
      { lat: -0.8, lon: 0.9, r: 1.4 },
      { lat: 0.3, lon: -2.0, r: 1.6 },
      { lat: -0.2, lon: 2.2, r: 1.5 },
      { lat: 0.9, lon: 1.8, r: 1.0 },
      { lat: -0.9, lon: -2.3, r: 1.1 },
      { lat: 0.1, lon: -0.9, r: 1.7 }
    ];

    patches.forEach(p => {
      // Create a shallow spherical cap
      const capGeom = new THREE.SphereGeometry(3.52, 16, 16, 0, p.r * 0.4, 0, p.r * 0.4);
      const capMesh = new THREE.Mesh(capGeom, this.materials.land);
      
      // Position cap using spherical mapping
      const dummy = new THREE.Object3D();
      dummy.position.set(0, 0, 0);
      dummy.rotation.set(0, 0, 0);
      dummy.rotateY(p.lon);
      dummy.rotateX(p.lat);
      
      capMesh.rotation.copy(dummy.rotation);
      capMesh.position.set(0, 0, 0);
      capMesh.castShadow = true;
      capMesh.receiveShadow = true;
      this.landGroup.add(capMesh);
    });
  }

  createLandmarks() {
    // Landmarks positioned at polar coordinates around the globe sphere
    const landmarkConfigs = [
      { id: 'townhouse', name: 'Home Energy', lat: 0.2, lon: 0.4, color: 0x3b82f6 },
      { id: 'cafe', name: 'Cafe Diet', lat: -0.4, lon: 0.8, color: 0x10b981 },
      { id: 'station', name: 'Transit Station', lat: 0.8, lon: -0.6, color: 0x06b6d4 },
      { id: 'market', name: 'Market Goods', lat: -0.8, lon: -0.2, color: 0xf59e0b },
      { id: 'datacenter', name: 'Cloud Data Center', lat: 0.5, lon: 1.9, color: 0xec4899 },
      { id: 'bank', name: 'EcoBank Finance', lat: -0.3, lon: -1.2, color: 0x3b82f6 },
      { id: 'recycle', name: 'Recycling Depot', lat: 0.1, lon: -0.5, color: 0x10b981 }
    ];

    landmarkConfigs.forEach(conf => {
      const group = new THREE.Group();

      // Base cylinder slightly embedded
      const baseGeom = new THREE.BoxGeometry(0.8, 0.4, 0.8);
      const baseMesh = new THREE.Mesh(baseGeom, this.materials.landmarkBase);
      baseMesh.castShadow = true;
      baseMesh.receiveShadow = true;
      group.add(baseMesh);

      // Structure detail based on landmark type
      if (conf.id === 'townhouse') {
        const roofGeom = new THREE.ConeGeometry(0.6, 0.5, 4);
        roofGeom.rotateY(Math.PI/4);
        const roofMesh = new THREE.Mesh(roofGeom, new THREE.MeshStandardMaterial({ color: conf.color, flatShading:true }));
        roofMesh.position.y = 0.45;
        roofMesh.castShadow = true;
        group.add(roofMesh);
      } else if (conf.id === 'cafe') {
        const awningGeom = new THREE.BoxGeometry(0.9, 0.1, 0.9);
        const awningMesh = new THREE.Mesh(awningGeom, new THREE.MeshStandardMaterial({ color: 0xef4444, flatShading:true }));
        awningMesh.position.y = 0.25;
        group.add(awningMesh);
      } else if (conf.id === 'datacenter') {
        const serverGeom = new THREE.BoxGeometry(0.5, 0.8, 0.5);
        const serverMesh = new THREE.Mesh(serverGeom, new THREE.MeshStandardMaterial({ color: 0x475569, metalness:0.8, roughness:0.2 }));
        serverMesh.position.y = 0.4;
        group.add(serverMesh);
      } else if (conf.id === 'bank') {
        const columnGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
        const roof = new THREE.BoxGeometry(0.9, 0.15, 0.9);
        const roofMesh = new THREE.Mesh(roof, this.materials.landmarkBase);
        roofMesh.position.y = 0.45;
        group.add(roofMesh);

        for (let i = -0.3; i <= 0.3; i += 0.3) {
          const col = new THREE.Mesh(columnGeom, this.materials.landmarkBase);
          col.position.set(i, 0.2, 0.2);
          group.add(col);
          const colBack = col.clone();
          colBack.position.z = -0.2;
          group.add(colBack);
        }
      } else {
        // default cylinders/blocks
        const topGeom = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 6);
        const topMesh = new THREE.Mesh(topGeom, new THREE.MeshStandardMaterial({ color: conf.color, flatShading:true }));
        topMesh.position.y = 0.4;
        group.add(topMesh);
      }

      // Quest Arrow (Mail item icon) hovering above
      const arrowGeom = new THREE.ConeGeometry(0.18, 0.35, 4);
      arrowGeom.rotateX(Math.PI); // point down
      const arrowMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const arrowMesh = new THREE.Mesh(arrowGeom, arrowMat);
      arrowMesh.position.y = 1.3;
      group.add(arrowMesh);
      arrowMesh.visible = false; // toggled dynamically
      
      // Keep reference
      this.quests[conf.id] = arrowMesh;

      // Position landmark group on sphere surface (r = 3.5)
      const r = 3.5;
      const phi = (90 - conf.lat * 45) * Math.PI / 180;
      const theta = (conf.lon * 45) * Math.PI / 180;

      const x = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);

      group.position.set(x, y, z);

      // Orient landmark upwards from sphere center
      const upVec = new THREE.Vector3(x, y, z).normalize();
      const alignRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
      group.quaternion.copy(alignRotation);

      this.planetGroup.add(group);
      this.landmarks[conf.id] = { group: group, config: conf, upVector: upVec };
    });
  }

  createEnvironmentAssets() {
    this.environmentGroup = new THREE.Group();
    this.planetGroup.add(this.environmentGroup);

    // Generate ~15 random trees on the planet
    const treeCoords = [
      { lat: 0.1, lon: 1.1 }, { lat: -0.2, lon: 0.3 }, { lat: 0.5, lon: -0.2 },
      { lat: -0.6, lon: -1.0 }, { lat: 0.3, lon: -1.5 }, { lat: -0.1, lon: -2.0 },
      { lat: 0.7, lon: 2.1 }, { lat: -0.5, lon: 1.5 }, { lat: 0.8, lon: 0.5 },
      { lat: -0.3, lon: -0.7 }, { lat: 0.4, lon: -2.4 }, { lat: -0.8, lon: 0.2 },
      { lat: 0.9, lon: -1.8 }, { lat: -0.9, lon: -1.4 }, { lat: 0.2, lon: 2.8 }
    ];

    treeCoords.forEach(coord => {
      const tree = new THREE.Group();

      const trunkGeom = new THREE.CylinderGeometry(0.05, 0.08, 0.3, 5);
      const trunk = new THREE.Mesh(trunkGeom, this.materials.trunk);
      trunk.position.y = 0.15;
      tree.add(trunk);

      const leavesGeom = new THREE.ConeGeometry(0.2, 0.5, 5);
      const leaves = new THREE.Mesh(leavesGeom, this.materials.leaves);
      leaves.position.y = 0.5;
      leaves.castShadow = true;
      tree.add(leaves);

      // Position
      const r = 3.52;
      const phi = (90 - coord.lat * 45) * Math.PI / 180;
      const theta = (coord.lon * 45) * Math.PI / 180;

      const x = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);

      tree.position.set(x, y, z);
      const upVec = new THREE.Vector3(x, y, z).normalize();
      const alignRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
      tree.quaternion.copy(alignRotation);

      this.environmentGroup.add(tree);
    });

    // Add 2 clean energy Wind Turbines
    this.turbines = [];
    const turbineCoords = [
      { lat: 0.6, lon: -1.0 },
      { lat: -0.5, lon: 2.2 }
    ];

    turbineCoords.forEach(coord => {
      const turbine = new THREE.Group();

      const poleGeom = new THREE.CylinderGeometry(0.04, 0.07, 1.2, 6);
      const pole = new THREE.Mesh(poleGeom, this.materials.metal);
      pole.position.y = 0.6;
      pole.castShadow = true;
      turbine.add(pole);

      // Rotor blades group
      const rotor = new THREE.Group();
      rotor.position.y = 1.2;
      
      const bladeGeom = new THREE.BoxGeometry(0.04, 0.5, 0.02);
      for (let i = 0; i < 3; i++) {
        const blade = new THREE.Mesh(bladeGeom, this.materials.landmarkBase);
        blade.position.y = 0.25;
        const pivot = new THREE.Group();
        pivot.rotation.z = (i * 120) * Math.PI / 180;
        pivot.add(blade);
        rotor.add(pivot);
      }
      
      turbine.add(rotor);
      this.turbines.push(rotor); // reference to animate spinning

      // Position
      const r = 3.52;
      const phi = (90 - coord.lat * 45) * Math.PI / 180;
      const theta = (coord.lon * 45) * Math.PI / 180;

      const x = r * Math.sin(phi) * Math.sin(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);

      turbine.position.set(x, y, z);
      const upVec = new THREE.Vector3(x, y, z).normalize();
      const alignRotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), upVec);
      turbine.quaternion.copy(alignRotation);

      this.environmentGroup.add(turbine);
    });
  }

  createCourierSprite() {
    // Generate a cute procedurally drawn courier pixel-art texture using 2D Canvas!
    // This allows us to load offline, keep file sizes tiny, and iterate frames.
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    this.courierCanvas = canvas;
    this.courierCtx = canvas.getContext('2d');

    // Create the sprite texture and material
    this.courierTexture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: this.courierTexture });
    
    this.courierSprite = new THREE.Sprite(spriteMat);
    this.courierSprite.scale.set(0.9, 0.9, 1.0);
    
    // Position static at top center of planet view (offset from center of sphere: radius 3.5 + sprite offset ~0.4)
    this.courierSprite.position.set(0, 3.82, 0); 
    this.scene.add(this.courierSprite);

    this.drawCourierFrame(0); // idle frame
  }

  drawCourierFrame(walkFrame) {
    const ctx = this.courierCtx;
    ctx.clearRect(0, 0, 128, 128);

    // Draw stylized cozy courier character
    // Walk animation shifts legs and bobbing body
    const legOffset = Math.sin(walkFrame * 0.5) * 6;
    const bodyBob = Math.abs(Math.sin(walkFrame * 0.5)) * 3;

    // Flip drawing horizontally based on direction
    ctx.save();
    if (this.walkingDirection < 0) {
      ctx.translate(128, 0);
      ctx.scale(-1, 1);
    }

    // 1. Legs (Brown Boots)
    ctx.fillStyle = '#78350f';
    // Leg Left
    ctx.fillRect(52, 86 + legOffset, 8, 14);
    // Leg Right
    ctx.fillRect(68, 86 - legOffset, 8, 14);

    // 2. Body / Jacket (Warm Violet)
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.roundRect(46, 52 - bodyBob, 36, 36, 8);
    ctx.fill();

    // 3. Messenger Bag (Amber / Yellow)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(42, 64 - bodyBob, 12, 16);
    // strap
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(76, 52 - bodyBob);
    ctx.lineTo(46, 72 - bodyBob);
    ctx.stroke();

    // 4. Head / Face (Cozy skin tone)
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(64, 40 - bodyBob, 14, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(66, 36 - bodyBob, 3, 4);

    // 5. Cap (Emerald Green)
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(64, 30 - bodyBob, 15, Math.PI, 0);
    ctx.fill();
    // Cap visor
    ctx.fillRect(64, 28 - bodyBob, 12, 4);

    ctx.restore();
    this.courierTexture.needsUpdate = true;
  }

  initInteractionEvents() {
    // Keyboard inputs
    window.addEventListener('keydown', (e) => {
      const activeElement = document.activeElement;
      // Do not capture keys if user is typing in chat/comments/onboarding fields
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        this.walkingDirection = -1;
        this.isWalking = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.walkingDirection = 1;
        this.isWalking = true;
      } else if (e.key === ' ') {
        e.preventDefault();
        this.attemptDelivery();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        this.walkingDirection = 0;
        this.isWalking = false;
        this.drawCourierFrame(0); // return to idle
      }
    });

    // Mouse / Touch Drag planet spin
    this.renderer.domElement.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      // Rotate planet directly based on drag
      this.planetGroup.rotation.y += deltaX * 0.007;
      this.planetGroup.rotation.x += deltaY * 0.007;

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    // Touch support for mobile dragging
    this.renderer.domElement.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    });

    this.renderer.domElement.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
      const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

      this.planetGroup.rotation.y += deltaX * 0.01;
      this.planetGroup.rotation.x += deltaY * 0.01;

      this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    this.renderer.domElement.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    // Check resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  refreshQuests() {
    // Check actionsDatabase. Any action NOT completed today is available to deliver as a quest!
    const availableActions = actionsDatabase.filter(act => !state.completedActions.includes(act.id));
    
    // Hide all arrows first
    Object.keys(this.quests).forEach(k => {
      this.quests[k].visible = false;
    });

    // Show arrow above landmark if an uncompleted quest maps to it
    availableActions.forEach(act => {
      if (this.quests[act.landmark]) {
        this.quests[act.landmark].visible = true;
      }
    });
  }

  triggerQuest(actionId) {
    // Force activate a quest arrow visually
    const actionObj = actionsDatabase.find(a => a.id === actionId);
    if (actionObj && this.quests[actionObj.landmark]) {
      this.quests[actionObj.landmark].visible = true;
      
      // Rotate planet to focus/show this landmark
      const lmk = this.landmarks[actionObj.landmark];
      if (lmk) {
        // Simple lerp lookAt rotation
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(lmk.upVector, new THREE.Vector3(0, 1, 0));
        this.planetGroup.quaternion.copy(targetQuaternion);
      }
    }
  }

  updatePlanetClimate(carbonScore) {
    const healthy = carbonScore <= state.dailyBudget;
    
    // Interpolate colors or switch material configurations
    this.materials.ocean.color.setHex(healthy ? 0x0c4a6e : 0x3b3534);
    this.materials.land.color.setHex(healthy ? 0x059669 : 0x78716c);
    this.materials.leaves.color.setHex(healthy ? 0x10b981 : 0xb45309);
  }

  attemptDelivery() {
    const activeLandmark = this.checkProximityToQuests();
    if (activeLandmark) {
      // Find what uncompleted action maps to this landmark
      const activeActions = actionsDatabase.filter(a => a.landmark === activeLandmark && !state.completedActions.includes(a.id));
      if (activeActions.length > 0) {
        // Toggle the first action available
        const actionToLog = activeActions[0];
        
        // Particle burst effect
        this.spawnDeliveryParticles(this.landmarks[activeLandmark].group.position);

        toggleAction(actionToLog.id, true);
        this.refreshQuests();
      }
    }
  }

  checkProximityToQuests() {
    // The courier stands statically at World coordinate (0, 3.82, 0), which is the TOP vertex of the sphere.
    // As we rotate the planetGroup, we check which landmark's coordinate is closest to (0, 3.5, 0).
    const courierPos = new THREE.Vector3(0, 3.5, 0);
    let closestLandmarkId = null;
    let closestDistance = 999.0;

    Object.keys(this.landmarks).forEach(id => {
      const lmk = this.landmarks[id];
      
      // Get the current rotated position of the landmark in world space
      const worldPos = lmk.group.position.clone().applyMatrix4(this.planetGroup.matrixWorld);
      const dist = worldPos.distanceTo(courierPos);

      // If near and the landmark quest arrow is active
      if (dist < 1.15 && this.quests[id].visible) {
        if (dist < closestDistance) {
          closestDistance = dist;
          closestLandmarkId = id;
        }
      }
    });

    const overlay = document.getElementById('quest-prompt-overlay');
    if (closestLandmarkId && overlay) {
      overlay.style.display = 'block';
    } else if (overlay) {
      overlay.style.display = 'none';
    }

    return closestLandmarkId;
  }

  spawnDeliveryParticles(position) {
    // Simple 3D particle spray
    const particleCount = 15;
    const geom = new THREE.SphereGeometry(0.06, 4, 4);
    const mat = new THREE.MeshBasicMaterial({ color: 0x34d399 });
    
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const p = new THREE.Mesh(geom, mat);
      // Spawn slightly offset from landmark position
      const offset = new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 0.4
      );
      p.position.copy(position).add(offset);
      
      this.planetGroup.add(p);
      particles.push({
        mesh: p,
        velocity: new THREE.Vector3((Math.random() - 0.5) * 0.08, 0.05 + Math.random() * 0.08, (Math.random() - 0.5) * 0.08),
        life: 1.0
      });
    }

    // Animate and garbage collect particles
    const animateParticles = () => {
      let active = false;
      particles.forEach(p => {
        if (p.life > 0) {
          p.mesh.position.add(p.velocity);
          p.life -= 0.05;
          p.mesh.scale.set(p.life, p.life, p.life);
          active = true;
        } else if (p.mesh.parent) {
          p.mesh.parent.remove(p.mesh);
        }
      });
      if (active) requestAnimationFrame(animateParticles);
    };
    animateParticles();
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // 1. Handle keyboard walking planet rotation
    if (this.isWalking && !this.isDragging) {
      const rotationSpeed = 0.015;
      // Rotate planet under courier
      this.planetGroup.rotateZ(this.walkingDirection * rotationSpeed);
      
      // Animate courier sprite legs
      this.walkAnimTime += 0.45;
      this.drawCourierFrame(this.walkAnimTime);
    }

    // 2. Animate Bouncing Quest Icons (concentric bounce + rotation)
    const time = performance.now() * 0.003;
    Object.keys(this.quests).forEach(id => {
      const arrow = this.quests[id];
      if (arrow.visible) {
        arrow.position.y = 1.25 + Math.sin(time * 2.5) * 0.12;
        arrow.rotation.y += 0.02;
      }
    });

    // 3. Spin clean energy wind turbines
    if (this.turbines) {
      const speed = state.currentCarbon <= state.dailyBudget ? 0.08 : 0.005; // halt rotor when polluted
      this.turbines.forEach(rotor => {
        rotor.rotation.z += speed;
      });
    }

    // 4. Proximity check for quest deliveries
    this.checkProximityToQuests();

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

let planetGame = null;

// 25. App Initialization on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  loadStateFromCookies();

  initNavigation();
  initQuizWizard();
  initActionsFilters();
  initRecFilters();
  initChatbot();
  initCookieConsent();
  initAuthentication();
  initSocialPosting();
  initTrackingSimulators();
  initWeeklyPlanner();

  calculateBaselineFootprint();

  // Initialize the Carbon Courier 3D WebGL Planet
  planetGame = new CarbonCourierPlanet();

  const sessionToken = getCookie('ecosphere_session_token');
  const overlay = document.getElementById('auth-overlay');
  
  if (sessionToken) {
    state.isLoggedIn = true;
    if (overlay) overlay.classList.remove('active');
    switchTab('dashboard');
  } else {
    state.isLoggedIn = false;
    if (overlay) overlay.classList.add('active');
  }
});
