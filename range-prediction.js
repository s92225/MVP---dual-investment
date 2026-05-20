const RANGE_STORAGE_KEY = "silvertimes-range-prediction-state-v2";
const RANGE_WALLET_KEY = "silvertimes-range-prediction-wallet-connected";
const RANGE_DEMO_WALLET = "0x51cb9f3d6c0a42e89491dd2b7c12f4c0a9c0de55";
const RANGE_MIN_USDT = 1;
const MARKET_LIQUIDITY_USDT = 24;
const RANGE_SPOT_PRICE = {
  value: 78.42,
  unit: "USD / oz",
  asOf: "May 20, 2026 1:00 PM HKT",
  source: "LBMA manual MVP"
};
const STT_REFERENCE_PRICE = RANGE_SPOT_PRICE.value;
const RANGE_SESSION_STARTED_AT = new Date();

const RANGE_TERMS = [
  { id: "weekly", label: "Weekly", shortLabel: "7D", days: 7, summary: "Settles in 7 days against the final reference price." },
  { id: "1m", label: "1M", shortLabel: "1M", months: 1, summary: "Settles one month after prediction entry." },
  { id: "3m", label: "3M", shortLabel: "3M", months: 3, summary: "Settles three months after prediction entry." }
];

const RANGE_PRESETS = [
  {
    id: "weekly-core",
    term: "weekly",
    name: "Weekly Core",
    lower: 74,
    upper: 84,
    confidence: "Tight"
  },
  {
    id: "weekly-wide",
    term: "weekly",
    name: "Weekly Wide",
    lower: 70,
    upper: 90,
    confidence: "Wide"
  },
  {
    id: "1m-balanced",
    term: "1m",
    name: "1M Balanced",
    lower: 70,
    upper: 90,
    confidence: "Balanced"
  },
  {
    id: "1m-high-conviction",
    term: "1m",
    name: "1M High Conviction",
    lower: 74,
    upper: 86,
    confidence: "Tight"
  },
  {
    id: "3m-balanced",
    term: "3m",
    name: "3M Balanced",
    lower: 68,
    upper: 94,
    confidence: "Balanced"
  },
  {
    id: "3m-custom-wide",
    term: "3m",
    name: "3M Wide",
    lower: 64,
    upper: 98,
    confidence: "Wide"
  }
];

const RANGE_SERIES = [
  { label: "Apr 12", value: 72.4 },
  { label: "Apr 16", value: 73.6 },
  { label: "Apr 20", value: 76.1 },
  { label: "Apr 24", value: 75.3 },
  { label: "Apr 28", value: 77.8 },
  { label: "May 2", value: 79.2 },
  { label: "May 6", value: 77.4 },
  { label: "May 10", value: 80.1 },
  { label: "May 14", value: 78.42 }
];

let rangeState = loadRangeState();
let rangeWalletConnected = localStorage.getItem(RANGE_WALLET_KEY) === "true";
let selectedTermId = "weekly";
let selectedPresetId = "weekly-wide";
let selectedAsset = "USDT";
let selectedSide = "YES";
let selectedMarketView = "chart";
let rangeToastTimer = null;
let resolutionTimer = null;

