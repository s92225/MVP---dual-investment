const PULSE_STORAGE_KEY = "silvertimes-silver-pulse-state-v4";
const PULSE_WALLET_KEY = "silvertimes-silver-pulse-wallet-connected";
const DEMO_WALLET = "0x51cb9f3d6c0a42e89491dd2b7c12f4c0a9c0de55";
const PRICE_SOURCE = "LBMA Silver Price (manual MVP input)";
const SCORE_RULES = {
  basePoints: 100,
  timeBonusTiers: [
    { minHoursToCutoff: 8, multiplier: 1.5 },
    { minHoursToCutoff: 6, multiplier: 1.3 },
    { minHoursToCutoff: 4, multiplier: 1.2 },
    { minHoursToCutoff: 2, multiplier: 1.1 },
    { minHoursToCutoff: 0, multiplier: 1 }
  ],
  streakMultipliers: [
    { wins: 10, multiplier: 2 },
    { wins: 7, multiplier: 1.8 },
    { wins: 5, multiplier: 1.5 },
    { wins: 3, multiplier: 1.2 },
    { wins: 2, multiplier: 1.1 },
    { wins: 1, multiplier: 1 }
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

let pulseState = loadState();
let walletConnected = localStorage.getItem(PULSE_WALLET_KEY) === "true";
let pulseToastTimer = null;
let countdownTimer = null;

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
  predictUpButton: document.querySelector("#predictUpButton"),
  predictDownButton: document.querySelector("#predictDownButton"),
  userPredictionStatus: document.querySelector("#userPredictionStatus"),
  participantCount: document.querySelector("#participantCount"),
  sentimentUpBar: document.querySelector("#sentimentUpBar"),
  sentimentDownBar: document.querySelector("#sentimentDownBar"),
  sentimentUpLabel: document.querySelector("#sentimentUpLabel"),
  sentimentDownLabel: document.querySelector("#sentimentDownLabel"),
  roundDetailStats: document.querySelector("#roundDetailStats"),
  leaderboardPanel: document.querySelector("#leaderboardPanel"),
  leaderboardSummary: document.querySelector("#leaderboardSummary"),
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
  adminOverride: document.querySelector("#adminOverride"),
  adminCutoffTime: document.querySelector("#adminCutoffTime"),
  adminSettlementTime: document.querySelector("#adminSettlementTime"),
  settlePulseButton: document.querySelector("#settlePulseButton"),
  markRewardsApprovedButton: document.querySelector("#markRewardsApprovedButton"),
  markRewardsPaidButton: document.querySelector("#markRewardsPaidButton"),
  toast: document.querySelector("#pulseToast")
};

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PULSE_STORAGE_KEY));
    if (parsed && Array.isArray(parsed.rounds) && Array.isArray(parsed.predictions) && Array.isArray(parsed.rewards)) {
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

function createDefaultState() {
  const today = nearestTradingDate(new Date());
  const activeRound = createRound(today, {
    openingPrice: 78,
    currentPrice: 78.42,
    status: "open"
  });
  const pastOne = createRound(previousTradingDate(today), {
    openingPrice: 78,
    currentPrice: 79.1,
    closingPrice: 79.1,
    winningSide: "UP",
    status: "settled"
  });
  const pastTwo = createRound(previousTradingDate(previousTradingDate(today)), {
    openingPrice: 78,
    currentPrice: 77.35,
    closingPrice: 77.35,
    winningSide: "DOWN",
    status: "settled"
  });

  const predictions = [
    ...seedPredictions(activeRound, [
      ["UP", 8, 2],
      ["UP", 13, 1],
      ["DOWN", 19, 0],
      ["UP", 25, 4],
      ["DOWN", 31, 1],
      ["UP", 39, 0],
      ["UP", 47, 3],
      ["DOWN", 58, 2],
      ["UP", 74, 0],
      ["DOWN", 86, 0],
      ["UP", 101, 1],
      ["UP", 118, 2],
      ["DOWN", 136, 0],
      ["UP", 154, 1],
      ["UP", 173, 0],
      ["DOWN", 191, 0],
      ["UP", 209, 2],
      ["DOWN", 228, 1],
      ["UP", 241, 0],
      ["DOWN", 269, 0],
      ["UP", 298, 1],
      ["UP", 337, 0]
    ]),
    ...seedPastPredictions(pastOne, "UP"),
    ...seedPastPredictions(pastTwo, "DOWN")
  ];
  const paidDemoPrediction = predictions.find((prediction) => prediction.roundId === pastOne.id && prediction.wallet === DEMO_WALLET);

  const rewards = [
    {
      id: `RW-${pastOne.id}-${DEMO_WALLET.slice(-6)}`,
      roundId: pastOne.id,
      wallet: DEMO_WALLET,
      rank: 3,
      rewardAmountCents: 200,
      score: paidDemoPrediction ? calculateScore(paidDemoPrediction, pastOne) : 0,
      status: "paid",
      createdAt: pastOne.settlementTime,
      updatedAt: pastOne.settlementTime
    }
  ];

  return {
    version: 1,
    rounds: [activeRound, pastOne, pastTwo],
    predictions,
    rewards
  };
}

function createRound(date, overrides = {}) {
  const dateKey = localDateKey(date);
  const startTime = atLocalTime(dateKey, 0, 0);
  const cutoffTime = londonTimeToUtc(dateKey, 10, 0);
  const settlementTime = londonTimeToUtc(dateKey, 12, 0);

  return {
    id: `SP-${dateKey}`,
    roundDate: dateKey,
    title: `Silver Pulse ${dateKey}`,
    openingPrice: overrides.openingPrice ?? 78,
    currentPrice: overrides.currentPrice ?? 78.42,
    closingPrice: overrides.closingPrice ?? null,
    winningSide: overrides.winningSide ?? null,
    resultOverride: overrides.resultOverride ?? "",
    status: overrides.status ?? "open",
    rewardPoolCents: overrides.rewardPoolCents ?? 2000,
    maxWinners: overrides.maxWinners ?? 20,
    startTime: startTime.toISOString(),
    predictionCutoffTime: cutoffTime.toISOString(),
    settlementTime: settlementTime.toISOString(),
    priceSource: PRICE_SOURCE,
    createdAt: startTime.toISOString(),
    updatedAt: new Date().toISOString(),
    settledAt: overrides.status === "settled" ? settlementTime.toISOString() : null
  };
}

function seedPredictions(round, rows) {
  const start = new Date(round.startTime).getTime();
  return rows.map(([side, minutesAfterStart, priorWinStreak], index) => ({
    id: `PR-${round.id}-${index + 1}`,
    roundId: round.id,
    wallet: SAMPLE_WALLETS[index],
    side,
    createdAt: new Date(start + minutesAfterStart * 60 * 1000).toISOString(),
    priorWinStreak,
    score: null,
    result: null
  }));
}

function seedPastPredictions(round, winningSide) {
  const start = new Date(round.startTime).getTime();
  const wallets = [DEMO_WALLET, ...SAMPLE_WALLETS.slice(0, 6)];
  return wallets.map((wallet, index) => {
    const side = index === 2 ? (winningSide === "UP" ? "DOWN" : "UP") : winningSide;
    const prediction = {
      id: `PR-${round.id}-past-${index + 1}`,
      roundId: round.id,
      wallet,
      side,
      createdAt: new Date(start + (18 + index * 17) * 60 * 1000).toISOString(),
      priorWinStreak: Math.max(0, 2 - index),
      result: side === winningSide ? "correct" : "incorrect"
    };
    return {
      ...prediction,
      score: side === winningSide ? calculateScore(prediction, round) : 0
    };
  });
}

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function atLocalTime(dateKey, hour, minute) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function londonTimeToUtc(dateKey, hour, minute) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
  const londonOffset = timeZoneOffsetMs(utcGuess, "Europe/London");
  return new Date(utcGuess.getTime() - londonOffset);
}

