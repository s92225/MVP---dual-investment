const PULSE_STORAGE_KEY = "silvertimes-silver-pulse-state-v5";
const PULSE_WALLET_KEY = "silvertimes-silver-pulse-wallet-connected";
const DEMO_WALLET = "0x51cb9f3d6c0a42e89491dd2b7c12f4c0a9c0de55";
const PRICE_SOURCE = "LBMA Silver Price (manual MVP input)";
const HK_OFFSET_MS = 8 * 60 * 60 * 1000;
const GAME_RULES = {
  minBetSparks: 10,
  maxDailyBetSparks: 100,
  startingSparks: 10,
  dailySparks: 10,
  freeSparkCap: 100,
  sparksPerUsdt: 2000,
  sttStakeAmount: 1,
  sttReferenceUsdt: 75,
  stakeLockDays: 7,
  stakeWinMultiplier: 1.5,
  tradingDaysPerYear: 260,
  missionRewards: {
    fiveDayWeek: 100,
    firstWinningGuess: 100,
    stakeStt: 1000
  },
  streakMultipliers: [
    { priorWins: 5, multiplier: 1.5 },
    { priorWins: 4, multiplier: 1.4 },
    { priorWins: 3, multiplier: 1.3 },
    { priorWins: 2, multiplier: 1.2 },
    { priorWins: 1, multiplier: 1.1 },
    { priorWins: 0, multiplier: 1 }
  ]
};

const SAMPLE_WALLETS = [
  "0xa91f5d2e8b44d1032aa70e90f1c5a8d247e00001",
  "0xb1c7f3210de7b610902cba6504d2ce101ae00002",
  "0xc84a1b207910c66b6e98fa701d63be7534e00003",
  "0xd5136f9039a8b71d23fd0edeeab0f7c92ae00004",
  "0xe7b2f84d14e0c4dfc938a841070d0c2b73e00005",
  "0xf0d48127d70b25d938a1963ac1971e201ae00006",
  "0x09a62dc241cf7ef19eb27e6e8fa9a0e951e00007",
  "0x187a03b66fb07f50d0df5cbe7fe69831c3e00008",
  "0x2e3d875011032ac905cfa6d5123098bb10e00009",
  "0x334941d76ed307124d78e4266bc5eb723ae00010",
  "0x45f7dc2ee6215e510be64b7027005af6d1e00011",
  "0x58a002d810b7ce4e7c9f6f913127a4d6a2e00012",
  "0x6cb1f240a73a914ed421f89d7db3520cafe00013",
  "0x7ddda4e3fa702f1b30821b6c83a41a980de00014",
  "0x8a41de7b946fd315a8d1779260cadc89b1e00015",
  "0x93e5f4ba408d7b2291a44cb03bf01644ade00016",
  "0xac72e7cfd310af982e8bb167c66d29e500e00017",
  "0xbf9d3412e76dc05eaa80122041f7d3ba91e00018",
  "0xce18099d4f7ac66112de0c740e319a8d10e00019",
  "0xdd5f874bd3e20572f49914d6f710c0f42ae00020",
  "0xe0f1c848a911d73bb06edc91c5d7f4200de00021",
  "0xf38d10be52a4c0f713d69bc177e02a91ace00022"
];

// Seeded MVP chart series; replace with historical silver prices when the data feed is connected.
const MONTHLY_SILVER_PRICES = [
  { label: "Apr 12", value: 72.4 },
  { label: "Apr 15", value: 73.8 },
  { label: "Apr 18", value: 72.9 },
  { label: "Apr 21", value: 74.2 },
  { label: "Apr 24", value: 75.1 },
  { label: "Apr 27", value: 74.6 },
  { label: "Apr 30", value: 76.4 },
  { label: "May 3", value: 75.8 },
  { label: "May 6", value: 77.2 },
  { label: "May 9", value: 78.1 },
  { label: "May 12", value: 78.42 }
];

let pulseState = normalizeState(loadState());
let walletConnected = localStorage.getItem(PULSE_WALLET_KEY) === "true";
let pulseToastTimer = null;
let countdownTimer = null;
let monthlyChartState = null;
let celebrationTimer = null;
let selectedLeaderboardWeekKey = null;
let pendingGuess = null;

const els = {
  walletButton: document.querySelector("#pulseWalletButton"),
  pulseRoundPill: document.querySelector("#pulseRoundPill"),
  pulseHeaderMetric: document.querySelector("#pulseHeaderMetric"),
  pulseSpotInline: document.querySelector("#pulseSpotInline"),
  heroRewardPool: document.querySelector("#heroRewardPool"),
  heroMaxWinners: document.querySelector("#heroMaxWinners"),
  roundStatusPill: document.querySelector("#roundStatusPill"),
  pulseQuestionText: document.querySelector("#pulseQuestionText"),
  monthlySilverChart: document.querySelector("#monthlySilverChart"),
  openingPriceValue: document.querySelector("#openingPriceValue"),
  currentPriceValue: document.querySelector("#currentPriceValue"),
  cutoffValue: document.querySelector("#cutoffValue"),
  countdownValue: document.querySelector("#countdownValue"),
  sparkBetAmount: document.querySelector("#sparkBetAmount"),
  betAmountDisplay: document.querySelector("#betAmountDisplay"),
  betLimitText: document.querySelector("#betLimitText"),
  predictUpButton: document.querySelector("#predictUpButton"),
  predictDownButton: document.querySelector("#predictDownButton"),
  predictionCelebration: document.querySelector("#predictionCelebration"),
  userPredictionStatus: document.querySelector("#userPredictionStatus"),
  participantCount: document.querySelector("#participantCount"),
  sentimentUpBar: document.querySelector("#sentimentUpBar"),
  sentimentDownBar: document.querySelector("#sentimentDownBar"),
  sentimentUpLabel: document.querySelector("#sentimentUpLabel"),
  sentimentDownLabel: document.querySelector("#sentimentDownLabel"),
  roundDetailStats: document.querySelector("#roundDetailStats"),
  leaderboardPanel: document.querySelector("#leaderboardPanel"),
  leaderboardSummary: document.querySelector("#leaderboardSummary"),
  leaderboardWeekSelect: document.querySelector("#leaderboardWeekSelect"),
  roundHistoryPanel: document.querySelector("#roundHistoryPanel"),
  profilePanel: document.querySelector("#profilePanel"),
  resetPulseButton: document.querySelector("#resetPulseButton"),
  adminForm: document.querySelector("#pulseAdminForm"),
  adminOpeningPrice: document.querySelector("#adminOpeningPrice"),
  adminCurrentPrice: document.querySelector("#adminCurrentPrice"),
  adminClosingPrice: document.querySelector("#adminClosingPrice"),
  adminRewardPool: document.querySelector("#adminRewardPool"),
  adminMaxWinners: document.querySelector("#adminMaxWinners"),
  adminStatus: document.querySelector("#adminStatus"),
  adminSparkBalance: document.querySelector("#adminSparkBalance"),
  adminOverride: document.querySelector("#adminOverride"),
  adminCutoffTime: document.querySelector("#adminCutoffTime"),
  adminSettlementTime: document.querySelector("#adminSettlementTime"),
  settlePulseButton: document.querySelector("#settlePulseButton"),
  markRewardsApprovedButton: document.querySelector("#markRewardsApprovedButton"),
  markRewardsPaidButton: document.querySelector("#markRewardsPaidButton"),
  guessConfirmModal: document.querySelector("#guessConfirmModal"),
  guessConfirmText: document.querySelector("#guessConfirmText"),
  guessConfirmMode: document.querySelector("#guessConfirmMode"),
  guessConfirmModeMeta: document.querySelector("#guessConfirmModeMeta"),
  cancelGuessButton: document.querySelector("#cancelGuessButton"),
  confirmGuessButton: document.querySelector("#confirmGuessButton"),
  toast: document.querySelector("#pulseToast")
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PULSE_STORAGE_KEY));
    if (isValidStoredState(parsed)) {
      return parsed;
    }
  } catch {
    // Ignore invalid demo storage and reseed below.
  }

  return createDefaultState();
}

function saveState(state = pulseState) {
  localStorage.setItem(PULSE_STORAGE_KEY, JSON.stringify(state));
}

function isValidStoredState(state) {
  return Boolean(
    state &&
    Array.isArray(state.rounds) &&
    Array.isArray(state.predictions) &&
    Array.isArray(state.rewards) &&
    state.rounds.length &&
    state.rounds.every(isValidStoredRound)
  );
}

function isValidStoredRound(round) {
  return Boolean(
    round &&
    typeof round.id === "string" &&
    typeof round.roundDate === "string" &&
    typeof round.status === "string" &&
    typeof round.startTime === "string" &&
    typeof round.predictionCutoffTime === "string" &&
    typeof round.settlementTime === "string" &&
    Number.isFinite(Number(round.openingPrice)) &&
    Number.isFinite(Number(round.currentPrice))
  );
}

function normalizeState(state) {
  if (!isValidStoredState(state)) {
    return createDefaultState();
  }

  const activeDateKey = activeTradingDateKey(new Date());
  const nextState = {
    ...state,
    version: 5,
    user: normalizeUser(state.user, activeDateKey),
    rounds: [...state.rounds],
    predictions: state.predictions.map(normalizePrediction),
    rewards: Array.isArray(state.rewards) ? [...state.rewards] : [],
    sparkLedger: Array.isArray(state.sparkLedger) ? [...state.sparkLedger] : []
  };

  if (!nextState.sparkLedger.length) {
    nextState.sparkLedger.push({
      id: `SL-initial-${Date.now()}`,
      wallet: DEMO_WALLET,
      type: "initial",
      amount: GAME_RULES.startingSparks,
      balanceAfter: nextState.user.sparkBalance,
      reason: "Starting Sparks",
      roundId: null,
      createdAt: new Date().toISOString()
    });
  }

  const existingRoundIds = new Set(nextState.rounds.map((round) => round.id));
  const currentRoundId = roundIdForDateKey(activeDateKey);

  if (!existingRoundIds.has(currentRoundId)) {
    nextState.rounds.unshift(createRound(activeDateKey, {
      openingPrice: 78,
      currentPrice: 78.42,
      status: "open"
    }));
    existingRoundIds.add(currentRoundId);
  }

  createPastRounds(activeDateKey, 12).forEach((round) => {
    if (existingRoundIds.has(round.id)) {
      return;
    }

    const roundPredictions = seedPastPredictions(round, round.winningSide);
    nextState.rounds.push(round);
    nextState.predictions.push(...roundPredictions);
    nextState.rewards.push(...createDemoRewardsForRound(round, roundPredictions));
    existingRoundIds.add(round.id);
  });

  nextState.rounds.forEach((round) => {
    const hasReward = nextState.rewards.some((reward) => reward.roundId === round.id);
    if (round.status !== "settled" || hasReward || !round.winningSide || round.winningSide === "FLAT") {
      return;
    }

    nextState.rewards.push(...createDemoRewardsForRound(round, predictionsForRound(round.id, nextState)));
  });

  nextState.rounds.sort((first, second) => second.roundDate.localeCompare(first.roundDate));
  return nextState;
}

