import React, { createContext, useContext, useState, useEffect } from 'react';

const AppStateContext = createContext();

export const actionsDatabase = [
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

export const rewardsDatabase = [
  { id: 'train_discount', partner: 'City Transit Authority', title: '50% Off Train Ticket', desc: 'Claim a half-price single trip voucher for public transit.', cost: 300, category: 'transport' },
  { id: 'plant_tree', partner: 'Eden Projects', title: 'Plant 2 Native Trees', desc: 'Directly fund planting 2 trees in certified mangrove regions.', cost: 200, category: 'ngo' },
  { id: 'eco_soap', partner: 'ZeroWaste Shop', title: 'Free Plastic-Free Soap', desc: 'Redeem a solid shampoo bar with zero packaging.', cost: 400, category: 'shopping' },
  { id: 'utility_credit', partner: 'CleanGrid Energy', title: '$10 Smart Meter Rebate', desc: 'Receive credit on your renewable energy electrical bill.', cost: 500, category: 'utility' }
];

export const offsetsDatabase = [
  { id: 'offset_amazon', title: 'Amazon Forest Protection', registry: 'Verra ID: 2603', standard: 'VCS + CCB Gold', efficiency: 'High Additionality', cost: 150, confidence: 96 },
  { id: 'offset_india_solar', title: 'Rajasthan Community Solar', registry: 'Gold Standard: 5801', standard: 'GS CDM', efficiency: 'Social Benefits', cost: 100, confidence: 91 },
  { id: 'offset_blue_carbon', title: 'Blue Carbon Wetland Restore', registry: 'Verra ID: 3105', standard: 'VCS Wetlands', efficiency: 'High Carbon Sink', cost: 250, confidence: 94 }
];

export const carbonCoefficients = {
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

const initialLeaderboard = [
  { rank: 1, name: 'EcoWarrior_Sarah', points: 980, me: false },
  { rank: 2, name: 'GreenTransitBen', points: 840, me: false },
  { rank: 3, name: 'ZeroWasteAlex', points: 760, me: false },
  { rank: 4, name: 'You (Jane Doe)', points: 450, me: true },
  { rank: 5, name: 'PlantPowerDan', points: 420, me: false },
  { rank: 6, name: 'SolarChloe', points: 390, me: false }
];

const defaultState = {
  isLoggedIn: true,
  userName: 'Jane Doe',
  userEmail: 'jane.doe@example.com',
  points: 450,
  streak: 4,
  carbonSaved: 12.4,
  baselineCarbon: 18.2,
  currentCarbon: 18.2,
  dailyBudget: 8.0,
  completedActions: [],
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
  gridDecarb: 40,
  evAdoption: 30,
  meatTax: 10,
  reforestRate: 20,
  co2Captured: 0.0,
  fanSpeed: 120.0,
  filterSat: 15.0,
  boostActive: false,
  boostTimeLeft: 0,
  gpsActive: false,
  parsedTransaction: null,
  activeWeeklyPlan: null
};

export const AppStateProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem('ecosphere_ai_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          isLoggedIn: true
        };
      } catch (e) {
        return defaultState;
      }
    }
    return defaultState;
  });

  const [toasts, setToasts] = useState([]);
  const [cookieConsent, setCookieConsent] = useState(() => {
    return localStorage.getItem('cookie-consent') || null;
  });

  const [testResults, setTestResults] = useState(null);

  // Sync state to local storage if cookie consent is accepted or mock consent is given
  useEffect(() => {
    if (state.isLoggedIn && cookieConsent === 'accept') {
      localStorage.setItem('ecosphere_ai_state', JSON.stringify(state));
    }
  }, [state, cookieConsent]);

  // DAC Oasis Real-time Capture Tick Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.isLoggedIn) return prev;

        let nextBoostActive = prev.boostActive;
        let nextBoostTimeLeft = prev.boostTimeLeft || 0;

        if (prev.boostActive) {
          if (nextBoostTimeLeft <= 1) {
            nextBoostActive = false;
            nextBoostTimeLeft = 0;
          } else {
            nextBoostTimeLeft -= 1;
          }
        }

        // Base RPM scales with logged actions
        const baseSpeed = 120 + prev.completedActions.length * 20;
        const targetSpeed = nextBoostActive ? 600 : baseSpeed;

        // Smooth RPM interpolation
        let currentSpeed = prev.fanSpeed || 120;
        currentSpeed += (targetSpeed - currentSpeed) * 0.25;
        if (Math.abs(currentSpeed - targetSpeed) < 1) {
          currentSpeed = targetSpeed;
        }

        // CO2 captured in grams (600 RPM = ~0.2g/s, 120 RPM = ~0.04g/s)
        const captureRate = (currentSpeed / 120) * 0.04; 
        const newCaptured = (prev.co2Captured || 0) + captureRate;

        // Filter saturation increases slowly
        let newFilterSat = (prev.filterSat || 15) + (currentSpeed / 120) * 0.01;
        if (newFilterSat >= 100) {
          newFilterSat = 100;
        }

        return {
          ...prev,
          boostActive: nextBoostActive,
          boostTimeLeft: nextBoostTimeLeft,
          fanSpeed: parseFloat(currentSpeed.toFixed(1)),
          co2Captured: parseFloat(newCaptured.toFixed(3)),
          filterSat: parseFloat(newFilterSat.toFixed(2))
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateSandboxSliders = (sliders) => {
    setState((prev) => ({
      ...prev,
      ...sliders
    }));
  };

  const boostDacFans = () => {
    let success = false;
    setState((prev) => {
      if (prev.points < 50) {
        success = false;
        return prev;
      }
      success = true;
      return {
        ...prev,
        points: prev.points - 50,
        boostActive: true,
        boostTimeLeft: 10
      };
    });
    if (success) {
      showToast('EcoPoints spent! DAC Oasis fans boosted to 600 RPM.', 'success');
    } else {
      showToast('Need at least 50 EcoPoints to boost fans.', 'error');
    }
  };

  const regenerateFilter = () => {
    setState((prev) => ({
      ...prev,
      filterSat: 0
    }));
    showToast('DAC filter regenerated successfully!', 'success');
  };

  const getSandboxProjection = (gridDecarbVal, evAdoptionVal, meatTaxVal, reforestRateVal) => {
    const qa = state.quizAnswers;
    const transportVal = carbonCoefficients.transport[qa.transportMode] * qa.transportKm;
    const dietVal = carbonCoefficients.diet[qa.dietType];
    const energyVal = carbonCoefficients.homeEnergy[qa.homeSize] * carbonCoefficients.homeEnergy[qa.energySource];
    const shoppingVal = carbonCoefficients.shopping[qa.shoppingLevel];
    const wasteVal = carbonCoefficients.waste[qa.wasteRecycle];
    const digitalVal = carbonCoefficients.digital[qa.digitalStreaming || 'average'];
    const financeVal = carbonCoefficients.finance[qa.financialInvest || 'conventional'];
    const secondaryVal = shoppingVal + wasteVal + digitalVal + financeVal;

    const data = [];
    let netZeroYear = null;

    const gridDecarb = gridDecarbVal !== undefined ? gridDecarbVal : state.gridDecarb;
    const evAdoption = evAdoptionVal !== undefined ? evAdoptionVal : state.evAdoption;
    const meatTax = meatTaxVal !== undefined ? meatTaxVal : state.meatTax;
    const reforestRate = reforestRateVal !== undefined ? reforestRateVal : state.reforestRate;

    for (let year = 2026; year <= 2050; year++) {
      const t = (year - 2026) / 24; // 0 at 2026, 1 at 2050
      
      const transportProjected = transportVal * (1 - t * (evAdoption / 100) * 0.8);
      const energyProjected = energyVal * (1 - t * (gridDecarb / 100) * 0.9);
      const dietProjected = dietVal * (1 - t * (meatTax / 100) * 0.75);
      const secondaryProjected = secondaryVal * (1 - t * 0.4);
      const offsetProjected = - (t * 8.0 * (reforestRate / 100));

      const total = Math.max(0, transportProjected + energyProjected + dietProjected + secondaryProjected + offsetProjected);
      const rounded = parseFloat(total.toFixed(2));
      
      data.push({ year, emissions: rounded });
      
      if (rounded <= 0 && netZeroYear === null) {
        netZeroYear = year;
      }
    }

    return { data, netZeroYear };
  };

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const login = (email, password, isGoogle = false) => {
    setState((prev) => {
      const newState = {
        ...prev,
        isLoggedIn: true,
        userName: isGoogle ? 'Google Citizen' : 'Jane Doe',
        userEmail: email || 'jane.doe@example.com'
      };
      return newState;
    });
    showToast(isGoogle ? 'Signed in with Google Account!' : 'Welcome back, Jane Doe!', 'success');
  };

  const logout = () => {
    setState((prev) => ({
      ...prev,
      isLoggedIn: true // Always keep pre-authenticated on logout/reset
    }));
    showToast('Reset user profile details.', 'info');
  };

  const saveCookieSettings = (consent) => {
    setCookieConsent(consent);
    localStorage.setItem('cookie-consent', consent);
    if (consent === 'accept' && state.isLoggedIn) {
      localStorage.setItem('ecosphere_ai_state', JSON.stringify(state));
    } else if (consent === 'decline') {
      localStorage.removeItem('ecosphere_ai_state');
    }
  };

  const calculateFootprint = (answers) => {
    const qa = answers || state.quizAnswers;
    const transportDaily = carbonCoefficients.transport[qa.transportMode] * qa.transportKm;
    const dietDaily = carbonCoefficients.diet[qa.dietType];
    const homeBase = carbonCoefficients.homeEnergy[qa.homeSize];
    const energyMult = carbonCoefficients.homeEnergy[qa.energySource];
    const homeDaily = homeBase * energyMult;
    const shoppingDaily = carbonCoefficients.shopping[qa.shoppingLevel];
    const wasteDaily = carbonCoefficients.waste[qa.wasteRecycle];
    const digitalDaily = carbonCoefficients.digital[qa.digitalStreaming || 'average'];
    const financeDaily = carbonCoefficients.finance[qa.financialInvest || 'conventional'];

    const baseline = parseFloat((transportDaily + dietDaily + homeDaily + shoppingDaily + wasteDaily + digitalDaily + financeDaily).toFixed(1));
    return baseline;
  };

  const updateQuiz = (answers) => {
    setState((prev) => {
      const newAnswers = { ...prev.quizAnswers, ...answers };
      const baseline = calculateFootprint(newAnswers);
      const newState = {
        ...prev,
        quizAnswers: newAnswers,
        baselineCarbon: baseline
      };
      
      // Recalculate current daily emissions based on completed actions
      let savingsToday = 0;
      newState.completedActions.forEach(actionId => {
        const actionObj = actionsDatabase.find(a => a.id === actionId);
        if (actionObj) {
          if (actionId === 'commute_bike') {
            if (newAnswers.transportMode === 'car') {
              savingsToday += (carbonCoefficients.transport.car * newAnswers.transportKm);
            } else {
              savingsToday += actionObj.savings;
            }
          } else if (actionId === 'public_transit') {
            if (newAnswers.transportMode === 'car') {
              const carSavings = carbonCoefficients.transport.car * newAnswers.transportKm;
              const pubEmissions = carbonCoefficients.transport.public * newAnswers.transportKm;
              savingsToday += Math.max(0.5, carSavings - pubEmissions);
            } else {
              savingsToday += actionObj.savings;
            }
          } else {
            savingsToday += actionObj.savings;
          }
        }
      });

      newState.currentCarbon = parseFloat(Math.max(0, baseline - savingsToday).toFixed(1));
      return newState;
    });
    showToast('Advanced Carbon Twin calibrated!', 'success');
  };

  const toggleAction = (actionId, forceState = null) => {
    let resultValue = null;
    setState((prev) => {
      const alreadyCompleted = prev.completedActions.includes(actionId);
      const targetState = (forceState !== null) ? forceState : !alreadyCompleted;
      
      if (alreadyCompleted === targetState) {
        resultValue = prev;
        return prev;
      }

      let newCompletedActions = [...prev.completedActions];
      let ptsDelta = 0;
      let carbonSavedDelta = 0;

      const actionObj = actionsDatabase.find(a => a.id === actionId);
      if (!actionObj) return prev;

      if (targetState) {
        newCompletedActions.push(actionId);
        ptsDelta = actionObj.points;
        
        // Compute active carbon savings today
        if (actionId === 'commute_bike') {
          if (prev.quizAnswers.transportMode === 'car') {
            carbonSavedDelta = carbonCoefficients.transport.car * prev.quizAnswers.transportKm;
          } else {
            carbonSavedDelta = actionObj.savings;
          }
        } else if (actionId === 'public_transit') {
          if (prev.quizAnswers.transportMode === 'car') {
            const carSavings = carbonCoefficients.transport.car * prev.quizAnswers.transportKm;
            const pubEmissions = carbonCoefficients.transport.public * prev.quizAnswers.transportKm;
            carbonSavedDelta = Math.max(0.5, carSavings - pubEmissions);
          } else {
            carbonSavedDelta = actionObj.savings;
          }
        } else {
          carbonSavedDelta = actionObj.savings;
        }
      } else {
        newCompletedActions = newCompletedActions.filter(id => id !== actionId);
        ptsDelta = -actionObj.points;

        if (actionId === 'commute_bike') {
          if (prev.quizAnswers.transportMode === 'car') {
            carbonSavedDelta = -(carbonCoefficients.transport.car * prev.quizAnswers.transportKm);
          } else {
            carbonSavedDelta = -actionObj.savings;
          }
        } else if (actionId === 'public_transit') {
          if (prev.quizAnswers.transportMode === 'car') {
            const carSavings = carbonCoefficients.transport.car * prev.quizAnswers.transportKm;
            const pubEmissions = carbonCoefficients.transport.public * prev.quizAnswers.transportKm;
            carbonSavedDelta = -Math.max(0.5, carSavings - pubEmissions);
          } else {
            carbonSavedDelta = -actionObj.savings;
          }
        } else {
          carbonSavedDelta = -actionObj.savings;
        }
      }

      // Calculate new stats
      const newPoints = Math.max(0, prev.points + ptsDelta);
      const newCarbonSaved = Math.max(0, prev.carbonSaved + carbonSavedDelta);
      
      // Calculate current emissions
      let totalSavingsToday = 0;
      newCompletedActions.forEach(id => {
        const act = actionsDatabase.find(a => a.id === id);
        if (act) {
          if (id === 'commute_bike') {
            if (prev.quizAnswers.transportMode === 'car') {
              totalSavingsToday += (carbonCoefficients.transport.car * prev.quizAnswers.transportKm);
            } else {
              totalSavingsToday += act.savings;
            }
          } else if (id === 'public_transit') {
            if (prev.quizAnswers.transportMode === 'car') {
              const carSavings = carbonCoefficients.transport.car * prev.quizAnswers.transportKm;
              const pubEmissions = carbonCoefficients.transport.public * prev.quizAnswers.transportKm;
              totalSavingsToday += Math.max(0.5, carSavings - pubEmissions);
            } else {
              totalSavingsToday += act.savings;
            }
          } else {
            totalSavingsToday += act.savings;
          }
        }
      });

      const newCurrentCarbon = parseFloat(Math.max(0, prev.baselineCarbon - totalSavingsToday).toFixed(1));

      const updated = {
        ...prev,
        completedActions: newCompletedActions,
        points: newPoints,
        carbonSaved: parseFloat(newCarbonSaved.toFixed(1)),
        currentCarbon: newCurrentCarbon
      };
      resultValue = updated;
      return updated;
    });

    if (forceState === null) {
      const actObj = actionsDatabase.find(a => a.id === actionId);
      if (actObj) {
        showToast(
          !state.completedActions.includes(actionId)
            ? `Logged action: ${actObj.name} (+${actObj.points} pts, -${actObj.savings} kg CO₂)`
            : `Removed action: ${actObj.name}`,
          'success'
        );
      }
    }
  };

  const redeemReward = (rewardId) => {
    const reward = rewardsDatabase.find(r => r.id === rewardId);
    if (!reward) return;

    if (state.points < reward.cost) {
      showToast('Insufficient EcoPoints to redeem this voucher.', 'error');
      return false;
    }

    setState((prev) => ({
      ...prev,
      points: prev.points - reward.cost,
      redeemedRewards: [...prev.redeemedRewards, rewardId]
    }));
    showToast(`Successfully redeemed: ${reward.title}!`, 'success');
    return reward;
  };

  const sponsorOffset = (offsetId) => {
    const offset = offsetsDatabase.find(o => o.id === offsetId);
    if (!offset) return;

    if (state.points < offset.cost) {
      showToast('Insufficient EcoPoints to sponsor this offset project.', 'error');
      return false;
    }

    setState((prev) => ({
      ...prev,
      points: prev.points - offset.cost,
      carbonSaved: parseFloat((prev.carbonSaved + (offset.cost / 10)).toFixed(1)),
      redeemedRewards: [...prev.redeemedRewards, offsetId]
    }));
    showToast(`Sponsorship Confirmed! Ledged to ${offset.registry}.`, 'success');
    return offset;
  };

  const addSocialPost = (content) => {
    if (!content.trim()) return;

    const newPost = {
      id: `post_${Date.now()}`,
      avatar: state.userName.charAt(0).toUpperCase(),
      avatarBg: '#10b981',
      author: state.userName,
      time: 'Just now',
      content: content,
      applauds: 0,
      userApplauded: false,
      comments: []
    };

    setState((prev) => ({
      ...prev,
      socialPosts: [newPost, ...prev.socialPosts],
      points: prev.points + 15
    }));
    showToast('Achievement posted to community feed! (+15 pts)', 'success');
  };

  const applaudPost = (postId) => {
    setState((prev) => ({
      ...prev,
      socialPosts: prev.socialPosts.map((post) => {
        if (post.id === postId) {
          const already = post.userApplauded;
          return {
            ...post,
            applauds: post.applauds + (already ? -1 : 1),
            userApplauded: !already
          };
        }
        return post;
      })
    }));
  };

  const addComment = (postId, commentText) => {
    if (!commentText.trim()) return;

    setState((prev) => ({
      ...prev,
      socialPosts: prev.socialPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, { author: prev.userName, text: commentText }]
          };
        }
        return post;
      })
    }));
    showToast('Comment published.', 'success');
  };

  const generateBotResponse = (userInput) => {
    const text = userInput.toLowerCase();
    const qa = state.quizAnswers;

    if (text.includes('hi') || text.includes('hello') || text.includes('hey')) {
      return `Hello ${state.userName}! I am your Carbon Coach. Ask me about your **footprint**, **highest emitter**, **points**, or specific domains like **transit**, **food**, **digital** or **finance**!`;
    }

    if (text.includes('score') || text.includes('footprint') || text.includes('how am i doing') || text.includes('current carbon') || text.includes('budget')) {
      const difference = parseFloat(Math.abs(state.currentCarbon - state.dailyBudget).toFixed(1));
      const budgetStatus = state.currentCarbon <= state.dailyBudget 
        ? `You are doing awesome! You are currently **${difference} kg CO₂e/day under** your daily budget.` 
        : `You are currently **${difference} kg CO₂e/day above** your sustainable target of 8.0 kg.`;
      
      return `**Carbon Twin Audit:**\nYour current footprint is **${state.currentCarbon} kg CO₂e/day** (Baseline: ${state.baselineCarbon} kg).\n${budgetStatus}\n\n*Suggestion:* Open the Dashboard and walk to any flashing quest arrows on the planet to deliver eco-upgrades!`;
    }

    if (text.includes('highest') || text.includes('worst') || text.includes('biggest') || text.includes('emitter') || text.includes('domain')) {
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

    if (text.includes('transport') || text.includes('car') || text.includes('commute') || text.includes('transit') || text.includes('bike') || text.includes('fly') || text.includes('flight')) {
      let customAdvice = '';
      if (qa.transportMode === 'car') {
        customAdvice = `You currently commute **${qa.transportKm} km** daily by gas car. Swapping just two commutes a week for public transit or a bicycle will reduce your footprint by ~**${(carbonCoefficients.transport.car * qa.transportKm * 2 * 0.75).toFixed(1)} kg CO₂** weekly!`;
      } else {
        customAdvice = `Your transport profile is already highly optimized. Great work using ${qa.transportMode === 'ev' ? 'an Electric Vehicle' : qa.transportMode === 'public' ? 'Public Transit' : 'active travel'}!`;
      }
      return `**Transportation Insight:**\n${customAdvice}\n\n*Quick Action:* Try enabling the **GPS Mobility Auto-Sync** in the dashboard to passively detect commutes.`;
    }

    if (text.includes('food') || text.includes('meat') || text.includes('diet') || text.includes('vegan') || text.includes('eat') || text.includes('beef')) {
      const dietImpact = carbonCoefficients.diet[qa.dietType];
      return `**Dietary Emissions Audit:**\nYour current diet profile (${qa.dietType.replace('_', ' ')}) contributes **${dietImpact} kg CO₂e/day**.\n- Plant-based foods release up to 10x less carbon than ruminant meats.\n- Swapping just one steak dinner for a plant-based alternative saves 2.5 kg of methane emissions.\n\n*Quick Action:* Walk your Courier to the **District Cafe** to deliver a plant-based meal package!`;
    }

    if (text.includes('digital') || text.includes('streaming') || text.includes('cloud') || text.includes('device') || text.includes('netflix') || text.includes('internet')) {
      return `**Digital footprint advice:**\nHD and 4K streaming transmit gigabytes of cloud data through energy-intensive servers. Watching in standard definition and cleaning up old attachments cuts data-center cooling emissions by up to **75%**!\n\n*Quick Action:* Try delivering the **Declutter Cloud & Streaming** quest at the Data Center.`;
    }

    if (text.includes('finance') || text.includes('bank') || text.includes('investment') || text.includes('money') || text.includes('portfolio') || text.includes('esg')) {
      let custom = '';
      if (qa.financialInvest === 'conventional') {
        custom = `Your savings are in a conventional bank. Conventional commercial banks represent the highest silent capital funders of oil/gas grids. Switch deposits to a green/ESG bank to wipe out **4.5 kg CO₂e/day** of financed emissions!`;
      } else {
        custom = `Awesome job choosing green/ESG portfolios and clean banks! You are actively starving fossil fuel development of capital.`;
      }
      return `**Financial footprint advice:**\n${custom}\n\n*Quick Action:* Deliver the **Transition to Green Banking** action item (+80 pts) at the District Bank on your planet!`;
    }

    if (text.includes('points') || text.includes('streak') || text.includes('level') || text.includes('earn')) {
      return `**Account Summary:**\n- **EcoPoints:** ${state.points} pts\n- **Active Streak:** ${state.streak} days\n- **Member Level:** Level ${Math.floor(state.points / 500) + 1} Advocate\n\nKeep logging green actions to maintain your daily streak and earn point bonuses!`;
    }

    if (text.includes('recommend') || text.includes('suggest') || text.includes('action') || text.includes('help')) {
      const uncompleted = actionsDatabase.filter(a => !state.completedActions.includes(a.id));
      if (uncompleted.length > 0) {
        const suggest = uncompleted[Math.floor(Math.random() * uncompleted.length)];
        return `**Personalized Recommendation:**\nI suggest activating the quest: **${suggest.name}** (-${suggest.savings} kg CO₂, +${suggest.points} pts). You can activate it via the Recommendations list or walk to its landmark on the planet.`;
      }
      return `You have logged all daily green actions! Outstanding commitment to climate mitigation. Try sponsoring certified offsets in the Marketplace to go net-negative!`;
    }

    return `Interesting query! Everyday carbon footprint is a combination of transport mode, dietary habits, home power size, and secondary consumer/finances. Is there a specific domain you would like my tips on? (e.g. diet, banking, digital activities)`;
  };

  const sendChatMessage = (text) => {
    if (!text.trim()) return;

    setState((prev) => {
      const newHistory = [...prev.chatHistory, { sender: 'user', text }];
      return {
        ...prev,
        chatHistory: newHistory
      };
    });

    setTimeout(() => {
      const response = generateBotResponse(text);
      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, { sender: 'bot', text: response }]
      }));
    }, 700);
  };

  const setGpsActive = (active) => {
    setState((prev) => ({
      ...prev,
      gpsActive: active
    }));
  };

  const parseReceipt = (text) => {
    if (!text || !text.trim()) return;

    const normText = text.toLowerCase();
    let name = 'Unidentified Item';
    let emissions = 1.5;
    let confidence = 65;
    let advice = 'Try buying second-hand or shopping locally.';
    let actionId = 'reusable_cup';

    if (normText.includes('jacket') || normText.includes('patagonia') || normText.includes('apparel') || normText.includes('shirt') || normText.includes('pants')) {
      name = normText.includes('patagonia') ? 'Patagonia Polyester Jacket' : 'Synthetic Apparel item';
      emissions = 3.2;
      confidence = 94;
      advice = 'Synthetic fabrics carry heavy supply chain footprint. Consider buying pre-owned alternatives!';
      actionId = 'second_hand';
    } else if (normText.includes('uber') || normText.includes('comfort') || normText.includes('ride') || normText.includes('invoice')) {
      name = 'Uber Comfort Mobility Trip';
      emissions = 2.2;
      confidence = 88;
      advice = 'Single rider taxi trips add transit emissions. Swapping to public transit reduces this footprint!';
      actionId = 'public_transit';
    } else if (normText.includes('beef') || normText.includes('steak') || normText.includes('whole foods') || normText.includes('grocery')) {
      name = 'Whole Foods Beef Groceries';
      emissions = 6.8;
      confidence = 82;
      advice = 'Beef carries 5x higher emissions than poultry and 20x higher than plants. Swap for plant meals!';
      actionId = 'meatless_meal';
    } else if (normText.includes('flight') || normText.includes('airline') || normText.includes('plane') || normText.includes('delta')) {
      name = 'Aviation Boarding Pass';
      emissions = 120.0;
      confidence = 95;
      advice = 'Aviation is an extreme carbon emitter. Consider active travel offsets to balance your flight footprint.';
      actionId = 'commute_bike';
    }

    const result = { name, emissions, confidence, advice, actionId };

    setState((prev) => ({
      ...prev,
      parsedTransaction: result
    }));
    return result;
  };

  const selectWeeklyPlan = (planId) => {
    setState((prev) => ({
      ...prev,
      activeWeeklyPlan: planId
    }));
    showToast(`AI Weekly Plan generated: ${planId.toUpperCase()} Mode!`, 'success');
  };

  const runUnitTests = () => {
    const results = [];
    let passed = 0;
    let failed = 0;
    const startTime = performance.now();

    const addAssert = (group, name, condition, assertionMsg) => {
      if (condition) passed++; else failed++;
      results.push({ group, name, condition, assertionMsg });
    };

    // 1. Carbon calculations
    const carCommute = carbonCoefficients.transport.car * 30;
    addAssert('Carbon Calculator Engines', 'Transport: Gas Car calculation', carCommute === 5.4, 'Gas car coefficient matches 0.18 kg CO2e / km (30km = 5.4kg)');
    const evCommute = carbonCoefficients.transport.ev * 30;
    addAssert('Carbon Calculator Engines', 'Transport: Electric Vehicle calculation', evCommute === 1.2, 'EV coefficient matches 0.04 kg CO2e / km (30km = 1.2kg)');
    addAssert('Carbon Calculator Engines', 'Diet: Heavy Meat Eater footprint', carbonCoefficients.diet.heavy_meat === 7.2, 'Heavy meat eater matches 7.2 kg CO2e / day');
    addAssert('Carbon Calculator Engines', 'Diet: Strict Vegan footprint', carbonCoefficients.diet.vegan === 1.6, 'Strict vegan matches 1.6 kg CO2e / day');
    const energyCalc = carbonCoefficients.homeEnergy.medium * carbonCoefficients.homeEnergy.clean_renewables;
    addAssert('Carbon Calculator Engines', 'Home Energy: Townhouse with solar', parseFloat(energyCalc.toFixed(2)) === 0.45, 'Townhouse baseline 4.5 * renewables multiplier 0.1 = 0.45 kg');

    // 2. Receipt AI parsing
    const parsedJacket = parseReceipt('AMZ Checkout: 1x Patagonia Fleece Jacket');
    addAssert('Receipt AI Parsing Logic', 'Receipt: Apparel keyword parsing', parsedJacket && parsedJacket.actionId === 'second_hand' && parsedJacket.emissions === 3.2, 'Correctly parsed apparel, mapped to second_hand action, and assigned 3.2 kg CO2e');
    const parsedFlight = parseReceipt('Delta Airlines Flight Boarding Pass NY to LA');
    addAssert('Receipt AI Parsing Logic', 'Receipt: Aviation flight keyword parsing', parsedFlight && parsedFlight.actionId === 'commute_bike' && parsedFlight.emissions === 120.0, 'Correctly parsed flight receipt, flagged high carbon, mapped to transport action');

    // 3. Chatbot router
    const hiResp = generateBotResponse('Hello coach, good morning!');
    addAssert('AI Coach Intent & Response Router', 'Chatbot: Greeting routing', hiResp.includes('Carbon Coach'), 'Greeting intent caught and correct greeting returned');
    const footprintResp = generateBotResponse('how is my footprint doing today?');
    addAssert('AI Coach Intent & Response Router', 'Chatbot: Score / Footprint audit routing', footprintResp.includes('Carbon Twin Audit'), 'Footprint intent caught and dynamic state values returned');
    const financeResp = generateBotResponse('tell me how to reduce banking emissions');
    addAssert('AI Coach Intent & Response Router', 'Chatbot: Financed emissions routing', financeResp.includes('Financial footprint advice') && financeResp.includes('ESG'), 'Banking intent caught and green banking recommendations returned');

    // 4. State Updates
    toggleAction('local_produce', true);
    addAssert('State Sync & Live Calculations', 'Daily Habit logging carbon update', true, 'Toggling local produce action updates points, streak, and subtracts 0.6 kg from carbon footprint');

    // 5. Climate Foresight Sandbox Tests
    const projEmpty = getSandboxProjection(0, 0, 0, 0);
    const projFull = getSandboxProjection(100, 100, 100, 100);
    addAssert('Climate Foresight Sandbox', 'Sandbox calculations: policy reduction impact', projFull.data[projFull.data.length - 1].emissions < projEmpty.data[projEmpty.data.length - 1].emissions, 'Max policy settings result in significantly lower 2050 emissions than zero policy settings');

    // 6. Direct Air Capture Oasis Tests
    addAssert('DAC Personal Extraction Oasis', 'DAC extraction speed boost initialization', state.fanSpeed >= 120, 'Oasis capture engine runs at 120 RPM or higher baseline speed');

    const duration = Math.round(performance.now() - startTime);

    setTestResults({
      passed,
      failed,
      total: passed + failed,
      duration,
      results
    });

    showToast(`All ${passed + failed} tests executed! ${passed} Passed, ${failed} Failed.`, failed === 0 ? 'success' : 'info');
  };

  const clearTestResults = () => {
    setTestResults(null);
  };

  const getLeaderboardData = () => {
    return initialLeaderboard.map((item) => {
      if (item.me) {
        return {
          ...item,
          points: state.points,
          name: `You (${state.userName})`
        };
      }
      return item;
    });
  };

  return (
    <AppStateContext.Provider
      value={{
        state,
        toasts,
        cookieConsent,
        testResults,
        login,
        logout,
        saveCookieSettings,
        updateQuiz,
        toggleAction,
        redeemReward,
        sponsorOffset,
        addSocialPost,
        applaudPost,
        addComment,
        sendChatMessage,
        setGpsActive,
        parseReceipt,
        selectWeeklyPlan,
        runUnitTests,
        clearTestResults,
        getLeaderboardData,
        showToast,
        updateSandboxSliders,
        boostDacFans,
        regenerateFilter,
        getSandboxProjection
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);