const els = {
  walletButton: document.querySelector("#rangeWalletButton"),
  rangeHeaderMetric: document.querySelector("#rangeHeaderMetric"),
  rangeSpotPill: document.querySelector("#rangeSpotPill"),
  rangeSpotInline: document.querySelector("#rangeSpotInline"),
  termSummary: document.querySelector("#termSummary"),
  rangeMarketQuestion: document.querySelector("#rangeMarketQuestion"),
  rangePresetList: document.querySelector("#rangePresetList"),
  rangeStatusPill: document.querySelector("#rangeStatusPill"),
  heroRangeValue: document.querySelector("#heroRangeValue"),
  heroTermValue: document.querySelector("#heroTermValue"),
  marketChanceLabel: document.querySelector("#marketChanceLabel"),
  yesChanceValue: document.querySelector("#yesChanceValue"),
  resolutionCountdown: document.querySelector("#resolutionCountdown"),
  buyYesButton: document.querySelector("#buyYesButton"),
  buyNoButton: document.querySelector("#buyNoButton"),
  chartTabButton: document.querySelector("#chartTabButton"),
  orderBookTabButton: document.querySelector("#orderBookTabButton"),
  sharePriceChart: document.querySelector("#sharePriceChart"),
  orderBookPanel: document.querySelector("#orderBookPanel"),
  rangeAmountInput: document.querySelector("#rangeAmountInput"),
  rangeAmountConversion: document.querySelector("#rangeAmountConversion"),
  rangeUsdtButton: document.querySelector("#rangeUsdtButton"),
  rangeSttButton: document.querySelector("#rangeSttButton"),
  rangeTicketSummary: document.querySelector("#rangeTicketSummary"),
  submitButton: document.querySelector("#submitRangePredictionButton"),
  rangeStatsGrid: document.querySelector("#rangeStatsGrid"),
  rangeProfilePanel: document.querySelector("#rangeProfilePanel"),
  resetRangeButton: document.querySelector("#resetRangeButton"),
  adminForm: document.querySelector("#rangeAdminForm"),
  adminFinalPrice: document.querySelector("#adminFinalPrice"),
  adminMarketStatus: document.querySelector("#adminMarketStatus"),
  toast: document.querySelector("#rangeToast")
};

function loadRangeState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(RANGE_STORAGE_KEY));
    if (parsed && Array.isArray(parsed.predictions) && parsed.marketStatus) {
      return parsed;
    }
  } catch {
    // Ignore invalid demo state and reseed.
  }

  return {
    marketStatus: "open",
    predictions: seedPredictions()
  };
}

function seedPredictions() {
  const now = new Date();
  return [
    createPredictionRecord({
      wallet: "0xa91f5d2e8b44d1032aa70e90f1c5a8d247e00001",
      termId: "weekly",
      presetId: "weekly-wide",
      lower: 70,
      upper: 90,
      asset: "USDT",
      amount: 10,
      side: "YES",
      createdAt: offsetDate(now, -2).toISOString()
    }),
    createPredictionRecord({
      wallet: "0xb1c7f3210de7b610902cba6504d2ce101ae00002",
      termId: "1m",
      presetId: "1m-balanced",
      lower: 70,
      upper: 90,
      asset: "STT",
      amount: 0.25,
      side: "NO",
      createdAt: offsetDate(now, -4).toISOString()
    }),
    createPredictionRecord({
      wallet: "0xc84a1b207910c66b6e98fa701d63be7534e00003",
      termId: "3m",
      presetId: "3m-balanced",
      lower: 68,
      upper: 94,
      asset: "USDT",
      amount: 50,
      side: "YES",
      createdAt: offsetDate(now, -9).toISOString()
    })
  ];
}

function saveRangeState() {
  localStorage.setItem(RANGE_STORAGE_KEY, JSON.stringify(rangeState));
}

function offsetDate(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addCalendarMonths(date, months) {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, lastDay));
  return result;
}

function selectedTerm() {
  return RANGE_TERMS.find((term) => term.id === selectedTermId) || RANGE_TERMS[0];
}

function selectedPreset() {
  return RANGE_PRESETS.find((preset) => preset.id === selectedPresetId) || RANGE_PRESETS[1];
}

function presetsForTerm(termId = selectedTermId) {
  return RANGE_PRESETS.filter((preset) => preset.term === termId);
}

function settlementDateForTerm(term, startDate = new Date()) {
  if (term.months) {
    return addCalendarMonths(startDate, term.months);
  }

  return offsetDate(startDate, term.days || 7);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatPrice(value) {
  return `US$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatRange(lower, upper) {
  return `${formatPrice(lower)}-${formatPrice(upper)}`;
}

function formatShortRange(lower, upper) {
  return `US$${Number(lower).toLocaleString("en-US", {
    maximumFractionDigits: 2
  })}-${Number(upper).toLocaleString("en-US", {
    maximumFractionDigits: 2
  })}`;
}

function formatAmount(value, asset) {
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: asset === "USDT" ? 2 : 0,
    maximumFractionDigits: asset === "USDT" ? 2 : 4
  })} ${asset}`;
}

function formatSharePrice(price) {
  return `${Math.round(Number(price) * 100)}c`;
}

function formatShares(value) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4
  });
}