function normalizeUser(user, activeDateKey) {
  const normalized = {
    wallet: DEMO_WALLET,
    sparkBalance: Number.isFinite(Number(user?.sparkBalance)) ? Number(user.sparkBalance) : GAME_RULES.startingSparks,
    dailySparkGrantDates: Array.isArray(user?.dailySparkGrantDates) ? [...user.dailySparkGrantDates] : [activeDateKey],
    stake: user?.stake || null,
    missions: {
      fiveDayWeeks: Array.isArray(user?.missions?.fiveDayWeeks) ? [...user.missions.fiveDayWeeks] : [],
      firstWinRewarded: Boolean(user?.missions?.firstWinRewarded),
      stakeRewarded: Boolean(user?.missions?.stakeRewarded)
    },
    redemptions: Array.isArray(user?.redemptions) ? [...user.redemptions] : []
  };

  if (!Number.isFinite(normalized.sparkBalance)) {
    normalized.sparkBalance = GAME_RULES.startingSparks;
  }

  return normalized;
}

function normalizePrediction(prediction) {
  const amountSparks = clampInteger(
    prediction.amountSparks ?? GAME_RULES.minBetSparks,
    GAME_RULES.minBetSparks,
    GAME_RULES.maxDailyBetSparks
  );
  const createdAt = prediction.createdAt || new Date().toISOString();

  return {
    ...prediction,
    amountSparks,
    mode: prediction.mode || "paper",
    stakingMultiplier: Number(prediction.stakingMultiplier || 1),
    editCount: Number(prediction.editCount || 0),
    updatedAt: prediction.updatedAt || createdAt,
    history: Array.isArray(prediction.history) && prediction.history.length
      ? prediction.history
      : [{
        action: "submitted",
        side: prediction.side,
        amountSparks,
        mode: prediction.mode || "paper",
        createdAt
      }]
  };
}

function createDefaultState() {
  const activeDateKey = activeTradingDateKey(new Date());
  const activeRound = createRound(activeDateKey, {
    openingPrice: 78,
    currentPrice: 78.42,
    status: "open"
  });
  const pastRounds = createPastRounds(activeDateKey, 12);
  const activePredictions = seedPredictions(activeRound, [
    ["UP", 8, 20, 2],
    ["UP", 13, 30, 1],
    ["DOWN", 19, 10, 0],
    ["UP", 25, 40, 4],
    ["DOWN", 31, 20, 1],
    ["UP", 39, 100, 0],
    ["UP", 47, 60, 3],
    ["DOWN", 58, 10, 2],
    ["UP", 74, 30, 0],
    ["DOWN", 86, 80, 0],
    ["UP", 101, 50, 1],
    ["UP", 118, 10, 2],
    ["DOWN", 136, 70, 0],
    ["UP", 154, 30, 1],
    ["UP", 173, 20, 0],
    ["DOWN", 191, 40, 0],
    ["UP", 209, 60, 2],
    ["DOWN", 228, 30, 1],
    ["UP", 241, 20, 0],
    ["DOWN", 269, 100, 0],
    ["UP", 298, 40, 1],
    ["UP", 337, 10, 0]
  ]);
  const pastPredictions = pastRounds.flatMap((round) => seedPastPredictions(round, round.winningSide));
  const predictions = [...activePredictions, ...pastPredictions];
  const rewards = pastRounds.flatMap((round) => {
    return createDemoRewardsForRound(round, predictions.filter((prediction) => prediction.roundId === round.id));
  });

  return {
    version: 5,
    user: {
      wallet: DEMO_WALLET,
      sparkBalance: GAME_RULES.startingSparks,
      dailySparkGrantDates: [activeDateKey],
      stake: null,
      missions: {
        fiveDayWeeks: [],
        firstWinRewarded: false,
        stakeRewarded: false
      },
      redemptions: []
    },
    sparkLedger: [{
      id: `SL-initial-${Date.now()}`,
      wallet: DEMO_WALLET,
      type: "initial",
      amount: GAME_RULES.startingSparks,
      balanceAfter: GAME_RULES.startingSparks,
      reason: "Starting Sparks",
      roundId: null,
      createdAt: new Date().toISOString()
    }],
    rounds: [activeRound, ...pastRounds],
    predictions,
    rewards
  };
}

function createPastRounds(activeDateKey, count) {
  const rounds = [];
  let cursor = activeDateKey;

  for (let index = 0; index < count; index += 1) {
    cursor = previousTradingDateKey(cursor);
    const winningSide = index % 3 === 1 ? "DOWN" : "UP";
    const openingPrice = 78 + ((index % 5) - 2) * 0.28;
    const move = 0.45 + (index % 4) * 0.17;
    const closingPrice = winningSide === "UP" ? openingPrice + move : openingPrice - move;

    rounds.push(createRound(cursor, {
      openingPrice,
      currentPrice: closingPrice,
      closingPrice,
      winningSide,
      status: "settled"
    }));
  }

  return rounds;
}

function createDemoRewardsForRound(round, predictions) {
  return predictions
    .filter((prediction) => prediction.side === round.winningSide && round.winningSide !== "FLAT")
    .map((prediction) => ({
      prediction,
      score: calculateScore(prediction, round)
    }))
    .sort(compareScoredPredictions)
    .map((entry, index) => {
      const outcome = calculatePredictionOutcome(entry.prediction, round);
      return {
        id: `RW-${round.id}-${entry.prediction.wallet.slice(-6)}-${index + 1}`,
        roundId: round.id,
        wallet: entry.prediction.wallet,
        rank: index + 1,
        sparkProfit: outcome.sparkProfit,
        returnedStake: outcome.returnedStake,
        finalMultiplier: outcome.finalMultiplier,
        status: "settled",
        createdAt: round.settledAt || round.settlementTime,
        updatedAt: round.settledAt || round.settlementTime
      };
    });
}

function createRound(dateKey, overrides = {}) {
  const startTime = hkDateTimeToUtc(dateKey, 12, 0);
  const cutoffTime = hkDateTimeToUtc(addDateKey(dateKey, 1), 10, 0);

  return {
    id: roundIdForDateKey(dateKey),
    roundDate: dateKey,
    title: `Silver Pulse ${dateKey}`,
    openingPrice: overrides.openingPrice ?? 78,
    currentPrice: overrides.currentPrice ?? 78.42,
    closingPrice: overrides.closingPrice ?? null,
    winningSide: overrides.winningSide ?? null,
    resultOverride: overrides.resultOverride ?? "",
    status: overrides.status ?? "open",
    rewardPoolCents: overrides.rewardPoolCents ?? 0,
    maxWinners: overrides.maxWinners ?? 0,
    startTime: startTime.toISOString(),
    predictionCutoffTime: cutoffTime.toISOString(),
    settlementTime: cutoffTime.toISOString(),
    priceSource: PRICE_SOURCE,
    createdAt: startTime.toISOString(),
    updatedAt: new Date().toISOString(),
    settledAt: overrides.status === "settled" ? cutoffTime.toISOString() : null
  };
}

function seedPredictions(round, rows) {
  const start = new Date(round.startTime).getTime();
  return rows.map(([side, minutesAfterStart, amountSparks, priorWinStreak], index) => {
    const createdAt = new Date(start + minutesAfterStart * 60 * 1000).toISOString();
    return {
      id: `PR-${round.id}-${index + 1}`,
      roundId: round.id,
      wallet: SAMPLE_WALLETS[index],
      side,
      amountSparks,
      mode: "paper",
      stakingMultiplier: 1,
      createdAt,
      updatedAt: createdAt,
      editCount: 0,
      history: [{
        action: "submitted",
        side,
        amountSparks,
        mode: "paper",
        createdAt
      }],
      priorWinStreak,
      score: null,
      result: null
    };
  });
}

function seedPastPredictions(round, winningSide) {
  const start = new Date(round.startTime).getTime();
  return SAMPLE_WALLETS.slice(0, 7).map((wallet, index) => {
    const side = index === 2 ? (winningSide === "UP" ? "DOWN" : "UP") : winningSide;
    const amountSparks = [10, 20, 30, 40, 50, 80, 100][index];
    const createdAt = new Date(start + (18 + index * 17) * 60 * 1000).toISOString();
    const prediction = {
      id: `PR-${round.id}-past-${index + 1}`,
      roundId: round.id,
      wallet,
      side,
      amountSparks,
      mode: "paper",
      stakingMultiplier: 1,
      createdAt,
      updatedAt: createdAt,
      editCount: 0,
      history: [{
        action: "submitted",
        side,
        amountSparks,
        mode: "paper",
        createdAt
      }],
      priorWinStreak: Math.max(0, 2 - index),
      result: side === winningSide ? "correct" : "incorrect"
    };
    return {
      ...prediction,
      score: side === winningSide ? calculateScore(prediction, round) : 0
    };
  });
}

function roundIdForDateKey(dateKey) {
  return `SP-${dateKey}`;
}

function hkDateTimeToUtc(dateKey, hour, minute) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0) - HK_OFFSET_MS);
}