function timeZoneOffsetMs(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const asUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second)
  );
  return asUtc - date.getTime();
}

function nearestTradingDate(date) {
  let cursor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

function previousTradingDate(date) {
  let cursor = addDays(date, -1);
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}

function isTradingDay(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6;
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
  return state.rounds.find((round) => ["open", "locked", "upcoming"].includes(round.status)) || state.rounds[0];
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

function render() {
  const round = getActiveRound();
  renderWallet();
  renderHero(round);
  renderRound(round);
  renderMonthlyChart(round);
  renderSentiment(round);
  renderRoundDetails(round);
  renderLeaderboard(round);
  renderHistory();
  renderProfile();
  populateAdminForm(round);
  renderCountdown(round);
}

function renderWallet() {
  els.walletButton.textContent = walletConnected ? shortWallet(DEMO_WALLET) : "Connect Wallet";
}

function renderHero(round) {
  const status = effectiveStatus(round);
  els.pulseRoundPill.innerHTML = `
    <span>${round.roundDate}</span>
    <strong>${status.toUpperCase()}</strong>
    <small>local trading day</small>
  `;
  els.pulseHeaderMetric.innerHTML = `
    <span>Spot</span>
    <strong>${formatPrice(round.currentPrice)}</strong>
    <small>silver</small>
  `;
  els.pulseSpotInline.innerHTML = `
    <span>Silver spot</span>
    <strong>${formatPrice(round.currentPrice)}</strong>
    <small>demo feed</small>
  `;
  els.heroRewardPool.textContent = formatUsdtFromCents(round.rewardPoolCents).replace(".00", "");
  els.heroMaxWinners.textContent = String(round.maxWinners);
}

function renderRound(round) {
  const status = effectiveStatus(round);
  const prediction = walletConnected ? currentWalletPrediction(round) : null;
  const canPredict = walletConnected && status === "open" && !prediction;

  els.roundStatusPill.textContent = status;
  els.pulseQuestionText.textContent = `Will silver price close above ${formatPrice(round.openingPrice)}?`;
  els.openingPriceValue.textContent = formatPrice(round.openingPrice);
  els.currentPriceValue.textContent = formatPrice(round.currentPrice);
  els.cutoffValue.textContent = "10:00 London";

  [els.predictUpButton, els.predictDownButton].forEach((button) => {
    const selected = prediction && prediction.side === button.dataset.side;
    button.disabled = !canPredict;
    button.classList.toggle("is-selected", Boolean(selected));
  });

  if (!walletConnected) {
    els.userPredictionStatus.innerHTML = `
      <span>Status</span>
      <strong>Connect demo wallet to submit</strong>
    `;
    return;
  }

  if (prediction) {
    els.userPredictionStatus.innerHTML = `
      <span>Prediction locked</span>
      <strong>You predicted ${prediction.side} at ${formatDateTime(prediction.createdAt)}</strong>
    `;
    return;
  }

  if (status !== "open") {
    els.userPredictionStatus.innerHTML = `
      <span>Status</span>
      <strong>Round is ${status}</strong>
    `;
    return;
  }

  els.userPredictionStatus.innerHTML = `
    <span>Status</span>
    <strong>Choose UP or DOWN before cutoff</strong>
  `;
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
    </svg>
  `;
}

function renderRoundDetails(round) {
  const scorePreview = scorePreviewForWallet(round);

  els.roundDetailStats.innerHTML = `
    <div class="stat">
      <span class="metric-label">Resolve</span>
      <strong class="metric-value"><a class="text-link" href="https://www.lbma.org.uk/prices-and-data/precious-metal-prices" target="_blank" rel="noreferrer">LBMA silver price</a></strong>
    </div>
  `;

  document.querySelector("#potentialScoreValue").textContent = `${scorePreview.score} pts`;
  document.querySelector("#basePointValue").textContent = String(SCORE_RULES.basePoints);
  document.querySelector("#timeBonusValue").textContent = formatMultiplier(scorePreview.timeBonus);
  document.querySelector("#streakBonusValue").textContent = formatMultiplier(scorePreview.streakMultiplier);
  document.querySelector("#streakCountValue").textContent = `${scorePreview.currentWinStreak} win${scorePreview.currentWinStreak === 1 ? "" : "s"}`;
}

function renderLeaderboard(round) {
  const status = effectiveStatus(round);
  const sentiment = sentimentForRound(round);

  if (status !== "settled") {
    els.leaderboardSummary.textContent = "Final winners appear after settlement.";
    els.leaderboardPanel.innerHTML = `
      <div class="empty-state">
        ${sentiment.total} participant${sentiment.total === 1 ? "" : "s"} entered. ${sentiment.upPercent}% chose UP and ${sentiment.downPercent}% chose DOWN. Winner ranking is hidden until settlement.
      </div>
    `;
    return;
  }

  const rows = leaderboardRows(round);
  const winners = rows.filter((row) => row.reward);
  els.leaderboardSummary.textContent = winners.length
    ? `${winners.length} winner${winners.length === 1 ? "" : "s"} share ${formatUsdtFromCents(round.rewardPoolCents)}.`
    : "No correct predictions. No payout recorded.";

  if (!rows.length) {
    els.leaderboardPanel.innerHTML = `<div class="empty-state">No predictions for this round.</div>`;
    return;
  }

  els.leaderboardPanel.innerHTML = `
    <div class="pulse-table">
      <div class="pulse-table-row pulse-table-head">
        <span>Rank</span>
        <span>User</span>
        <span>Prediction</span>
        <span>Submitted</span>
        <span>Result</span>
        <span>Score</span>
        <span>Reward</span>
      </div>
      ${rows.map((row) => renderLeaderboardRow(row)).join("")}
    </div>
  `;
}

function renderLeaderboardRow(row) {
  const rank = row.rank ? `#${row.rank}` : "-";
  const reward = row.reward ? `${formatUsdtFromCents(row.reward.rewardAmountCents)} ${row.reward.status}` : row.rewardLabel;
  return `
    <div class="pulse-table-row ${row.reward ? "is-winner" : ""}">
      <span>${rank}</span>
      <span>${shortWallet(row.prediction.wallet)}</span>
      <span>${row.prediction.side}</span>
      <span>${formatDateTime(row.prediction.createdAt)}</span>
      <span>${row.resultLabel}</span>
      <span>${row.score || "-"}</span>
      <span>${reward}</span>
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
      let rewardLabel = "No reward";

      if (round.winningSide === "FLAT") {
        resultLabel = "Flat round";
        rewardLabel = "No payout";
      } else if (isCorrect && reward) {
        resultLabel = "Correct";
      } else if (isCorrect) {
        resultLabel = "Correct";
        rewardLabel = "Correct, outside top winners";
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

  const timeBonus = timeBonusForPrediction(prediction, round);
  const streakMultiplier = streakMultiplierForPrediction(prediction, round);

  return Math.round(SCORE_RULES.basePoints * timeBonus * streakMultiplier);
}

function timeBonusForPrediction(prediction, round) {
  const hoursToCutoff = Math.max(
    0,
    (new Date(round.predictionCutoffTime).getTime() - new Date(prediction.createdAt).getTime()) / 3600000
  );
  const tier = SCORE_RULES.timeBonusTiers.find((item) => hoursToCutoff >= item.minHoursToCutoff);
  return tier ? tier.multiplier : 1;
}

function streakMultiplierForPrediction(prediction, round) {
  const currentWinStreak = currentWinStreakForPrediction(prediction, round);
  const rule = SCORE_RULES.streakMultipliers.find((item) => currentWinStreak >= item.wins);
  return rule ? rule.multiplier : 1;
}

function currentWinStreakForPrediction(prediction, round) {
  const priorWinStreak = prediction.priorWinStreak ?? calculatePriorWinStreak(prediction.wallet, round.roundDate);
  return priorWinStreak + 1;
}

function scorePreviewForWallet(round) {
  const prediction = currentWalletPrediction(round) || {
    wallet: DEMO_WALLET,
    side: "UP",
    createdAt: new Date().toISOString(),
    priorWinStreak: walletConnected ? calculatePriorWinStreak(DEMO_WALLET, round.roundDate) : 0
  };
  const timeBonus = timeBonusForPrediction(prediction, round);
  const streakMultiplier = streakMultiplierForPrediction(prediction, round);
  const currentWinStreak = currentWinStreakForPrediction(prediction, round);

  return {
    timeBonus,
    streakMultiplier,
    currentWinStreak,
    score: Math.round(SCORE_RULES.basePoints * timeBonus * streakMultiplier)
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
        <span>Reward Pool</span>
      </div>
      ${rounds.map((round) => `
        <div class="pulse-table-row">
          <span>${round.roundDate}</span>
          <span>${effectiveStatus(round)}</span>
          <span>${formatPrice(round.openingPrice)}</span>
          <span>${formatPrice(round.closingPrice)}</span>
          <span>${round.winningSide || "-"}</span>
          <span>${formatUsdtFromCents(round.rewardPoolCents)}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderProfile() {
  if (!walletConnected) {
    els.profilePanel.innerHTML = `<div class="empty-state">Connect the demo wallet to view local prediction history.</div>`;
    return;
  }

  const predictions = pulseState.predictions
    .filter((prediction) => prediction.wallet === DEMO_WALLET)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!predictions.length) {
    els.profilePanel.innerHTML = `<div class="empty-state">No predictions from ${shortWallet(DEMO_WALLET)} yet.</div>`;
    return;
  }

  els.profilePanel.innerHTML = `
    <div class="pulse-table">
      <div class="pulse-table-row pulse-table-head">
        <span>Round</span>
        <span>Prediction</span>
        <span>Submitted</span>
        <span>Result</span>
        <span>Score</span>
        <span>Reward</span>
      </div>
      ${predictions.map((prediction) => renderProfileRow(prediction)).join("")}
    </div>
  `;
}

function renderProfileRow(prediction) {
  const round = pulseState.rounds.find((item) => item.id === prediction.roundId);
  const reward = pulseState.rewards.find((item) => item.roundId === prediction.roundId && item.wallet === DEMO_WALLET);
  const settled = round && round.status === "settled";
  const correct = settled && prediction.side === round.winningSide && round.winningSide !== "FLAT";
  const result = !settled ? "Pending" : correct ? "Correct" : round.winningSide === "FLAT" ? "Flat" : "Incorrect";
  const score = correct ? calculateScore(prediction, round) : settled ? "0" : "-";
  const rewardText = reward ? `${formatUsdtFromCents(reward.rewardAmountCents)} ${reward.status}` : "-";

  return `
    <div class="pulse-table-row">
      <span>${round ? round.roundDate : prediction.roundId}</span>
      <span>${prediction.side}</span>
      <span>${formatDateTime(prediction.createdAt)}</span>
      <span>${result}</span>
      <span>${score}</span>
      <span>${rewardText}</span>
    </div>
  `;
}

function populateAdminForm(round) {
  els.adminOpeningPrice.value = round.openingPrice ?? "";
  els.adminCurrentPrice.value = round.currentPrice ?? "";
  els.adminClosingPrice.value = round.closingPrice ?? "";
  els.adminRewardPool.value = (round.rewardPoolCents / 100).toFixed(2);
  els.adminMaxWinners.value = round.maxWinners;
  els.adminStatus.value = round.status;
  els.adminOverride.value = round.resultOverride || "";
  els.adminCutoffTime.value = toDatetimeLocalValue(round.predictionCutoffTime);
  els.adminSettlementTime.value = toDatetimeLocalValue(round.settlementTime);
}

function saveRoundFromAdmin(showSavedToast = true) {
  const round = getActiveRound();
  round.openingPrice = Number(els.adminOpeningPrice.value);
  round.currentPrice = Number(els.adminCurrentPrice.value);
  round.closingPrice = els.adminClosingPrice.value ? Number(els.adminClosingPrice.value) : null;
  round.rewardPoolCents = Math.round(Number(els.adminRewardPool.value || 0) * 100);
  round.maxWinners = Math.max(1, Math.floor(Number(els.adminMaxWinners.value || 20)));
  round.status = els.adminStatus.value;
  round.resultOverride = els.adminOverride.value;
  round.predictionCutoffTime = fromDatetimeLocalValue(els.adminCutoffTime.value) || round.predictionCutoffTime;
  round.settlementTime = fromDatetimeLocalValue(els.adminSettlementTime.value) || round.settlementTime;
  round.updatedAt = new Date().toISOString();

  saveState();
  render();

  if (showSavedToast) {
    showToast("Round settings saved.");
  }
}

function submitPrediction(side) {
  const round = getActiveRound();
  const status = effectiveStatus(round);

  if (!walletConnected) {
    showToast("Connect the demo wallet first.");
    return;
  }

  if (!["UP", "DOWN"].includes(side)) {
    showToast("Choose UP or DOWN.");
    return;
  }

  if (status !== "open") {
    showToast(`Prediction is closed because the round is ${status}.`);
    return;
  }

  if (currentWalletPrediction(round)) {
    showToast("You already submitted a prediction for this round.");
    return;
  }

  pulseState.predictions.push({
    id: `PR-${round.id}-${DEMO_WALLET.slice(-6)}-${Date.now()}`,
    roundId: round.id,
    wallet: DEMO_WALLET,
    side,
    createdAt: new Date().toISOString(),
    priorWinStreak: calculatePriorWinStreak(DEMO_WALLET, round.roundDate),
    score: null,
    result: null
  });

  saveState();
  render();
  showToast(`Prediction locked: ${side}.`);
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
  const winners = correctPredictions.slice(0, round.maxWinners);
  const rewards = createRewards(round, winners);

  round.winningSide = winningSide;
  round.status = "settled";
  round.settledAt = new Date().toISOString();
  round.updatedAt = new Date().toISOString();

  pulseState.predictions = pulseState.predictions.map((prediction) => {
    if (prediction.roundId !== round.id) {
      return prediction;
    }

    const isCorrect = winningSide !== "FLAT" && prediction.side === winningSide;
    return {
      ...prediction,
      result: isCorrect ? "correct" : winningSide === "FLAT" ? "flat" : "incorrect",
      score: isCorrect ? calculateScoreWithSide(prediction, round, winningSide) : 0
    };
  });
  pulseState.rewards = [
    ...pulseState.rewards.filter((reward) => reward.roundId !== round.id),
    ...rewards
  ];

  saveState();
  render();
  showToast(winners.length ? `${winners.length} reward record(s) created.` : "Round settled with no payout.");
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

  const baseCents = Math.floor(round.rewardPoolCents / winners.length);
  let remainder = round.rewardPoolCents - baseCents * winners.length;

  return winners.map((entry, index) => {
    const extraCent = remainder > 0 ? 1 : 0;
    remainder -= extraCent;
    return {
      id: `RW-${round.id}-${entry.prediction.wallet.slice(-6)}-${Date.now()}-${index}`,
      roundId: round.id,
      wallet: entry.prediction.wallet,
      rank: index + 1,
      rewardAmountCents: baseCents + extraCent,
      score: entry.score,
      status: "pending",
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

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  els.countdownValue.textContent = `${hours}h ${minutes}m`;
  renderRoundDetails(round);
}

function wireEvents() {
  els.walletButton.addEventListener("click", () => {
    walletConnected = !walletConnected;
    localStorage.setItem(PULSE_WALLET_KEY, String(walletConnected));
    render();
    showToast(walletConnected ? "Demo wallet connected." : "Demo wallet disconnected.");
  });

  els.predictUpButton.addEventListener("click", () => submitPrediction("UP"));
  els.predictDownButton.addEventListener("click", () => submitPrediction("DOWN"));

  els.adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveRoundFromAdmin(true);
  });

  els.settlePulseButton.addEventListener("click", settleActiveRound);
  els.markRewardsApprovedButton.addEventListener("click", () => markActiveRewards("approved"));
  els.markRewardsPaidButton.addEventListener("click", () => markActiveRewards("paid"));

  els.resetPulseButton.addEventListener("click", () => {
    localStorage.removeItem(PULSE_STORAGE_KEY);
    pulseState = createDefaultState();
    saveState();
    render();
    showToast("Silver Pulse demo data reset.");
  });

  window.addEventListener("focus", () => renderCountdown(getActiveRound()));
}

wireEvents();
saveState();
render();
clearInterval(countdownTimer);
countdownTimer = setInterval(() => renderCountdown(getActiveRound()), 1000);