function shortWallet(wallet) {
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function amountToUsdt(amount, asset) {
  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  return asset === "STT" ? numericAmount * STT_REFERENCE_PRICE : numericAmount;
}

function usdtToAsset(usdtValue, asset) {
  return asset === "STT" ? usdtValue / STT_REFERENCE_PRICE : usdtValue;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function seedYesPriceForPreset(preset) {
  const width = preset.upper - preset.lower;
  const midpoint = (preset.upper + preset.lower) / 2;
  const distanceFromSpot = Math.abs(RANGE_SPOT_PRICE.value - midpoint);
  return clamp(0.36 + width / 90 - distanceFromSpot / 70, 0.08, 0.92);
}

function marketForPreset(presetId, state = rangeState) {
  const preset = RANGE_PRESETS.find((item) => item.id === presetId) || selectedPreset();
  const seedYesPrice = seedYesPriceForPreset(preset);
  let yesDemand = MARKET_LIQUIDITY_USDT * seedYesPrice;
  let noDemand = MARKET_LIQUIDITY_USDT * (1 - seedYesPrice);

  state.predictions
    .filter((prediction) => prediction.presetId === preset.id)
    .forEach((prediction) => {
      if ((prediction.side || "YES") === "YES") {
        yesDemand += Number(prediction.usdtValue || 0);
      } else {
        noDemand += Number(prediction.usdtValue || 0);
      }
    });

  const yesPrice = clamp(yesDemand / (yesDemand + noDemand), 0.01, 0.99);
  return {
    yesDemand,
    noDemand,
    yesPrice,
    noPrice: 1 - yesPrice,
    volume: yesDemand + noDemand - MARKET_LIQUIDITY_USDT
  };
}

function selectedMarket() {
  return marketForPreset(selectedPresetId);
}

function priceForSide(side, market = selectedMarket()) {
  return side === "YES" ? market.yesPrice : market.noPrice;
}

function resolutionDateForSelectedTerm() {
  return settlementDateForTerm(selectedTerm(), RANGE_SESSION_STARTED_AT);
}

function formatCountdown(targetDate) {
  const diffMs = new Date(targetDate).getTime() - Date.now();
  if (diffMs <= 0) {
    return "Resolving";
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  return `${hours}h ${minutes}m ${seconds}s`;
}

function currentInputs() {
  const preset = selectedPreset();

  return {
    lower: preset.lower,
    upper: preset.upper,
    amount: Number(els.rangeAmountInput.value)
  };
}

function createPredictionRecord({
  wallet,
  termId,
  presetId,
  lower,
  upper,
  asset,
  amount,
  side = "YES",
  sharePrice,
  createdAt = new Date().toISOString()
}) {
  const term = RANGE_TERMS.find((item) => item.id === termId) || RANGE_TERMS[0];
  const preset = RANGE_PRESETS.find((item) => item.id === presetId) || RANGE_PRESETS[0];
  const usdtValue = amountToUsdt(amount, asset);
  const settlementDate = settlementDateForTerm(term, new Date(createdAt)).toISOString();
  const normalizedSide = side === "NO" ? "NO" : "YES";
  const price = Number.isFinite(Number(sharePrice))
    ? Number(sharePrice)
    : normalizedSide === "YES"
      ? seedYesPriceForPreset(preset)
      : 1 - seedYesPriceForPreset(preset);
  const shares = price > 0 ? usdtValue / price : 0;

  return {
    id: `range-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    wallet,
    termId,
    termLabel: term.label,
    presetId,
    presetName: preset.name,
    lower: Number(lower),
    upper: Number(upper),
    side: normalizedSide,
    asset,
    amount: Number(amount),
    usdtValue,
    sharePrice: price,
    shares,
    status: "open",
    result: null,
    settlementPrice: null,
    createdAt,
    settlementDate,
    updatedAt: createdAt
  };
}

function renderSpotMetrics() {
  const markup = `
    <span>Spot silver</span>
    <strong>${formatPrice(RANGE_SPOT_PRICE.value)}</strong>
    <small>${RANGE_SPOT_PRICE.unit}</small>
  `;

  els.rangeSpotPill.innerHTML = markup;
  els.rangeHeaderMetric.innerHTML = `
    <span>Spot</span>
    <strong>${formatPrice(RANGE_SPOT_PRICE.value)}</strong>
    <small>${RANGE_SPOT_PRICE.asOf}</small>
  `;
  els.rangeSpotInline.innerHTML = `
    <span>Spot</span>
    <strong>${formatPrice(RANGE_SPOT_PRICE.value)}</strong>
    <small>${RANGE_SPOT_PRICE.source}</small>
  `;
}

function renderTermControls() {
  document.querySelectorAll("[data-term]").forEach((button) => {
    const isActive = button.dataset.term === selectedTermId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  els.termSummary.textContent = selectedTerm().summary;
  renderResolutionCountdown();
}

function renderPresetList() {
  const preset = selectedPreset();
  els.rangeMarketQuestion.innerHTML = `
    <span>Will silver price stay between</span>
    <strong>${formatRange(preset.lower, preset.upper)}</strong>
    <span>?</span>
  `;

  els.rangePresetList.innerHTML = presetsForTerm().map((preset) => {
    const isSelected = preset.id === selectedPresetId;
    const market = marketForPreset(preset.id);

    return `
      <button class="product-row range-preset-row ${isSelected ? "is-selected" : ""}" type="button" data-preset-id="${preset.id}">
        <span class="metric">
          <span class="metric-label">Range</span>
          <strong class="metric-value">${formatRange(preset.lower, preset.upper)}</strong>
        </span>
        <span class="metric">
          <span class="metric-label">Yes</span>
          <strong class="metric-value">${formatSharePrice(market.yesPrice)}</strong>
        </span>
        <span class="metric">
          <span class="metric-label">No</span>
          <strong class="metric-value">${formatSharePrice(market.noPrice)}</strong>
        </span>
      </button>
    `;
  }).join("");
}

function renderSharePriceChart() {
  const market = selectedMarket();
  const preset = selectedPreset();
  const currentPrice = priceForSide(selectedSide, market);
  const history = sharePriceHistory(preset, currentPrice, selectedSide);
  const width = 420;
  const height = 210;
  const padding = { top: 20, right: 44, bottom: 30, left: 38 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const y = (price) => padding.top + ((1 - price) / 1) * chartHeight;
  const x = (index) => padding.left + (index / (history.length - 1)) * chartWidth;
  const points = history.map((point, index) => `${x(index).toFixed(1)},${y(point.price).toFixed(1)}`).join(" ");
  const lastPoint = history[history.length - 1];

  els.marketChanceLabel.textContent = `${selectedSide} chance`;
  els.yesChanceValue.textContent = `${Math.round(currentPrice * 100)}%`;
  els.buyYesButton.textContent = `Buy Yes ${formatSharePrice(market.yesPrice)}`;
  els.buyNoButton.textContent = `Buy No ${formatSharePrice(market.noPrice)}`;
  els.buyYesButton.classList.toggle("is-active", selectedSide === "YES");
  els.buyNoButton.classList.toggle("is-active", selectedSide === "NO");
  els.sharePriceChart.dataset.side = selectedSide.toLowerCase();

  els.sharePriceChart.innerHTML = `
    <div class="monthly-chart-header">
      <div>
        <span>${selectedSide} share</span>
        <strong>${selectedSide} ${Math.round(currentPrice * 100)}% chance</strong>
      </div>
      <span>${formatRange(preset.lower, preset.upper)}</span>
    </div>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${selectedSide} share price history">
      <line class="monthly-grid" x1="${padding.left}" x2="${width - padding.right}" y1="${y(0.75).toFixed(1)}" y2="${y(0.75).toFixed(1)}"></line>
      <line class="monthly-grid" x1="${padding.left}" x2="${width - padding.right}" y1="${y(0.5).toFixed(1)}" y2="${y(0.5).toFixed(1)}"></line>
      <line class="monthly-grid" x1="${padding.left}" x2="${width - padding.right}" y1="${y(0.25).toFixed(1)}" y2="${y(0.25).toFixed(1)}"></line>
      <polyline class="share-price-line" points="${points}"></polyline>
      <circle class="monthly-dot" cx="${x(history.length - 1).toFixed(1)}" cy="${y(lastPoint.price).toFixed(1)}" r="5"></circle>
      <text class="monthly-axis" x="${width - padding.right + 8}" y="${y(0.75).toFixed(1)}">75%</text>
      <text class="monthly-axis" x="${width - padding.right + 8}" y="${y(0.5).toFixed(1)}">50%</text>
      <text class="monthly-axis" x="${width - padding.right + 8}" y="${y(0.25).toFixed(1)}">25%</text>
      <text class="monthly-axis" x="${padding.left}" y="${height - 8}">${history[0].label}</text>
      <text class="monthly-axis" x="${width - padding.right - 42}" y="${height - 8}">${lastPoint.label}</text>
    </svg>
  `;
}

function sharePriceHistory(preset, currentPrice, side) {
  const basePrice = side === "YES" ? seedYesPriceForPreset(preset) : 1 - seedYesPriceForPreset(preset);
  const history = Array.from({ length: 18 }, (_, index) => {
    const sideShift = side === "YES" ? 0 : 1.7;
    const drift = Math.sin((index + preset.id.length + sideShift) * 0.8) * 0.035;
    const earlyBias = (index - 17) * 0.002;
    return {
      label: index === 0 ? "9:00" : index === 17 ? "Now" : "",
      price: clamp(basePrice + drift + earlyBias, 0.01, 0.99)
    };
  });

  const previous = history[history.length - 2].price;
  history[history.length - 2].price = clamp(previous + (currentPrice - previous) * 0.18, 0.01, 0.99);
  history[history.length - 1].price = currentPrice;
  return history;
}

function renderOrderBook() {
  const market = selectedMarket();
  const yesRows = orderBookRows(market.yesPrice, market.yesDemand);
  const noRows = orderBookRows(market.noPrice, market.noDemand);
  const maxTotal = Math.max(
    ...yesRows.map((row) => row.total),
    ...noRows.map((row) => row.total),
    1
  );

  els.orderBookPanel.innerHTML = `
    <div class="order-book-header">
      <span>Order book</span>
      <strong>${formatAmount(market.volume, "USDT")} Vol.</strong>
    </div>
    <div class="order-book-columns">
      ${renderOrderBookSide("YES", yesRows, maxTotal)}
      ${renderOrderBookSide("NO", noRows, maxTotal)}
    </div>
  `;
}

function orderBookRows(price, demand) {
  return [0, 1, 2, 3].map((level) => {
    const levelPrice = clamp(price + level * 0.02, 0.01, 0.99);
    const shares = (demand * (0.34 - level * 0.055)) / levelPrice;
    return {
      price: levelPrice,
      shares,
      total: levelPrice * shares
    };
  });
}

function renderOrderBookSide(side, rows, maxTotal) {
  return `
    <div class="order-book-side ${side.toLowerCase()}">
      <h4>${side} asks</h4>
      <div class="order-book-row order-book-head">
        <span>Price</span>
        <span>Shares</span>
        <span>Total</span>
      </div>
      ${rows.map((row) => `
        <div class="order-book-row" style="--depth: ${Math.max(10, (row.total / maxTotal) * 100).toFixed(1)}%">
          <span>${formatSharePrice(row.price)}</span>
          <span>${formatShares(row.shares)}</span>
          <span>${formatAmount(row.total, "USDT")}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAmountConversion() {
  const amount = Number(els.rangeAmountInput.value);
  if (!Number.isFinite(amount) || amount <= 0) {
    els.rangeAmountConversion.textContent = `Minimum participation is ${formatAmount(RANGE_MIN_USDT, "USDT")} or ${formatAmount(usdtToAsset(RANGE_MIN_USDT, "STT"), "STT")}.`;
    return;
  }

  const usdtValue = amountToUsdt(amount, selectedAsset);
  const pairedAsset = selectedAsset === "USDT" ? "STT" : "USDT";
  const pairedAmount = selectedAsset === "USDT" ? usdtToAsset(usdtValue, "STT") : usdtValue;
  const sharePrice = priceForSide(selectedSide);
  const shares = sharePrice > 0 ? usdtValue / sharePrice : 0;
  els.rangeAmountConversion.textContent = `${formatAmount(usdtValue, "USDT")} buys ${formatShares(shares)} ${selectedSide} shares at ${formatSharePrice(sharePrice)} (${formatAmount(pairedAmount, pairedAsset)}).`;
}

function renderTicketSummary() {
  const preset = selectedPreset();
  const term = selectedTerm();
  const { lower, upper, amount } = currentInputs();
  const usdtValue = amountToUsdt(amount, selectedAsset);
  const sharePrice = priceForSide(selectedSide);
  const shares = sharePrice > 0 ? usdtValue / sharePrice : 0;
  const settlementDate = resolutionDateForSelectedTerm();
  const isValidRange = Number.isFinite(lower) && Number.isFinite(upper) && lower < upper;
  const isValidAmount = usdtValue >= RANGE_MIN_USDT;

  els.heroRangeValue.textContent = isValidRange ? formatShortRange(lower, upper) : formatShortRange(preset.lower, preset.upper);
  els.heroTermValue.textContent = `${term.label} window`;
  els.rangeStatusPill.textContent = rangeState.marketStatus;
  els.submitButton.textContent = `Buy ${selectedSide} ${formatSharePrice(sharePrice)}`;

  els.rangeTicketSummary.innerHTML = `
    <div class="scenario-result">
      <span>${selectedSide} means</span>
      <strong>${selectedSide === "YES" ? "Silver resolves in range" : "Silver resolves outside range"}</strong>
    </div>
    <div class="scenario-result">
      <span>Share estimate</span>
      <strong>${formatShares(shares)} shares</strong>
    </div>
    <div class="scenario-result">
      <span>Resolution</span>
      <strong>${formatDate(settlementDate)}</strong>
    </div>
  `;

  els.submitButton.disabled = !rangeWalletConnected || rangeState.marketStatus !== "open" || !isValidRange || !isValidAmount;
}

function renderResolutionCountdown() {
  if (!els.resolutionCountdown) {
    return;
  }

  els.resolutionCountdown.textContent = formatCountdown(resolutionDateForSelectedTerm());
}

function renderStats() {
  const predictions = rangeState.predictions;
  const openPredictions = predictions.filter((prediction) => prediction.status === "open");
  const totalValue = predictions.reduce((sum, prediction) => sum + Number(prediction.usdtValue || 0), 0);
  const termCount = predictions.filter((prediction) => prediction.termId === selectedTermId).length;
  const market = selectedMarket();

  els.rangeStatsGrid.innerHTML = `
    <div class="stat">
      <span class="metric-label">Trades</span>
      <strong class="metric-value">${predictions.length}</strong>
    </div>
    <div class="stat">
      <span class="metric-label">Open Shares</span>
      <strong class="metric-value">${openPredictions.length}</strong>
    </div>
    <div class="stat">
      <span class="metric-label">YES Price</span>
      <strong class="metric-value">${formatSharePrice(market.yesPrice)}</strong>
    </div>
    <div class="stat">
      <span class="metric-label">NO Price</span>
      <strong class="metric-value">${formatSharePrice(market.noPrice)}</strong>
    </div>
    <div class="stat">
      <span class="metric-label">Total Volume</span>
      <strong class="metric-value">${formatAmount(totalValue, "USDT")}</strong>
    </div>
    <div class="stat">
      <span class="metric-label">Term Activity</span>
      <strong class="metric-value">${termCount} ${selectedTerm().shortLabel}</strong>
    </div>
  `;
}

function renderProfile() {
  const predictions = [...rangeState.predictions]
    .filter((prediction) => prediction.wallet === RANGE_DEMO_WALLET)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (!predictions.length) {
    els.rangeProfilePanel.innerHTML = `<div class="empty-state">No range predictions yet.</div>`;
    return;
  }

  els.rangeProfilePanel.innerHTML = `
    <div class="range-table">
      <div class="range-table-row range-table-head">
        <span>Wallet</span>
        <span>Term</span>
        <span>Side</span>
        <span>Shares</span>
        <span>Avg Price</span>
        <span>Status</span>
        <span>Result</span>
      </div>
      ${predictions.map((prediction) => `
        <div class="range-table-row ${prediction.result === "won" ? "is-winner" : ""}">
          <span>${shortWallet(prediction.wallet)}</span>
          <span>${escapeHtml(prediction.termLabel)}</span>
          <span>${escapeHtml(prediction.side || "YES")}</span>
          <span>${formatShares(prediction.shares || 0)}</span>
          <span>${formatSharePrice(prediction.sharePrice || 0)}</span>
          <span>${escapeHtml(prediction.status)}</span>
          <span>${prediction.result ? escapeHtml(prediction.result) : "-"}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderWalletButton() {
  els.walletButton.textContent = rangeWalletConnected ? `${shortWallet(RANGE_DEMO_WALLET)}` : "Connect Wallet";
}

function renderAll() {
  renderSpotMetrics();
  renderWalletButton();
  renderTermControls();
  renderPresetList();
  renderSharePriceChart();
  renderOrderBook();
  renderMarketViewTabs();
  renderAmountConversion();
  renderTicketSummary();
  renderStats();
  renderProfile();
}

function renderMarketViewTabs() {
  const showChart = selectedMarketView === "chart";
  els.chartTabButton.classList.toggle("is-active", showChart);
  els.orderBookTabButton.classList.toggle("is-active", !showChart);
  els.chartTabButton.setAttribute("aria-selected", String(showChart));
  els.orderBookTabButton.setAttribute("aria-selected", String(!showChart));
  els.sharePriceChart.classList.toggle("is-active", showChart);
  els.orderBookPanel.classList.toggle("is-active", !showChart);
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(rangeToastTimer);
  rangeToastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
}

function setPreset(presetId) {
  const preset = RANGE_PRESETS.find((item) => item.id === presetId);
  if (!preset) {
    return;
  }

  selectedPresetId = preset.id;
  selectedTermId = preset.term;
  renderAll();
}

function setTerm(termId) {
  const termPresets = presetsForTerm(termId);
  if (!termPresets.length) {
    return;
  }

  selectedTermId = termId;
  selectedPresetId = termPresets[0].id;
  renderAll();
}

function setAsset(asset) {
  const previousUsdtValue = amountToUsdt(els.rangeAmountInput.value, selectedAsset);
  selectedAsset = asset;
  els.rangeUsdtButton.classList.toggle("is-active", selectedAsset === "USDT");
  els.rangeSttButton.classList.toggle("is-active", selectedAsset === "STT");

  if (previousUsdtValue > 0) {
    const converted = usdtToAsset(previousUsdtValue, selectedAsset);
    els.rangeAmountInput.value = converted.toFixed(selectedAsset === "USDT" ? 2 : 4).replace(/\.?0+$/, "");
  }

  renderAll();
}

function setSide(side) {
  selectedSide = side === "NO" ? "NO" : "YES";
  renderAll();
}

function setMarketView(view) {
  selectedMarketView = view === "order-book" ? "order-book" : "chart";
  renderMarketViewTabs();
}

function submitPrediction() {
  if (!rangeWalletConnected) {
    showToast("Connect the demo wallet first.");
    return;
  }

  if (rangeState.marketStatus !== "open") {
    showToast(`Range prediction is ${rangeState.marketStatus}.`);
    return;
  }

  const { lower, upper, amount } = currentInputs();
  const usdtValue = amountToUsdt(amount, selectedAsset);
  const market = selectedMarket();
  const sharePrice = priceForSide(selectedSide, market);

  if (!Number.isFinite(lower) || !Number.isFinite(upper) || lower >= upper) {
    showToast("Select a valid range market.");
    return;
  }

  if (!Number.isFinite(usdtValue) || usdtValue < RANGE_MIN_USDT) {
    showToast("Minimum participation is 1 USDT equivalent.");
    return;
  }

  const prediction = createPredictionRecord({
    wallet: RANGE_DEMO_WALLET,
    termId: selectedTermId,
    presetId: selectedPresetId,
    lower,
    upper,
    asset: selectedAsset,
    amount,
    side: selectedSide,
    sharePrice
  });

  rangeState.predictions.push(prediction);
  saveRangeState();
  renderAll();
  showToast(`Bought ${formatShares(prediction.shares)} ${selectedSide} shares at ${formatSharePrice(sharePrice)}.`);
}

function settleOpenPredictions(finalPrice) {
  const price = Number(finalPrice);
  if (!Number.isFinite(price) || price <= 0) {
    showToast("Enter a valid final reference price.");
    return;
  }

  let settledCount = 0;
  rangeState.predictions = rangeState.predictions.map((prediction) => {
    if (prediction.status !== "open") {
      return prediction;
    }

    settledCount += 1;
    const inRange = price >= prediction.lower && price <= prediction.upper;
    const winningSide = inRange ? "YES" : "NO";
    const won = (prediction.side || "YES") === winningSide;
    return {
      ...prediction,
      status: "settled",
      result: won ? "won" : "lost",
      outcomeSide: winningSide,
      payoutUsdt: won ? Number(prediction.shares || 0) : 0,
      settlementPrice: price,
      updatedAt: new Date().toISOString()
    };
  });
  rangeState.marketStatus = "settled";
  saveRangeState();
  renderAll();
  showToast(`Settled ${settledCount} open prediction${settledCount === 1 ? "" : "s"}.`);
}

function bindEvents() {
  els.walletButton.addEventListener("click", () => {
    rangeWalletConnected = !rangeWalletConnected;
    localStorage.setItem(RANGE_WALLET_KEY, String(rangeWalletConnected));
    renderAll();
    showToast(rangeWalletConnected ? "Demo wallet connected." : "Demo wallet disconnected.");
  });

  document.querySelectorAll("[data-term]").forEach((button) => {
    button.addEventListener("click", () => setTerm(button.dataset.term));
  });

  els.rangePresetList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset-id]");
    if (button) {
      setPreset(button.dataset.presetId);
    }
  });

  els.rangeAmountInput.addEventListener("input", renderAll);

  els.rangeUsdtButton.addEventListener("click", () => setAsset("USDT"));
  els.rangeSttButton.addEventListener("click", () => setAsset("STT"));
  ["pointerdown", "click"].forEach((eventName) => {
    els.buyYesButton.addEventListener(eventName, () => setSide("YES"));
    els.buyNoButton.addEventListener(eventName, () => setSide("NO"));
  });
  els.chartTabButton.addEventListener("click", () => setMarketView("chart"));
  els.orderBookTabButton.addEventListener("click", () => setMarketView("order-book"));
  document.addEventListener("click", (event) => {
    const tab = event.target.closest("[data-market-view]");
    if (tab) {
      setMarketView(tab.dataset.marketView);
    }
  });
  els.submitButton.addEventListener("click", submitPrediction);

  els.resetRangeButton.addEventListener("click", () => {
    rangeState = { marketStatus: "open", predictions: seedPredictions() };
    saveRangeState();
    renderAll();
    showToast("Range prediction demo reset.");
  });

  els.adminMarketStatus.addEventListener("change", () => {
    rangeState.marketStatus = els.adminMarketStatus.value;
    saveRangeState();
    renderAll();
  });

  els.adminForm.addEventListener("submit", (event) => {
    event.preventDefault();
    settleOpenPredictions(els.adminFinalPrice.value);
  });
}

function init() {
  window.setRangeMarketView = setMarketView;
  els.rangeAmountInput.value = "1";
  els.adminMarketStatus.value = rangeState.marketStatus;
  bindEvents();
  renderAll();
  clearInterval(resolutionTimer);
  resolutionTimer = setInterval(renderResolutionCountdown, 1000);
}

init();