function hkParts(date) {
  const hkDate = new Date(date.getTime() + HK_OFFSET_MS);
  return {
    year: hkDate.getUTCFullYear(),
    month: hkDate.getUTCMonth() + 1,
    day: hkDate.getUTCDate(),
    hour: hkDate.getUTCHours(),
    minute: hkDate.getUTCMinutes()
  };
}

function hkDateKey(date = new Date()) {
  const parts = hkParts(date);
  return [
    parts.year,
    String(parts.month).padStart(2, "0"),
    String(parts.day).padStart(2, "0")
  ].join("-");
}

function activeTradingDateKey(date) {
  const parts = hkParts(date);
  const todayKey = hkDateKey(date);
  const previousKey = addDateKey(todayKey, -1);
  const previousTradingKey = previousTradingDateKey(todayKey);

  if (parts.hour < 12 && previousTradingKey === previousKey) {
    return previousTradingKey;
  }

  if (isTradingDateKey(todayKey)) {
    return todayKey;
  }

  return nextTradingDateKey(todayKey);
}

function previousTradingDateKey(dateKey) {
  let cursor = addDateKey(dateKey, -1);
  while (!isTradingDateKey(cursor)) {
    cursor = addDateKey(cursor, -1);
  }
  return cursor;
}

function nextTradingDateKey(dateKey) {
  let cursor = dateKey;
  while (!isTradingDateKey(cursor)) {
    cursor = addDateKey(cursor, 1);
  }
  return cursor;
}

function isTradingDateKey(dateKey) {
  const day = dateFromDateKey(dateKey).getDay();
  return day !== 0 && day !== 6;
}

function addDateKey(dateKey, days) {
  return localDateKey(addDays(dateFromDateKey(dateKey), days));
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatUsd(value) {
  return `US$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatUsdtFromCents(cents) {
  return `${(Number(cents) / 100).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} USDT`;
}

function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "-";
  }

  return `US$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatSparkAmount(value) {
  return `${Number(value).toLocaleString("en-US")} Sparks`;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatHkDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  }).format(new Date(value));
}

function formatDuration(ms) {
  if (ms <= 0) {
    return "0m";
  }

  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function formatMultiplier(value) {
  return `${Number(value).toFixed(1)}x`;
}

function toDatetimeLocalValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDatetimeLocalValue(value) {
  return value ? new Date(value).toISOString() : null;
}

function shortWallet(wallet) {
  if (!wallet) {
    return "-";
  }

  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function clampInteger(value, min, max) {
  const numeric = Math.floor(Number(value));
  if (!Number.isFinite(numeric)) {
    return min;
  }

  return Math.min(max, Math.max(min, numeric));
}

function getUser() {
  pulseState.user = normalizeUser(pulseState.user, activeTradingDateKey(new Date()));
  return pulseState.user;
}

function isUserStaked() {
  const stake = getUser().stake;
  return Boolean(stake && stake.active);
}

function stakeUnlockTime() {
  return getUser().stake?.unlockAt || null;
}

function currentModeLabel() {
  return isUserStaked() ? "Trading Mode" : "Paper Mode";
}

function currentModeMeta() {
  return isUserStaked() ? "1 STT staked" : "Demo Sparks only";
}

function applySparkChange(amount, type, reason, roundId = null) {
  const user = getUser();
  user.sparkBalance = Math.max(0, Math.round(Number(user.sparkBalance || 0) + amount));
  pulseState.sparkLedger.push({
    id: `SL-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    wallet: DEMO_WALLET,
    type,
    amount,
    balanceAfter: user.sparkBalance,
    reason,
    roundId,
    createdAt: new Date().toISOString()
  });
}

function ensureDailySparkGrant(showMessage = false) {
  const user = getUser();
  const tradingDate = activeTradingDateKey(new Date());

  if (user.dailySparkGrantDates.includes(tradingDate)) {
    return false;
  }

  user.dailySparkGrantDates.push(tradingDate);

  if (user.sparkBalance <= GAME_RULES.freeSparkCap) {
    applySparkChange(GAME_RULES.dailySparks, "daily-grant", `Daily ${GAME_RULES.dailySparks} Sparks`, null);
    saveState();
    if (showMessage) {
      showToast(`Daily reward added: ${GAME_RULES.dailySparks} Sparks.`);
    }
    return true;
  }

  saveState();
  if (showMessage) {
    showToast("Daily Sparks skipped because your balance is above 100.");
  }
  return false;
}

function effectiveStatus(round) {
  const now = Date.now();
  const start = new Date(round.startTime).getTime();
  const cutoff = new Date(round.predictionCutoffTime).getTime();

  if (round.status === "settled" || round.status === "cancelled") {
    return round.status;
  }

  if (round.status === "upcoming" || now < start) {
    return "upcoming";
  }

  if (round.status === "locked" || now >= cutoff) {
    return "locked";
  }

  return "open";
}

function getActiveRound(state = pulseState) {
  const activeId = roundIdForDateKey(activeTradingDateKey(new Date()));
  return state.rounds.find((round) => round.id === activeId) ||
    state.rounds.find((round) => ["open", "locked", "upcoming"].includes(round.status)) ||
    state.rounds[0];
}

function predictionsForRound(roundId, state = pulseState) {
  return state.predictions.filter((prediction) => prediction.roundId === roundId);
}

function rewardsForRound(roundId, state = pulseState) {
  return state.rewards.filter((reward) => reward.roundId === roundId);
}

function currentWalletPrediction(round, state = pulseState) {
  return state.predictions.find((prediction) => prediction.roundId === round.id && prediction.wallet === DEMO_WALLET) || null;
}

function dailyBetTotalForWallet(round, wallet, excludePredictionId = null, state = pulseState) {
  return predictionsForRound(round.id, state)
    .filter((prediction) => prediction.wallet === wallet && prediction.id !== excludePredictionId)
    .reduce((total, prediction) => total + Number(prediction.amountSparks || 0), 0);
}

function remainingDailyBetForWallet(round, wallet, excludePredictionId = null) {
  return Math.max(0, GAME_RULES.maxDailyBetSparks - dailyBetTotalForWallet(round, wallet, excludePredictionId));
}

function sentimentForRound(round, state = pulseState) {
  const predictions = predictionsForRound(round.id, state);
  const up = predictions.filter((prediction) => prediction.side === "UP").length;
  const down = predictions.filter((prediction) => prediction.side === "DOWN").length;
  const total = predictions.length;

  return {
    total,
    up,
    down,
    upPercent: total ? Math.round((up / total) * 100) : 0,
    downPercent: total ? Math.round((down / total) * 100) : 0
  };
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(pulseToastTimer);
  pulseToastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
}

function launchPredictionCelebration(side, triggerButton) {
  const palette = side === "UP"
    ? ["#00c176", "#7df0bf", "#67c7ff", "#f3f7fb"]
    : ["#ff3b4f", "#ff8a94", "#f0a47a", "#f3f7fb"];
  const overlayRect = els.predictionCelebration.getBoundingClientRect();
  const buttonRect = triggerButton?.getBoundingClientRect();
  const originX = buttonRect
    ? buttonRect.left - overlayRect.left + buttonRect.width / 2
    : overlayRect.width / 2;
  const originY = buttonRect
    ? buttonRect.top - overlayRect.top + buttonRect.height / 2
    : overlayRect.height / 2;

  els.predictionCelebration.style.setProperty("--burst-origin-x", `${originX}px`);
  els.predictionCelebration.style.setProperty("--burst-origin-y", `${originY}px`);
  els.predictionCelebration.style.setProperty("--burst-glow", palette[0]);

  const fragments = [
    '<span class="celebration-core"></span>',
    '<span class="celebration-ring"></span>'
  ];

  fragments.push(...Array.from({ length: 30 }, (_, index) => {
    const color = palette[index % palette.length];
    const angle = (Math.PI * 2 * index) / 30 + (index % 2) * 0.08;
    const distance = 76 + (index % 6) * 12;
    const travelX = Math.cos(angle) * distance;
    const travelY = Math.sin(angle) * distance - 12;
    const delay = (index % 6) * 0.016;
    const rotate = -48 + (index % 11) * 10;
    const size = index % 5 === 0 ? 13 : index % 2 === 0 ? 10 : 8;
    const shapeClass = index % 4 === 0 ? " is-dot" : index % 3 === 0 ? " is-square" : "";
    return `
      <span
        class="confetti-piece${shapeClass}"
        style="--confetti-origin-x:${originX}px;--confetti-origin-y:${originY}px;--confetti-delay:${delay}s;--confetti-travel-x:${travelX.toFixed(1)}px;--confetti-travel-y:${travelY.toFixed(1)}px;--confetti-rotate:${rotate}deg;--confetti-color:${color};--confetti-size:${size}px"
      ></span>
    `;
  }));

  fragments.push(...Array.from({ length: 10 }, (_, index) => {
    const color = palette[(index + 1) % palette.length];
    const angle = (-Math.PI / 2) + ((index - 4.5) * 0.26);
    const distance = 92 + (index % 3) * 18;
    const travelX = Math.cos(angle) * distance;
    const travelY = Math.sin(angle) * distance;
    const delay = 0.02 + (index % 5) * 0.018;
    const length = 20 + (index % 3) * 6;
    return `
      <span
        class="confetti-spark"
        style="--confetti-origin-x:${originX}px;--confetti-origin-y:${originY}px;--confetti-delay:${delay}s;--confetti-travel-x:${travelX.toFixed(1)}px;--confetti-travel-y:${travelY.toFixed(1)}px;--confetti-color:${color};--confetti-length:${length}px;--confetti-rotate:${(angle * 180 / Math.PI).toFixed(1)}deg"
      ></span>
    `;
  }));

  els.predictionCelebration.innerHTML = fragments.join("");

  els.predictionCelebration.classList.add("is-active");
  clearTimeout(celebrationTimer);
  celebrationTimer = setTimeout(() => {
    els.predictionCelebration.classList.remove("is-active");
    els.predictionCelebration.innerHTML = "";
  }, 1600);
}

function render() {
  if (walletConnected) {
    ensureDailySparkGrant(false);
  }

  const round = getActiveRound();
  renderWallet();
  renderHero(round);
  renderRound(round);
  renderMonthlyChart(round);
  renderSentiment(round);
  renderRoundDetails(round);
  renderLeaderboard();
  renderHistory();
  renderProfile();
  populateAdminForm(round);
  renderCountdown(round);
  hideMonthlyChartHover();
  syncPulseHeaderSpot();
}

function renderWallet() {
  if (!walletConnected) {
    els.walletButton.textContent = "Connect Wallet";
    return;
  }

  els.walletButton.textContent = `${shortWallet(DEMO_WALLET)} - ${getUser().sparkBalance} Sparks`;
}

function renderHero(round) {
  const status = effectiveStatus(round);
  const yieldPercent = estimatedAnnualizedYieldPercent();
  els.pulseRoundPill.innerHTML = `
    <span>${round.roundDate}</span>
    <strong>${status.toUpperCase()}</strong>
    <small>HKT trading day</small>
  `;
  els.pulseHeaderMetric.innerHTML = `
    <span>Spot</span>
    <strong>${formatPrice(round.currentPrice)}</strong>
    <small>demo feed</small>
  `;
  els.pulseSpotInline.innerHTML = `
    <span>Spot</span>
    <strong>${formatPrice(round.currentPrice)}</strong>
    <small>demo feed</small>
  `;
  els.heroRewardPool.textContent = walletConnected ? formatSparkAmount(getUser().sparkBalance) : "10 Sparks";
  els.heroMaxWinners.textContent = `${Math.round(yieldPercent)}%`;
}

function renderRound(round) {
  const status = effectiveStatus(round);
  const prediction = walletConnected ? currentWalletPrediction(round) : null;
  const canSubmit = walletConnected && status === "open" && !prediction;
  const canEdit = walletConnected && status === "open" && prediction && Number(prediction.editCount || 0) < 1;
  const canChoose = canSubmit || canEdit;
  const amountValue = prediction && document.activeElement !== els.sparkBetAmount
    ? prediction.amountSparks
    : betAmountFromInput();

  els.roundStatusPill.textContent = status;
  els.pulseQuestionText.textContent = `Will silver close above ${formatPrice(round.openingPrice)} by 10:00 AM HKT?`;
  els.openingPriceValue.textContent = formatPrice(round.openingPrice);
  els.currentPriceValue.textContent = formatPrice(round.currentPrice);
  els.cutoffValue.textContent = "10:00 AM HKT";

  if (els.sparkBetAmount && document.activeElement !== els.sparkBetAmount) {
    els.sparkBetAmount.value = String(amountValue);
  }
  renderBetAmountUi(amountValue);

  const dailyRemaining = remainingDailyBetForWallet(round, DEMO_WALLET, prediction?.id || null);
  if (els.betLimitText) {
    if (!prediction) {
      els.betLimitText.textContent = `${GAME_RULES.minBetSparks} Sparks minimum, ${GAME_RULES.maxDailyBetSparks} Sparks daily max.`;
    } else if (Number(prediction.editCount || 0) < 1) {
      els.betLimitText.textContent = `One edit allowed. New amount can be ${GAME_RULES.minBetSparks}-${dailyRemaining} Sparks.`;
    } else {
      els.betLimitText.textContent = "Edit used. The latest valid guess will settle.";
    }
  }

  [els.predictUpButton, els.predictDownButton].forEach((button) => {
    const selected = prediction && prediction.side === button.dataset.side;
    button.disabled = !canChoose;
    button.classList.toggle("is-selected", Boolean(selected));
  });

  if (!walletConnected) {
    els.userPredictionStatus.innerHTML = `
      <span>Status</span>
      <strong>Connect wallet to enter paper mode</strong>
    `;
    return;
  }

  if (prediction) {
    const editText = canEdit ? "1 edit available" : "edit used";
    els.userPredictionStatus.innerHTML = `
      <span>Latest valid guess</span>
      <strong>${prediction.side} - ${formatSparkAmount(prediction.amountSparks)} - ${prediction.mode === "real" ? "real" : "paper"} - ${editText}</strong>
    `;
    return;
  }

  if (status !== "open") {
    els.userPredictionStatus.innerHTML = `
      <span>Status</span>
      <strong>Trading day is ${status}</strong>
    `;
    return;
  }

  els.userPredictionStatus.innerHTML = `
    <span>Status</span>
    <strong>Choose UP or DOWN during the HKT trading window</strong>
  `;
}

function renderBetAmountUi(amountSparks = betAmountFromInput()) {
  if (els.betAmountDisplay) {
    els.betAmountDisplay.textContent = String(amountSparks);
  }

  document.querySelectorAll("[data-bet-amount]").forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.betAmount) === Number(amountSparks));
  });
}

function renderSentiment(round) {
  const sentiment = sentimentForRound(round);

  els.participantCount.textContent = `${sentiment.total} participant${sentiment.total === 1 ? "" : "s"}`;
  els.sentimentUpBar.style.width = `${sentiment.upPercent}%`;
  els.sentimentDownBar.style.width = `${sentiment.downPercent}%`;
  els.sentimentUpLabel.textContent = `${sentiment.upPercent}% UP`;
  els.sentimentDownLabel.textContent = `${sentiment.downPercent}% DOWN`;
}

function renderMonthlyChart(round) {
  const prices = [...MONTHLY_SILVER_PRICES.slice(0, -1), { label: "Today", value: round.currentPrice }];
  const values = prices.map((point) => point.value);
  const min = Math.min(...values, round.openingPrice) - 1;
  const max = Math.max(...values, round.openingPrice) + 1;
  const width = 720;
  const height = 228;
  const padX = 42;
  const padTop = 24;
  const padBottom = 36;
  const chartHeight = height - padTop - padBottom;
  const step = (width - padX * 2) / (prices.length - 1);
  const yFor = (value) => padTop + (max - value) / (max - min) * chartHeight;
  const points = prices.map((point, index) => `${padX + index * step},${yFor(point.value).toFixed(1)}`).join(" ");
  const areaPoints = `${padX},${height - padBottom} ${points} ${width - padX},${height - padBottom}`;
  const targetY = yFor(round.openingPrice);
  const current = prices[prices.length - 1];
  const currentX = padX + (prices.length - 1) * step;
  const currentY = yFor(current.value);
  const change = current.value - prices[0].value;
  const changeClass = change >= 0 ? "is-up" : "is-down";
  const plottedPrices = prices.map((point, index) => ({
    ...point,
    x: padX + index * step,
    y: yFor(point.value)
  }));

  monthlyChartState = {
    width,
    height,
    padX,
    padTop,
    chartBottom: height - padBottom,
    prices: plottedPrices
  };

  els.monthlySilverChart.innerHTML = `
    <div class="monthly-chart-header">
      <div>
        <span>30D silver chart</span>
        <strong>${formatPrice(round.currentPrice)}</strong>
      </div>
      <div class="${changeClass}">
        ${change >= 0 ? "+" : ""}${change.toFixed(2)}
      </div>
    </div>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Silver spot price over the last month">
      <line class="monthly-grid" x1="${padX}" x2="${width - padX}" y1="${padTop}" y2="${padTop}"></line>
      <line class="monthly-grid" x1="${padX}" x2="${width - padX}" y1="${padTop + chartHeight / 2}" y2="${padTop + chartHeight / 2}"></line>
      <line class="monthly-grid" x1="${padX}" x2="${width - padX}" y1="${height - padBottom}" y2="${height - padBottom}"></line>
      <line class="monthly-target" x1="${padX}" x2="${width - padX}" y1="${targetY.toFixed(1)}" y2="${targetY.toFixed(1)}"></line>
      <polygon class="monthly-area" points="${areaPoints}"></polygon>
      <polyline class="monthly-line" points="${points}"></polyline>
      <circle class="monthly-dot" cx="${currentX}" cy="${currentY.toFixed(1)}" r="5"></circle>
      <text class="monthly-tag" x="${padX}" y="${Math.max(14, targetY - 8).toFixed(1)}">Target ${formatPrice(round.openingPrice)}</text>
      <text class="monthly-price" x="${currentX - 72}" y="${Math.max(16, currentY - 14).toFixed(1)}">${formatPrice(current.value)}</text>
      <text class="monthly-axis" x="${padX}" y="${height - 10}">${prices[0].label}</text>
      <text class="monthly-axis" x="${width / 2 - 24}" y="${height - 10}">May</text>
      <text class="monthly-axis" x="${width - padX - 40}" y="${height - 10}">${current.label}</text>
      <g class="monthly-hover-layer" aria-hidden="true">
        <line class="monthly-crosshair" x1="${currentX}" x2="${currentX}" y1="${padTop}" y2="${height - padBottom}"></line>
        <circle class="monthly-hover-dot" cx="${currentX}" cy="${currentY.toFixed(1)}" r="6"></circle>
      </g>
    </svg>
    <div class="monthly-chart-tooltip" aria-hidden="true">
      <span data-monthly-hover-label>${current.label}</span>
      <strong data-monthly-hover-price>${formatPrice(current.value)}</strong>
    </div>
  `;
}

function updateMonthlyChartHover(event) {
  if (!monthlyChartState) {
    return;
  }

  const svg = els.monthlySilverChart.querySelector("svg");
  const tooltip = els.monthlySilverChart.querySelector(".monthly-chart-tooltip");

  if (!svg || !tooltip) {
    return;
  }

  const svgRect = svg.getBoundingClientRect();
  const chartRect = els.monthlySilverChart.getBoundingClientRect();
  const viewX = Math.min(
    monthlyChartState.width - monthlyChartState.padX,
    Math.max(
      monthlyChartState.padX,
      (event.clientX - svgRect.left) / svgRect.width * monthlyChartState.width
    )
  );
  const point = monthlyChartState.prices.reduce((closest, candidate) => (
    Math.abs(candidate.x - viewX) < Math.abs(closest.x - viewX) ? candidate : closest
  ));
  const cssX = svgRect.left - chartRect.left + point.x / monthlyChartState.width * svgRect.width;
  const cssY = svgRect.top - chartRect.top + point.y / monthlyChartState.height * svgRect.height;
  const tooltipX = chartRect.width > 128 ? Math.min(Math.max(cssX, 64), chartRect.width - 64) : cssX;

  els.monthlySilverChart.classList.add("is-hovering");
  els.monthlySilverChart.querySelector(".monthly-crosshair")?.setAttribute("x1", point.x.toFixed(1));
  els.monthlySilverChart.querySelector(".monthly-crosshair")?.setAttribute("x2", point.x.toFixed(1));
  els.monthlySilverChart.querySelector(".monthly-hover-dot")?.setAttribute("cx", point.x.toFixed(1));
  els.monthlySilverChart.querySelector(".monthly-hover-dot")?.setAttribute("cy", point.y.toFixed(1));
  tooltip.style.left = `${tooltipX}px`;
  tooltip.style.top = `${Math.max(cssY, 44)}px`;
  tooltip.querySelector("[data-monthly-hover-label]").textContent = point.label;
  tooltip.querySelector("[data-monthly-hover-price]").textContent = formatPrice(point.value);
}

function hideMonthlyChartHover() {
  els.monthlySilverChart.classList.remove("is-hovering");
}

function syncPulseHeaderSpot() {
  const topbar = document.querySelector(".topbar");

  if (!topbar || !els.pulseSpotInline) {
    return;
  }

  const inlineTop = els.pulseSpotInline.getBoundingClientRect().top;
  const isStuck = window.scrollY > 160 && inlineTop <= 92;
  topbar.classList.toggle("has-spot", isStuck);
  document.body.classList.toggle("market-stuck", isStuck);
}

function renderRoundDetails(round) {
  const scorePreview = scorePreviewForWallet(round);
  const bonusPreview = selectedBonusPreview(scorePreview);

  els.roundDetailStats.innerHTML = `
    <div class="stat">
      <span class="metric-label">Session</span>
      <strong class="metric-value">${formatHkDateTime(round.startTime)} - ${formatHkDateTime(round.predictionCutoffTime)}</strong>
    </div>
    <div class="stat">
      <span class="metric-label">Resolve</span>
      <strong class="metric-value"><a class="text-link" href="https://www.lbma.org.uk/prices-and-data/precious-metal-prices" target="_blank" rel="noreferrer">LBMA silver price</a></strong>
    </div>
  `;

  document.querySelector("#potentialScoreValue").textContent = `${scorePreview.sparkProfit} Sparks`;
  document.querySelector("#basePointValue").textContent = formatSparkAmount(scorePreview.amountSparks);
  document.querySelector("#bonusLabelValue").textContent = bonusPreview.label;
  document.querySelector("#bonusMultiplierValue").textContent = formatMultiplier(bonusPreview.multiplier);
  document.querySelector("#bonusMetaValue").textContent = bonusPreview.meta;
}

function leaderboardWeeks(state = pulseState) {
  const groups = new Map();
  const settledRounds = state.rounds
    .filter((round) => round.status === "settled")
    .sort((first, second) => second.roundDate.localeCompare(first.roundDate));

  settledRounds.forEach((round) => {
    const key = weekKeyForDateKey(round.roundDate);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: weekLabel(key),
        rounds: []
      });
    }
    groups.get(key).rounds.push(round);
  });

  return Array.from(groups.values()).sort((first, second) => second.key.localeCompare(first.key));
}

function weekKeyForDateKey(dateKey) {
  const date = dateFromDateKey(dateKey);
  const day = date.getDay();
  const daysFromMonday = day === 0 ? 6 : day - 1;
  return localDateKey(addDays(date, -daysFromMonday));
}

function weekLabel(weekKey) {
  const start = dateFromDateKey(weekKey);
  const end = addDays(start, 4);
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function renderLeaderboard() {
  const rows = allTimeLeaderboardRows();

  els.leaderboardWeekSelect.innerHTML = `<option value="all-time">All time</option>`;
  els.leaderboardWeekSelect.disabled = true;

  if (!rows.length) {
    els.leaderboardSummary.textContent = "No settled Spark totals yet.";
    els.leaderboardWeekSelect.disabled = true;
    els.leaderboardPanel.innerHTML = `<div class="empty-state">All-time Spark totals will appear after the first settled winner.</div>`;
    return;
  }

  els.leaderboardSummary.textContent = `${rows.length} wallet${rows.length === 1 ? "" : "s"} ranked by all-time Sparks.`;

  els.leaderboardPanel.innerHTML = `
    <div class="pulse-table all-time-leaderboard-table">
      <div class="pulse-table-row pulse-table-head">
        <span>Rank</span>
        <span>User</span>
        <span>Total Sparks</span>
        <span>Wins</span>
        <span>Best Multiplier</span>
        <span>Latest Win</span>
        <span>Avg Bet</span>
      </div>
      ${rows.map((row) => renderAllTimeLeaderboardRow(row)).join("")}
    </div>
  `;
}

function allTimeLeaderboardRows() {
  const byWallet = new Map();
  const roundsById = new Map(pulseState.rounds.map((round) => [round.id, round]));
  const predictionsByKey = new Map(
    pulseState.predictions.map((prediction) => [`${prediction.roundId}-${prediction.wallet}`, prediction])
  );

  pulseState.rewards.forEach((reward) => {
    const round = roundsById.get(reward.roundId);
    if (!round || round.status !== "settled") {
      return;
    }

    const prediction = predictionsByKey.get(`${reward.roundId}-${reward.wallet}`);
    const existing = byWallet.get(reward.wallet) || {
      wallet: reward.wallet,
      totalSparks: 0,
      wins: 0,
      totalBet: 0,
      bestMultiplier: 1,
      latestWin: ""
    };

    existing.totalSparks += Number(reward.sparkProfit || 0);
    existing.wins += 1;
    existing.totalBet += Number(prediction?.amountSparks || 0);
    existing.bestMultiplier = Math.max(existing.bestMultiplier, Number(reward.finalMultiplier || 1));
    existing.latestWin = !existing.latestWin || round.roundDate > existing.latestWin ? round.roundDate : existing.latestWin;
    byWallet.set(reward.wallet, existing);
  });

  return Array.from(byWallet.values())
    .map((row) => ({
      ...row,
      averageBet: row.wins ? Math.round(row.totalBet / row.wins) : 0
    }))
    .sort((a, b) => {
      if (b.totalSparks !== a.totalSparks) {
        return b.totalSparks - a.totalSparks;
      }

      if (b.wins !== a.wins) {
        return b.wins - a.wins;
      }

      return a.wallet.localeCompare(b.wallet);
    })
    .map((row, index) => ({ ...row, rank: index + 1 }));
}

function renderAllTimeLeaderboardRow(row) {
  return `
    <div class="pulse-table-row is-winner">
      <span>#${row.rank}</span>
      <span>${shortWallet(row.wallet)}</span>
      <span>${formatSparkAmount(row.totalSparks)}</span>
      <span>${row.wins}</span>
      <span>${formatMultiplier(row.bestMultiplier)}</span>
      <span>${row.latestWin || "-"}</span>
      <span>${formatSparkAmount(row.averageBet)}</span>
    </div>
  `;
}

function leaderboardRows(round) {
  const predictions = predictionsForRound(round.id);
  const rewards = rewardsForRound(round.id);
  const rewardByWallet = new Map(rewards.map((reward) => [reward.wallet, reward]));
  const correct = predictions.filter((prediction) => prediction.side === round.winningSide);
  const correctRank = new Map(
    correct
      .map((prediction) => ({
        prediction,
        score: calculateScore(prediction, round)
      }))
      .sort(compareScoredPredictions)
      .map((entry, index) => [entry.prediction.wallet, index + 1])
  );

  return predictions
    .map((prediction) => {
      const reward = rewardByWallet.get(prediction.wallet) || null;
      const isCorrect = prediction.side === round.winningSide;
      const rank = isCorrect ? correctRank.get(prediction.wallet) : null;
      const score = isCorrect ? calculateScore(prediction, round) : 0;
      let resultLabel = "Incorrect";
      let rewardLabel = "No Spark profit";

      if (round.winningSide === "FLAT") {
        resultLabel = "Flat round";
        rewardLabel = "Stake returned";
      } else if (isCorrect && reward) {
        resultLabel = "Correct";
      } else if (isCorrect) {
        resultLabel = "Correct";
        rewardLabel = "Pending settlement";
      }

      return {
        prediction,
        reward,
        rank,
        score,
        resultLabel,
        rewardLabel
      };
    })
    .sort((a, b) => {
      if (a.rank && b.rank) {
        return a.rank - b.rank;
      }

      if (a.rank) {
        return -1;
      }

      if (b.rank) {
        return 1;
      }

      return new Date(a.prediction.createdAt) - new Date(b.prediction.createdAt);
    });
}

function compareScoredPredictions(a, b) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  const timeDiff = new Date(a.prediction.createdAt) - new Date(b.prediction.createdAt);
  if (timeDiff !== 0) {
    return timeDiff;
  }

  return a.prediction.wallet.localeCompare(b.prediction.wallet);
}

function calculateScore(prediction, round) {
  if (!round || prediction.side !== round.winningSide || round.winningSide === "FLAT") {
    return 0;
  }

  return calculatePredictionOutcome(prediction, round).sparkProfit;
}

function calculatePredictionOutcome(prediction, round) {
  const priorWinStreak = prediction.priorWinStreak ?? calculatePriorWinStreak(prediction.wallet, round.roundDate);
  const streakMultiplier = streakMultiplierForPriorWins(priorWinStreak);
  const stakingMultiplier = Number(prediction.stakingMultiplier || 1);
  const finalMultiplier = Math.max(stakingMultiplier, streakMultiplier);
  const sparkProfit = Math.round(Number(prediction.amountSparks || 0) * finalMultiplier);

  return {
    priorWinStreak,
    streakMultiplier,
    stakingMultiplier,
    finalMultiplier,
    returnedStake: Number(prediction.amountSparks || 0),
    sparkProfit
  };
}

function streakMultiplierForPriorWins(priorWinStreak) {
  const rule = GAME_RULES.streakMultipliers.find((item) => priorWinStreak >= item.priorWins);
  return rule ? rule.multiplier : 1;
}

function scorePreviewForWallet(round) {
  const prediction = currentWalletPrediction(round);
  const amountSparks = prediction ? prediction.amountSparks : betAmountFromInput();
  const priorWinStreak = prediction?.priorWinStreak ?? (walletConnected ? calculatePriorWinStreak(DEMO_WALLET, round.roundDate) : 0);
  const streakMultiplier = streakMultiplierForPriorWins(priorWinStreak);
  const stakingMultiplier = isUserStaked() ? GAME_RULES.stakeWinMultiplier : 1;
  const finalMultiplier = Math.max(stakingMultiplier, streakMultiplier);

  return {
    amountSparks,
    priorWinStreak,
    streakMultiplier,
    stakingMultiplier,
    finalMultiplier,
    sparkProfit: Math.round(amountSparks * finalMultiplier)
  };
}

function selectedBonusPreview(scorePreview) {
  const useStreakBonus = scorePreview.streakMultiplier >= scorePreview.stakingMultiplier;
  const multiplier = useStreakBonus ? scorePreview.streakMultiplier : scorePreview.stakingMultiplier;
  const isMax = multiplier >= GAME_RULES.stakeWinMultiplier;

  return {
    label: useStreakBonus ? "Streak bonus" : "Stake bonus",
    multiplier,
    meta: isMax
      ? "MAX"
      : `${scorePreview.priorWinStreak} prior win${scorePreview.priorWinStreak === 1 ? "" : "s"}`
  };
}

function calculatePriorWinStreak(wallet, beforeRoundDate) {
  const priorRounds = pulseState.rounds
    .filter((round) => round.roundDate < beforeRoundDate && round.status === "settled")
    .sort((a, b) => b.roundDate.localeCompare(a.roundDate));
  let streak = 0;

  for (const round of priorRounds) {
    const prediction = pulseState.predictions.find((item) => item.roundId === round.id && item.wallet === wallet);
    if (!prediction || prediction.side !== round.winningSide || round.winningSide === "FLAT") {
      break;
    }

    streak += 1;
  }

  return streak;
}

function renderHistory() {
  const rounds = [...pulseState.rounds].sort((a, b) => b.roundDate.localeCompare(a.roundDate));
  els.roundHistoryPanel.innerHTML = `
    <div class="pulse-table">
      <div class="pulse-table-row pulse-table-head">
        <span>Date</span>
        <span>Status</span>
        <span>Open</span>
        <span>Close</span>
        <span>Winning Side</span>
        <span>Payouts</span>
        <span>Session</span>
      </div>
      ${rounds.map((round) => {
        const payoutCount = rewardsForRound(round.id).length;
        return `
          <div class="pulse-table-row">
            <span>${round.roundDate}</span>
            <span>${effectiveStatus(round)}</span>
            <span>${formatPrice(round.openingPrice)}</span>
            <span>${formatPrice(round.closingPrice)}</span>
            <span>${round.winningSide || "-"}</span>
            <span>${payoutCount} Spark payout${payoutCount === 1 ? "" : "s"}</span>
            <span>12 PM-10 AM HKT</span>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderProfile() {
  if (!walletConnected) {
    els.profilePanel.innerHTML = `<div class="empty-state">Connect wallet to view Sparks, staking, missions, and local guess history.</div>`;
    return;
  }

  const user = getUser();
  const predictions = pulseState.predictions
    .filter((prediction) => prediction.wallet === DEMO_WALLET)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const missions = missionStatus();

  els.profilePanel.innerHTML = `
    <div class="profile-economy">
      <div class="profile-card">
        <span class="metric-label">Spark Balance</span>
        <strong>${formatSparkAmount(user.sparkBalance)}</strong>
        <small>${user.sparkBalance > GAME_RULES.freeSparkCap ? "Daily free Sparks paused above 100." : `Next eligible daily reward: ${GAME_RULES.dailySparks} Sparks.`}</small>
      </div>
      <div class="profile-card">
        <span class="metric-label">Mode</span>
        <strong>${currentModeLabel()}</strong>
        <small>${stakeStatusText()}</small>
        <div class="profile-actions">
          ${stakeActionButton()}
        </div>
      </div>
      <div class="profile-card">
        <span class="metric-label">Redeem</span>
        <strong>${GAME_RULES.sparksPerUsdt.toLocaleString("en-US")} Sparks = 1 USDT</strong>
        <small>${isUserStaked() ? "Trading Mode wallets can redeem Sparks." : "Stake 1 STT to unlock redemption."}</small>
        <div class="profile-actions">
          <button class="ghost-button compact" type="button" data-profile-action="redeem">Redeem 1 USDT</button>
        </div>
      </div>
    </div>

    <div class="mission-grid">
      ${renderMissionCard("streak", "01", "5-Day Guess", `Submit guesses for 5 consecutive trading days in the same Monday-Friday week.`, missions.fiveDayWeek, GAME_RULES.missionRewards.fiveDayWeek)}
      ${renderMissionCard("win", "02", "First Daily Win", "Score your first winning guess of a day.", missions.firstWinningGuess, GAME_RULES.missionRewards.firstWinningGuess)}
      ${renderMissionCard("stake", "03", "Stake STT", "Stake 1 STT for at least one week to unlock Trading Mode.", missions.stakeStt, GAME_RULES.missionRewards.stakeStt)}
    </div>

    ${predictions.length ? `
      <div class="pulse-table profile-history-table">
        <div class="pulse-table-row pulse-table-head">
          <span>Round</span>
          <span>Guess</span>
          <span>Bet</span>
          <span>Mode</span>
          <span>Result</span>
          <span>Net Sparks</span>
          <span>History</span>
        </div>
        ${predictions.map((prediction) => renderProfileRow(prediction)).join("")}
      </div>
    ` : `<div class="empty-state">No guesses from ${shortWallet(DEMO_WALLET)} yet.</div>`}
  `;
}

function renderMissionCard(type, step, title, body, complete, reward) {
  return `
    <div class="mission-card mission-${type} ${complete ? "is-complete" : ""}">
      <div class="mission-head">
        <span>${step}</span>
        <small>${complete ? "Complete" : "Open"}</small>
      </div>
      <strong>${title}</strong>
      <p>${body}</p>
      <div class="mission-reward">
        <span>Reward</span>
        <strong>${formatSparkAmount(reward)}</strong>
      </div>
    </div>
  `;
}

function stakeStatusText() {
  if (!isUserStaked()) {
    return `Unlock ${formatMultiplier(GAME_RULES.stakeWinMultiplier)} wins and estimated ${Math.round(estimatedAnnualizedYieldPercent())}% annualized Spark earning yield.`;
  }

  const unlockAt = stakeUnlockTime();
  if (unlockAt && Date.now() < new Date(unlockAt).getTime()) {
    return `Locked until ${formatHkDateTime(unlockAt)} HKT.`;
  }

  return "Stake unlocked. You can unstake anytime.";
}

function stakeActionButton() {
  if (!isUserStaked()) {
    return `<button class="primary-button compact" type="button" data-profile-action="stake">Stake 1 STT</button>`;
  }

  const unlockAt = stakeUnlockTime();
  const disabled = unlockAt && Date.now() < new Date(unlockAt).getTime();
  return `<button class="ghost-button compact" type="button" data-profile-action="unstake"${disabled ? " disabled" : ""}>Unstake STT</button>`;
}

function renderProfileRow(prediction) {
  const round = pulseState.rounds.find((item) => item.id === prediction.roundId);
  const reward = pulseState.rewards.find((item) => item.roundId === prediction.roundId && item.wallet === DEMO_WALLET);
  const settled = round && round.status === "settled";
  const correct = settled && prediction.side === round.winningSide && round.winningSide !== "FLAT";
  const result = !settled ? "Pending" : correct ? "Correct" : round.winningSide === "FLAT" ? "Flat" : "Incorrect";
  const netText = reward
    ? `+${formatSparkAmount(reward.sparkProfit)}`
    : settled && round.winningSide === "FLAT"
      ? `+${formatSparkAmount(prediction.amountSparks)} returned`
      : settled
        ? `-${formatSparkAmount(prediction.amountSparks)}`
        : "Pending";

  return `
    <div class="pulse-table-row">
      <span>${round ? round.roundDate : prediction.roundId}</span>
      <span>${prediction.side}</span>
      <span>${formatSparkAmount(prediction.amountSparks)}</span>
      <span>${prediction.mode === "real" ? "Real" : "Paper"}</span>
      <span>${result}</span>
      <span>${netText}</span>
      <span>${formatPredictionHistory(prediction)}</span>
    </div>
  `;
}

function formatPredictionHistory(prediction) {
  const history = Array.isArray(prediction.history) ? prediction.history : [];
  if (!history.length) {
    return formatDateTime(prediction.createdAt);
  }

  return history
    .map((item) => `${item.action === "edited" ? "Edited" : "Submitted"} ${item.side}/${item.amountSparks}`)
    .join("; ");
}

function missionStatus() {
  const user = getUser();
  return {
    fiveDayWeek: user.missions.fiveDayWeeks.length > 0,
    firstWinningGuess: user.missions.firstWinRewarded,
    stakeStt: user.missions.stakeRewarded
  };
}

function populateAdminForm(round) {
  els.adminOpeningPrice.value = round.openingPrice ?? "";
  els.adminCurrentPrice.value = round.currentPrice ?? "";
  els.adminClosingPrice.value = round.closingPrice ?? "";
  els.adminRewardPool.value = (round.rewardPoolCents / 100).toFixed(2);
  els.adminMaxWinners.value = round.maxWinners || "";
  els.adminStatus.value = round.status;
  els.adminSparkBalance.value = getUser().sparkBalance;
  els.adminOverride.value = round.resultOverride || "";
  els.adminCutoffTime.value = toDatetimeLocalValue(round.predictionCutoffTime);
  els.adminSettlementTime.value = toDatetimeLocalValue(round.settlementTime);
}

function saveRoundFromAdmin(showSavedToast = true) {
  const round = getActiveRound();
  const user = getUser();
  const nextSparkBalance = Math.max(0, Math.floor(Number(els.adminSparkBalance.value || user.sparkBalance)));
  const sparkBalanceDelta = nextSparkBalance - user.sparkBalance;

  round.openingPrice = Number(els.adminOpeningPrice.value);
  round.currentPrice = Number(els.adminCurrentPrice.value);
  round.closingPrice = els.adminClosingPrice.value ? Number(els.adminClosingPrice.value) : null;
  round.rewardPoolCents = Math.round(Number(els.adminRewardPool.value || 0) * 100);
  round.maxWinners = Math.max(0, Math.floor(Number(els.adminMaxWinners.value || 0)));
  round.status = els.adminStatus.value;
  round.resultOverride = els.adminOverride.value;
  round.predictionCutoffTime = fromDatetimeLocalValue(els.adminCutoffTime.value) || round.predictionCutoffTime;
  round.settlementTime = fromDatetimeLocalValue(els.adminSettlementTime.value) || round.settlementTime;
  round.updatedAt = new Date().toISOString();

  if (sparkBalanceDelta !== 0) {
    applySparkChange(sparkBalanceDelta, "admin-adjust", "Admin Spark balance adjustment", round.id);
  }

  saveState();
  render();

  if (showSavedToast) {
    showToast(sparkBalanceDelta !== 0 ? `Round saved. Spark balance set to ${nextSparkBalance}.` : "Round settings saved.");
  }
}

function betAmountFromInput() {
  return clampInteger(els.sparkBetAmount?.value || GAME_RULES.minBetSparks, GAME_RULES.minBetSparks, GAME_RULES.maxDailyBetSparks);
}

function setBetAmount(amountSparks) {
  const amount = clampInteger(amountSparks, GAME_RULES.minBetSparks, GAME_RULES.maxDailyBetSparks);
  if (els.sparkBetAmount) {
    els.sparkBetAmount.value = String(amount);
  }
  renderBetAmountUi(amount);
  renderRoundDetails(getActiveRound());
}

function submitPrediction(side) {
  const round = getActiveRound();
  const status = effectiveStatus(round);
  const existingPrediction = currentWalletPrediction(round);
  const amountSparks = betAmountFromInput();
  const remaining = remainingDailyBetForWallet(round, DEMO_WALLET, existingPrediction?.id || null);

  if (!walletConnected) {
    showToast("Connect the wallet first.");
    return;
  }

  if (!["UP", "DOWN"].includes(side)) {
    showToast("Choose UP or DOWN.");
    return;
  }

  if (status !== "open") {
    showToast(`Guessing is closed because the trading day is ${status}.`);
    return;
  }

  if (amountSparks < GAME_RULES.minBetSparks || amountSparks > GAME_RULES.maxDailyBetSparks) {
    showToast(`Enter ${GAME_RULES.minBetSparks}-${GAME_RULES.maxDailyBetSparks} Sparks.`);
    return;
  }

  if (amountSparks > remaining) {
    showToast(`Daily max is ${GAME_RULES.maxDailyBetSparks} Sparks.`);
    return;
  }

  if (existingPrediction) {
    if (Number(existingPrediction.editCount || 0) >= 1) {
      showToast("You already used today's edit.");
      return;
    }

    const difference = amountSparks - Number(existingPrediction.amountSparks || 0);
    if (difference > 0 && getUser().sparkBalance < difference) {
      showToast("Not enough Sparks to increase this guess.");
      return;
    }

    openGuessConfirmation({
      mode: "edit",
      roundId: round.id,
      side,
      amountSparks
    });
    return;
  }

  if (getUser().sparkBalance < amountSparks) {
    showToast("Not enough Sparks for this guess.");
    return;
  }

  openGuessConfirmation({
    mode: "submit",
    roundId: round.id,
    side,
    amountSparks
  });
}

function openGuessConfirmation(intent) {
  pendingGuess = intent;

  els.guessConfirmText.textContent = intent.mode === "edit"
    ? `Are you sure you want to change your guess to "${intent.side}" with ${intent.amountSparks} Sparks?`
    : `Are you sure you want to bet ${intent.amountSparks} Sparks on "${intent.side}"?`;
  els.guessConfirmMode.textContent = currentModeLabel();
  els.guessConfirmModeMeta.textContent = currentModeMeta();
  els.guessConfirmModal.classList.add("is-visible");
  els.guessConfirmModal.setAttribute("aria-hidden", "false");
  els.confirmGuessButton.focus();
}

function closeGuessConfirmation() {
  pendingGuess = null;
  els.guessConfirmModal.classList.remove("is-visible");
  els.guessConfirmModal.setAttribute("aria-hidden", "true");
}

function confirmPendingGuess() {
  if (!pendingGuess) {
    return;
  }

  const round = pulseState.rounds.find((item) => item.id === pendingGuess.roundId);
  if (!round || effectiveStatus(round) !== "open") {
    closeGuessConfirmation();
    showToast("Guessing is no longer open.");
    return;
  }

  const existingPrediction = currentWalletPrediction(round);
  const intent = pendingGuess;
  closeGuessConfirmation();

  if (intent.mode === "edit" && existingPrediction) {
    editPrediction(existingPrediction, round, intent.side, intent.amountSparks);
    return;
  }

  if (intent.mode === "submit" && !existingPrediction) {
    commitNewPrediction(round, intent.side, intent.amountSparks);
    return;
  }

  showToast("This guess has already changed. Review it and try again.");
}

function commitNewPrediction(round, side, amountSparks) {
  const now = new Date().toISOString();
  applySparkChange(-amountSparks, "bet", `Daily guess: ${side}`, round.id);
  pulseState.predictions.push({
    id: `PR-${round.id}-${DEMO_WALLET.slice(-6)}-${Date.now()}`,
    roundId: round.id,
    wallet: DEMO_WALLET,
    side,
    amountSparks,
    mode: isUserStaked() ? "real" : "paper",
    stakingMultiplier: isUserStaked() ? GAME_RULES.stakeWinMultiplier : 1,
    createdAt: now,
    updatedAt: now,
    editCount: 0,
    history: [{
      action: "submitted",
      side,
      amountSparks,
      mode: isUserStaked() ? "real" : "paper",
      createdAt: now
    }],
    priorWinStreak: calculatePriorWinStreak(DEMO_WALLET, round.roundDate),
    score: null,
    result: null
  });

  awardFiveDayMissionIfEarned();
  saveState();
  launchPredictionCelebration(side, side === "UP" ? els.predictUpButton : els.predictDownButton);
  render();
  showToast(`Guess submitted: ${side} for ${amountSparks} Sparks.`);
}

function editPrediction(prediction, round, side, amountSparks) {
  if (Number(prediction.editCount || 0) >= 1) {
    showToast("You already used today's edit.");
    return;
  }

  const difference = amountSparks - Number(prediction.amountSparks || 0);
  if (difference > 0 && getUser().sparkBalance < difference) {
    showToast("Not enough Sparks to increase this guess.");
    return;
  }

  if (difference !== 0) {
    applySparkChange(-difference, difference > 0 ? "bet-increase" : "bet-refund", difference > 0 ? "Increased daily guess" : "Reduced daily guess", round.id);
  }

  const now = new Date().toISOString();
  prediction.side = side;
  prediction.amountSparks = amountSparks;
  prediction.mode = isUserStaked() ? "real" : "paper";
  prediction.stakingMultiplier = isUserStaked() ? GAME_RULES.stakeWinMultiplier : 1;
  prediction.editCount = Number(prediction.editCount || 0) + 1;
  prediction.updatedAt = now;
  prediction.history = [
    ...(Array.isArray(prediction.history) ? prediction.history : []),
    {
      action: "edited",
      side,
      amountSparks,
      mode: prediction.mode,
      createdAt: now
    }
  ];

  saveState();
  launchPredictionCelebration(side, side === "UP" ? els.predictUpButton : els.predictDownButton);
  render();
  showToast(`Guess updated: ${side} for ${amountSparks} Sparks.`);
}

function settleActiveRound() {
  saveRoundFromAdmin(false);
  const round = getActiveRound();

  if (!round.closingPrice && round.closingPrice !== 0) {
    showToast("Enter a closing reference price before settlement.");
    return;
  }

  const winningSide = determineWinningSide(round);
  const roundPredictions = predictionsForRound(round.id);
  const correctPredictions = winningSide === "FLAT"
    ? []
    : roundPredictions
      .filter((prediction) => prediction.side === winningSide)
      .map((prediction) => ({
        prediction,
        score: calculateScoreWithSide(prediction, round, winningSide)
      }))
      .sort(compareScoredPredictions);
  const rewards = createRewards(round, correctPredictions);

  round.winningSide = winningSide;
  round.status = "settled";
  round.settledAt = new Date().toISOString();
  round.updatedAt = new Date().toISOString();

  pulseState.predictions = pulseState.predictions.map((prediction) => {
    if (prediction.roundId !== round.id) {
      return prediction;
    }

    const isCorrect = winningSide !== "FLAT" && prediction.side === winningSide;
    const isFlat = winningSide === "FLAT";
    return {
      ...prediction,
      result: isCorrect ? "correct" : isFlat ? "flat" : "incorrect",
      score: isCorrect ? calculateScoreWithSide(prediction, round, winningSide) : 0
    };
  });
  pulseState.rewards = [
    ...pulseState.rewards.filter((reward) => reward.roundId !== round.id),
    ...rewards
  ];

  settleWalletSparkLedger(round, winningSide);
  saveState();
  render();
  showToast(rewards.length ? `${rewards.length} Spark payout record(s) created.` : "Trading day settled with no winners.");
}

function settleWalletSparkLedger(round, winningSide) {
  const prediction = pulseState.predictions.find((item) => item.roundId === round.id && item.wallet === DEMO_WALLET);

  if (!prediction || prediction.settledLedgerApplied) {
    return;
  }

  if (winningSide === "FLAT") {
    applySparkChange(prediction.amountSparks, "flat-refund", "Flat round stake returned", round.id);
    prediction.settledLedgerApplied = true;
    return;
  }

  if (prediction.side !== winningSide) {
    prediction.settledLedgerApplied = true;
    return;
  }

  const outcome = calculatePredictionOutcome(prediction, round);
  applySparkChange(outcome.returnedStake + outcome.sparkProfit, "win", `Winning guess payout at ${formatMultiplier(outcome.finalMultiplier)}`, round.id);
  prediction.settledLedgerApplied = true;

  if (!getUser().missions.firstWinRewarded) {
    getUser().missions.firstWinRewarded = true;
    applySparkChange(GAME_RULES.missionRewards.firstWinningGuess, "mission", "Mission: first winning guess of the day", round.id);
  }
}

function calculateScoreWithSide(prediction, round, winningSide) {
  const tempRound = { ...round, winningSide };
  return calculateScore(prediction, tempRound);
}

function determineWinningSide(round) {
  if (round.resultOverride) {
    return round.resultOverride;
  }

  if (Number(round.closingPrice) > Number(round.openingPrice)) {
    return "UP";
  }

  if (Number(round.closingPrice) < Number(round.openingPrice)) {
    return "DOWN";
  }

  return "FLAT";
}

function createRewards(round, winners) {
  if (!winners.length) {
    return [];
  }

  return winners.map((entry, index) => {
    const outcome = calculatePredictionOutcome(entry.prediction, round);
    return {
      id: `RW-${round.id}-${entry.prediction.wallet.slice(-6)}-${Date.now()}-${index}`,
      roundId: round.id,
      wallet: entry.prediction.wallet,
      rank: index + 1,
      sparkProfit: outcome.sparkProfit,
      returnedStake: outcome.returnedStake,
      finalMultiplier: outcome.finalMultiplier,
      status: "settled",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
}

function markActiveRewards(status) {
  const round = getActiveRound();
  let changed = 0;

  pulseState.rewards = pulseState.rewards.map((reward) => {
    if (reward.roundId !== round.id) {
      return reward;
    }

    changed += 1;
    return {
      ...reward,
      status,
      updatedAt: new Date().toISOString()
    };
  });

  saveState();
  render();
  showToast(changed ? `${changed} reward(s) marked ${status}.` : "No rewards for the active round.");
}

function awardFiveDayMissionIfEarned() {
  const user = getUser();
  const userRoundDates = new Set(
    pulseState.predictions
      .filter((prediction) => prediction.wallet === DEMO_WALLET)
      .map((prediction) => pulseState.rounds.find((round) => round.id === prediction.roundId)?.roundDate)
      .filter(Boolean)
  );
  const weekKeys = new Set(Array.from(userRoundDates).map(weekKeyForDateKey));

  for (const weekKey of weekKeys) {
    if (user.missions.fiveDayWeeks.includes(weekKey)) {
      continue;
    }

    const days = Array.from({ length: 5 }, (_, index) => addDateKey(weekKey, index));
    const completed = days.every((dateKey) => userRoundDates.has(dateKey));
    if (completed) {
      user.missions.fiveDayWeeks.push(weekKey);
      applySparkChange(GAME_RULES.missionRewards.fiveDayWeek, "mission", "Mission: 5 consecutive trading-day guesses", null);
    }
  }
}

function stakeStt() {
  if (!walletConnected) {
    showToast("Connect the wallet first.");
    return;
  }

  if (isUserStaked()) {
    showToast("1 STT is already staked.");
    return;
  }

  const now = new Date();
  const unlockAt = new Date(now.getTime() + GAME_RULES.stakeLockDays * 86400000);
  const user = getUser();
  user.stake = {
    active: true,
    amountStt: GAME_RULES.sttStakeAmount,
    stakedAt: now.toISOString(),
    unlockAt: unlockAt.toISOString()
  };

  if (!user.missions.stakeRewarded) {
    user.missions.stakeRewarded = true;
    applySparkChange(GAME_RULES.missionRewards.stakeStt, "mission", "Mission: stake 1 STT", null);
  }

  saveState();
  render();
  showToast("1 STT staked. Trading Mode unlocked.");
}

function unstakeStt() {
  const user = getUser();

  if (!isUserStaked()) {
    showToast("No active STT stake.");
    return;
  }

  if (new Date(user.stake.unlockAt).getTime() > Date.now()) {
    showToast("Stake is locked for one week.");
    return;
  }

  user.stake = {
    ...user.stake,
    active: false,
    unstakedAt: new Date().toISOString()
  };
  saveState();
  render();
  showToast("STT unstaked. Paper Mode active.");
}

function redeemSparks() {
  const user = getUser();

  if (!isUserStaked()) {
    showToast("Stake 1 STT to unlock redemption.");
    return;
  }

  if (user.sparkBalance < GAME_RULES.sparksPerUsdt) {
    showToast(`You need ${GAME_RULES.sparksPerUsdt.toLocaleString("en-US")} Sparks to redeem 1 USDT.`);
    return;
  }

  applySparkChange(-GAME_RULES.sparksPerUsdt, "redeem", "Redeemed 1 USDT demo record", null);
  user.redemptions.push({
    id: `RD-${Date.now()}`,
    amountSparks: GAME_RULES.sparksPerUsdt,
    amountUsdt: 1,
    status: "demo-pending",
    createdAt: new Date().toISOString()
  });
  saveState();
  render();
  showToast("Redemption record created: 1 USDT.");
}

function estimatedAnnualizedYieldPercent() {
  const dailyBonusSparks = GAME_RULES.maxDailyBetSparks * 0.25;
  const dailyBonusUsdt = dailyBonusSparks / GAME_RULES.sparksPerUsdt;
  const annualValueUsdt = dailyBonusUsdt * GAME_RULES.tradingDaysPerYear;
  return annualValueUsdt / GAME_RULES.sttReferenceUsdt * 100;
}

function renderCountdown(round) {
  const status = effectiveStatus(round);
  const target = status === "upcoming" ? new Date(round.startTime) : new Date(round.predictionCutoffTime);
  const remaining = target.getTime() - Date.now();

  if (status === "settled") {
    els.countdownValue.textContent = "Settled";
    return;
  }

  if (status === "cancelled") {
    els.countdownValue.textContent = "Cancelled";
    return;
  }

  if (remaining <= 0) {
    els.countdownValue.textContent = status === "locked" ? "Locked" : "Cutoff reached";
    return;
  }

  els.countdownValue.textContent = formatDuration(remaining);
  renderRoundDetails(round);
}

function handleProfileAction(event) {
  const action = event.target.closest("[data-profile-action]")?.dataset.profileAction;
  if (!action) {
    return;
  }

  if (action === "stake") {
    stakeStt();
  } else if (action === "unstake") {
    unstakeStt();
  } else if (action === "redeem") {
    redeemSparks();
  }
}

function wireEvents() {
  els.walletButton.addEventListener("click", () => {
    walletConnected = !walletConnected;
    localStorage.setItem(PULSE_WALLET_KEY, String(walletConnected));
    if (walletConnected) {
      ensureDailySparkGrant(true);
    }
    render();
    showToast(walletConnected ? "Wallet connected. Paper Mode active." : "Wallet disconnected.");
  });

  els.predictUpButton.addEventListener("click", () => submitPrediction("UP"));
  els.predictDownButton.addEventListener("click", () => submitPrediction("DOWN"));

  if (els.sparkBetAmount) {
    els.sparkBetAmount.addEventListener("input", () => {
      const amount = betAmountFromInput();
      renderBetAmountUi(amount);
      renderRoundDetails(getActiveRound());
    });
  }

  document.querySelectorAll("[data-bet-adjust]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextAmount = betAmountFromInput() + Number(button.dataset.betAdjust || 0);
      setBetAmount(nextAmount);
    });
  });

  document.querySelectorAll("[data-bet-amount]").forEach((button) => {
    button.addEventListener("click", () => setBetAmount(Number(button.dataset.betAmount)));
  });

  els.adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRoundFromAdmin(true);
  });

  els.settlePulseButton.addEventListener("click", settleActiveRound);
  els.markRewardsApprovedButton.addEventListener("click", () => markActiveRewards("approved"));
  els.markRewardsPaidButton.addEventListener("click", () => markActiveRewards("paid"));
  els.leaderboardWeekSelect.addEventListener("change", () => {
    selectedLeaderboardWeekKey = els.leaderboardWeekSelect.value;
    renderLeaderboard();
  });
  els.cancelGuessButton.addEventListener("click", closeGuessConfirmation);
  els.confirmGuessButton.addEventListener("click", confirmPendingGuess);
  els.guessConfirmModal.addEventListener("click", (event) => {
    if (event.target === els.guessConfirmModal) {
      closeGuessConfirmation();
    }
  });
  els.profilePanel.addEventListener("click", handleProfileAction);
  els.monthlySilverChart.addEventListener("pointermove", updateMonthlyChartHover);
  els.monthlySilverChart.addEventListener("pointerleave", hideMonthlyChartHover);
  els.monthlySilverChart.addEventListener("mousemove", updateMonthlyChartHover);
  els.monthlySilverChart.addEventListener("mouseleave", hideMonthlyChartHover);
  els.monthlySilverChart.addEventListener("click", updateMonthlyChartHover);

  els.resetPulseButton.addEventListener("click", () => {
    localStorage.removeItem(PULSE_STORAGE_KEY);
    pulseState = createDefaultState();
    saveState();
    render();
    showToast("Silver Pulse demo data reset.");
  });

  window.addEventListener("focus", () => renderCountdown(getActiveRound()));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && els.guessConfirmModal.classList.contains("is-visible")) {
      closeGuessConfirmation();
    }
  });
  window.addEventListener("scroll", syncPulseHeaderSpot, { passive: true });
  window.addEventListener("resize", syncPulseHeaderSpot);
}

wireEvents();
saveState();
render();
syncPulseHeaderSpot();
clearInterval(countdownTimer);
countdownTimer = setInterval(() => renderCountdown(getActiveRound()), 1000);
