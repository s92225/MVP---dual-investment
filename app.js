const PRODUCTS = [
  {
    id: "buy-low-aggressive",
    mode: "buy-low",
    choice: "Aggressive",
    userAction: "Deposit USDT",
    summary: "Deposit USDT and choose a lower STT accumulation price.",
    strike: 72.5,
    exerciseDate: "25 Jun 2026",
    modelPremium: 3.67,
    rewardPerUnit: 2.39,
    rewardUnit: "STT-equivalent",
    periodYield: 0.0316,
    apr: 0.296,
    depositAsset: "USDT",
    primaryOutcome: "If silver stays above target, USDT principal returns with estimated yield.",
    conversionOutcome: "If silver falls to or below target, USDT is used to buy STT at the target price."
  },
  {
    id: "buy-low-balanced",
    mode: "buy-low",
    choice: "Balanced",
    userAction: "Deposit USDT",
    summary: "Deposit USDT and choose a lower STT accumulation price.",
    strike: 70,
    exerciseDate: "25 Jun 2026",
    modelPremium: 2.676,
    rewardPerUnit: 1.74,
    rewardUnit: "STT-equivalent",
    periodYield: 0.023,
    apr: 0.216,
    depositAsset: "USDT",
    primaryOutcome: "If silver stays above target, USDT principal returns with estimated yield.",
    conversionOutcome: "If silver falls to or below target, USDT is used to buy STT at the target price."
  },
  {
    id: "buy-low-conservative",
    mode: "buy-low",
    choice: "Conservative",
    userAction: "Deposit USDT",
    summary: "Deposit USDT and choose a lower STT accumulation price.",
    strike: 65,
    exerciseDate: "25 Jun 2026",
    modelPremium: 1.335,
    rewardPerUnit: 0.87,
    rewardUnit: "STT-equivalent",
    periodYield: 0.0115,
    apr: 0.108,
    depositAsset: "USDT",
    primaryOutcome: "If silver stays above target, USDT principal returns with estimated yield.",
    conversionOutcome: "If silver falls to or below target, USDT is used to buy STT at the target price."
  },
  {
    id: "sell-high-aggressive",
    mode: "sell-high",
    choice: "Aggressive",
    userAction: "Stake STT",
    summary: "Stake STT and choose a higher target sell price.",
    strike: 77.5,
    exerciseDate: "25 Jun 2026",
    modelPremium: 4.557,
    rewardPerUnit: 2.96,
    rewardUnit: "STT",
    periodYield: 0.0392,
    apr: 0.367,
    depositAsset: "STT",
    primaryOutcome: "If silver stays below target, STT principal returns with estimated yield.",
    conversionOutcome: "If silver reaches or exceeds target, STT is sold at the target price."
  },
  {
    id: "sell-high-balanced",
    mode: "sell-high",
    choice: "Balanced",
    userAction: "Stake STT",
    summary: "Stake STT and choose a higher target sell price.",
    strike: 80,
    exerciseDate: "25 Jun 2026",
    modelPremium: 3.721,
    rewardPerUnit: 2.42,
    rewardUnit: "STT",
    periodYield: 0.032,
    apr: 0.3,
    depositAsset: "STT",
    primaryOutcome: "If silver stays below target, STT principal returns with estimated yield.",
    conversionOutcome: "If silver reaches or exceeds target, STT is sold at the target price."
  },
  {
    id: "sell-high-conservative",
    mode: "sell-high",
    choice: "Conservative",
    userAction: "Stake STT",
    summary: "Stake STT and choose a higher target sell price.",
    strike: 85,
    exerciseDate: "25 Jun 2026",
    modelPremium: 2.5,
    rewardPerUnit: 1.63,
    rewardUnit: "STT",
    periodYield: 0.0215,
    apr: 0.201,
    depositAsset: "STT",
    primaryOutcome: "If silver stays below target, STT principal returns with estimated yield.",
    conversionOutcome: "If silver reaches or exceeds target, STT is sold at the target price."
  }
];

const STORAGE_KEY = "silvertimes-earn-positions";
const SPOT_PRICE = {
  value: 75.5,
  unit: "USD / oz",
  asOf: "May 18, 2026 12:29 PM HKT",
  source: "Barchart"
};
const STT_PER_SPOT_UNIT = 1;
const CHART_BOUNDS = { floor: 55, ceiling: 95 };
const CHART_PATH_PRICES = [80, 77, 78, 74, 71, 70, 73, SPOT_PRICE.value];
const EXPIRY_APR_MULTIPLIERS = {
  "term-1m": 1,
  "term-3m": 0.82,
  "term-6m": 0.64
};
const EXPIRY_FAMILIES = {
  monthly: [
    { id: "term-1m", label: "1 Month", shortLabel: "1M", days: 30, months: 1 },
    { id: "term-3m", label: "3 Months", shortLabel: "3M", days: 90, months: 3 },
    { id: "term-6m", label: "6 Months", shortLabel: "6M", days: 180, months: 6 }
  ]
};

let currentMode = "buy-low";
let selectedProductId = "buy-low-aggressive";
let selectedExpiryFamily = "monthly";
let selectedExpiryId = "term-1m";
let walletConnected = false;
let toastTimer = null;
let depositAmountValue = "";
let selectedAmountAsset = "USDT";
let pendingOrder = null;
let confirmCountdownTimer = null;
let confirmCountdownRemaining = 0;
const scenarioPrices = {};

const productList = document.querySelector("#productList");
const detailContent = document.querySelector("#detailContent");
const productListTitle = document.querySelector("#productListTitle");
const modeSummary = document.querySelector("#modeSummary");
const positionsList = document.querySelector("#positionsList");
const settlementProduct = document.querySelector("#settlementProduct");
const settlementForm = document.querySelector("#settlementForm");
const finalPriceInput = document.querySelector("#finalPriceInput");
const walletButton = document.querySelector("#walletButton");
const clearPositionsButton = document.querySelector("#clearPositionsButton");
const toast = document.querySelector("#toast");
const heroApr = document.querySelector("#heroApr");
const heroTerm = document.querySelector("#heroTerm");
const expiryList = document.querySelector("#expiryList");
const spotPricePill = document.querySelector("#spotPricePill");
const spotPriceInline = document.querySelector("#spotPriceInline");
const spotPriceHeader = document.querySelector("#spotPriceHeader");
const controlsRow = document.querySelector(".controls-row");
const confirmModal = document.querySelector("#confirmModal");
const confirmSummary = document.querySelector("#confirmSummary");
const confirmTerms = document.querySelector("#confirmTerms");
const confirmDepositButton = document.querySelector("#confirmDepositButton");
const cancelConfirmButton = document.querySelector("#cancelConfirmButton");

function formatUsd(value) {
  return `US$${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

function formatNumber(value, digits = 4) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
}

function formatTokenAmount(value, asset) {
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: asset === "USDT" ? 2 : 0,
    maximumFractionDigits: asset === "USDT" ? 2 : 4
  })} ${asset}`;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(2).replace(/\.00$/, "")}%`;
}

function formatInputValue(value) {
  return String(value).replace(/"/g, "&quot;");
}

function formatAmountInputValue(value, asset) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return "";
  }

  const digits = asset === "USDT" ? 2 : 4;
  return amount
    .toFixed(digits)
    .replace(/\.?0+$/, "");
}

function sttReferencePrice(price = SPOT_PRICE.value) {
  return price / STT_PER_SPOT_UNIT;
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

function settlementDateForExpiry(expiry = selectedExpiry(), startDate = new Date()) {
  if (expiry.months) {
    return addCalendarMonths(startDate, expiry.months);
  }

  const date = new Date(startDate);
  date.setDate(date.getDate() + expiry.days);
  return date;
}

function formatSettlementDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(date));
}

function renderSpotPrice() {
  const priceMarkup = `
    <span>Spot silver</span>
    <strong>${formatUsd(SPOT_PRICE.value)}</strong>
    <small>${SPOT_PRICE.unit}</small>
  `;
  spotPricePill.innerHTML = priceMarkup;
  spotPriceInline.innerHTML = `
    <span>Spot</span>
    <strong>${formatUsd(SPOT_PRICE.value)}</strong>
    <small>${SPOT_PRICE.asOf}</small>
  `;
  spotPriceHeader.innerHTML = `
    <span>Spot</span>
    <strong>${formatUsd(SPOT_PRICE.value)}</strong>
    <small>${SPOT_PRICE.asOf}</small>
  `;
}

function productApr(product) {
  const expiry = selectedExpiry();
  return product.apr * (EXPIRY_APR_MULTIPLIERS[expiry.id] || 1);
}

function termAdjustedYield(product) {
  const expiry = selectedExpiry();
  return productApr(product) * (expiry.days / 365);
}

function selectedExpiry() {
  return Object.values(EXPIRY_FAMILIES)
    .flat()
    .find((expiry) => expiry.id === selectedExpiryId) || EXPIRY_FAMILIES.monthly[0];
}

function expiryLabel() {
  const expiry = selectedExpiry();
  return `${expiry.label} / ${formatSettlementDate(settlementDateForExpiry(expiry))}`;
}

function expiryShortLabel() {
  return selectedExpiry().shortLabel;
}

function expiryProductLabel() {
  const expiry = selectedExpiry();
  return `${expiry.shortLabel} / ${formatSettlementDate(settlementDateForExpiry(expiry))}`;
}

function positionExpiryLabel(position) {
  const expiry = Object.values(EXPIRY_FAMILIES)
    .flat()
    .find((item) => item.id === position.expiryId) || EXPIRY_FAMILIES.monthly[0];
  const settlementDate = position.expiryDate
    ? new Date(position.expiryDate)
    : settlementDateForExpiry(expiry, position.createdAt ? new Date(position.createdAt) : new Date());

  return `${expiry.label} / ${formatSettlementDate(settlementDate)}`;
}

function renderExpiryOptions() {
  expiryList.innerHTML = EXPIRY_FAMILIES[selectedExpiryFamily]
    .map((expiry) => {
      const active = expiry.id === selectedExpiryId ? " is-active" : "";
      const settlementDate = formatSettlementDate(settlementDateForExpiry(expiry));
      return `
        <button class="expiry-option${active}" type="button" data-expiry="${expiry.id}" role="tab" aria-selected="${expiry.id === selectedExpiryId}" aria-label="${expiry.label}, settlement ${settlementDate}">
          <span>${expiry.shortLabel}</span>
        </button>
      `;
    })
    .join("");
}

function modeLabel(mode) {
  return mode === "buy-low" ? "Buy Low" : "Sell High";
}

function getProduct(productId) {
  return PRODUCTS.find((product) => product.id === productId);
}

function loadPositions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function savePositions(positions) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function stopConfirmCountdown() {
  clearInterval(confirmCountdownTimer);
  confirmCountdownTimer = null;
  confirmCountdownRemaining = 0;
  confirmDepositButton.textContent = "Confirm";
  confirmDepositButton.disabled = true;
}

function startConfirmCountdown() {
  stopConfirmCountdown();
  confirmCountdownRemaining = 5;
  confirmDepositButton.textContent = `Confirm (${confirmCountdownRemaining}s)`;
  confirmDepositButton.disabled = true;

  confirmCountdownTimer = setInterval(() => {
    confirmCountdownRemaining -= 1;

    if (confirmCountdownRemaining <= 0) {
      clearInterval(confirmCountdownTimer);
      confirmCountdownTimer = null;
      confirmDepositButton.textContent = "Confirm";
      confirmDepositButton.disabled = !confirmTerms.checked;
      return;
    }

    confirmDepositButton.textContent = `Confirm (${confirmCountdownRemaining}s)`;
  }, 1000);
}

function closeConfirmModal() {
  pendingOrder = null;
  confirmTerms.checked = false;
  stopConfirmCountdown();
  confirmModal.hidden = true;
}

function renderTabs() {
  document.querySelectorAll(".segment").forEach((button) => {
    const isActive = button.dataset.mode === currentMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  renderExpiryOptions();
  heroTerm.textContent = "1M / 3M / 6M";
  heroApr.textContent = formatPercent(Math.max(...PRODUCTS.map((product) => productApr(product))));
}

function renderProductList() {
  const products = PRODUCTS.filter((product) => product.mode === currentMode);
  const firstProduct = products[0];

  if (!products.some((product) => product.id === selectedProductId)) {
    selectedProductId = firstProduct.id;
  }

  productListTitle.textContent = modeLabel(currentMode);
  const avgApr = products.reduce((sum, product) => sum + productApr(product), 0) / products.length;
  modeSummary.innerHTML = `
    <span style="--fill: ${Math.min(100, Math.round(avgApr * 320))}%"></span>
    <strong>${formatPercent(avgApr)} avg APY</strong>
  `;

  productList.innerHTML = products
    .map((product) => {
      const selectedClass = product.id === selectedProductId ? " is-selected" : "";
      const quote = quoteForAmount(product, 1, "STT");
      return `
        <button class="product-row${selectedClass}" type="button" data-product-id="${product.id}">
          <span class="product-title">
            <strong>${product.choice}</strong>
          </span>
          <span class="metric">
            <span class="metric-label">Strike</span>
            <span class="metric-value">${formatUsd(product.strike)}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Potential Earning</span>
            <span class="metric-value">${formatUsd(quote.rewardValue)}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Settlement</span>
            <span class="metric-value">${expiryProductLabel()}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function amountToProductAsset(product, inputAmount, inputAsset = selectedAmountAsset) {
  if (!inputAmount || inputAmount <= 0) {
    return 0;
  }

  if (inputAsset === product.depositAsset) {
    return inputAmount;
  }

  return product.depositAsset === "USDT"
    ? inputAmount * sttReferencePrice()
    : inputAmount / sttReferencePrice();
}

function equivalentAmount(inputAmount, inputAsset) {
  if (!inputAmount || inputAmount <= 0) {
    return null;
  }

  if (inputAsset === "USDT") {
    return {
      asset: "STT",
      amount: inputAmount / sttReferencePrice()
    };
  }

  return {
    asset: "USDT",
    amount: inputAmount * sttReferencePrice()
  };
}

function amountConversionText(inputAmount, inputAsset) {
  const equivalent = equivalentAmount(inputAmount, inputAsset);

  if (!equivalent) {
    return `Input USDT or STT; converted at spot ${formatUsd(SPOT_PRICE.value)}.`;
  }

  return `${formatTokenAmount(inputAmount, inputAsset)} ~${formatTokenAmount(equivalent.amount, equivalent.asset)}`;
}

function quoteForDepositAmount(product, depositAmount) {
  if (!depositAmount || depositAmount <= 0) {
    return null;
  }

  const adjustedYield = termAdjustedYield(product);
  const amount = depositAmount;

  if (product.mode === "buy-low") {
    const rewardValue = amount * adjustedYield;
    const notionalStt = amount / sttReferencePrice();
    return {
      depositAmount: amount,
      rewardValue,
      rewardAsset: "USDT value",
      earningPerStt: notionalStt ? rewardValue / notionalStt : 0,
      noConversionAmount: amount + rewardValue,
      noConversionAsset: "USDT",
      conversionAmount: (amount + rewardValue) / sttReferencePrice(product.strike),
      conversionAsset: "STT"
    };
  }

  const targetUsdtPerStt = sttReferencePrice(product.strike);
  const rewardValue = amount * adjustedYield * targetUsdtPerStt;
  return {
    depositAmount: amount,
    rewardValue,
    rewardAsset: "USDT value",
    earningPerStt: rewardValue / amount,
    noConversionAmount: amount + rewardValue / targetUsdtPerStt,
    noConversionAsset: "STT",
    conversionAmount: amount * targetUsdtPerStt + rewardValue,
    conversionAsset: "USDT"
  };
}

function quoteForAmount(product, inputAmount, inputAsset = selectedAmountAsset) {
  return quoteForDepositAmount(product, amountToProductAsset(product, inputAmount, inputAsset));
}

function scenarioBounds(product) {
  return CHART_BOUNDS;
}

function scenarioPriceFor(product) {
  const saved = scenarioPrices[product.id];
  if (saved) {
    return saved;
  }
  return SPOT_PRICE.value;
}

function priceToY(price, bounds) {
  const ratio = (price - bounds.floor) / (bounds.ceiling - bounds.floor);
  return 156 - Math.max(0, Math.min(1, ratio)) * 106;
}

function scenarioOutcome(product, quote, price) {
  if (!quote) {
    return {
      label: "Payout preview",
      value: "Enter amount above",
      tone: "neutral"
    };
  }

  const converts = product.mode === "buy-low" ? price <= product.strike : price >= product.strike;

  if (!converts && product.mode === "buy-low") {
    return {
      label: "USDT back",
      value: formatTokenAmount(quote.noConversionAmount, quote.noConversionAsset),
      tone: "primary"
    };
  }

  if (converts && product.mode === "buy-low") {
    return {
      label: "Buy STT",
      value: formatTokenAmount(quote.conversionAmount, quote.conversionAsset),
      tone: "convert"
    };
  }

  if (!converts) {
    return {
      label: "STT back",
      value: formatTokenAmount(quote.noConversionAmount, quote.noConversionAsset),
      tone: "primary"
    };
  }

  return {
    label: "Sell STT",
    value: formatTokenAmount(quote.conversionAmount, quote.conversionAsset),
    tone: "convert"
  };
}

function scenarioBreakdown(product, quote, outcome) {
  if (!quote) {
    return "Enter an amount to preview principal, earning, and settlement conversion.";
  }

  if (product.mode === "buy-low" && outcome.tone === "convert") {
    return `${formatUsd(quote.depositAmount)} USDT principal + ${formatUsd(quote.rewardValue)} earning, converted at ${formatUsd(product.strike)} = ${formatTokenAmount(quote.conversionAmount, "STT")}.`;
  }

  if (product.mode === "buy-low") {
    return `${formatUsd(quote.depositAmount)} USDT principal + ${formatUsd(quote.rewardValue)} earning returns as ${formatTokenAmount(quote.noConversionAmount, "USDT")}.`;
  }

  if (outcome.tone === "convert") {
    return `${formatTokenAmount(quote.depositAmount, "STT")} principal sold at ${formatUsd(product.strike)} + ${formatUsd(quote.rewardValue)} earning = ${formatTokenAmount(quote.conversionAmount, "USDT")}.`;
  }

  return `${formatTokenAmount(quote.depositAmount, "STT")} principal + ${formatUsd(quote.rewardValue)} earning value returns as ${formatTokenAmount(quote.noConversionAmount, "STT")}.`;
}

function renderScenarioChart(product, quote, scenarioPrice) {
  const bounds = scenarioBounds(product);
  const targetY = priceToY(product.strike, bounds);
  const currentY = priceToY(SPOT_PRICE.value, bounds);
  const scenarioY = priceToY(scenarioPrice, bounds);
  const xPoints = [26, 64, 102, 140, 178, 216, 254, 292, 330];
  const currentX = xPoints[7];
  const scenarioX = xPoints[8];
  const rewardLabel = quote ? `~${formatUsd(quote.rewardValue)}` : "-";
  const outcome = scenarioOutcome(product, quote, scenarioPrice);
  const breakdown = scenarioBreakdown(product, quote, outcome);
  const prices = [...CHART_PATH_PRICES, scenarioPrice];
  const points = prices.map((price, index) => {
    const x = xPoints[index];
    return `${x},${priceToY(price, bounds).toFixed(1)}`;
  });

  return `
    <div class="scenario-chart ${quote ? "" : "is-empty"}" data-outcome="${outcome.tone}">
      <div class="chart-header">
        <span>Potential Earning</span>
        <strong>${rewardLabel}</strong>
      </div>
      <div class="line-chart" aria-label="Interactive payout scenario">
        <svg viewBox="0 0 360 188" role="img" aria-label="Settlement scenario chart">
          <line class="chart-grid-line" x1="24" x2="336" y1="${targetY.toFixed(1)}" y2="${targetY.toFixed(1)}"></line>
          <line class="chart-expiry-line" x1="${scenarioX}" x2="${scenarioX}" y1="32" y2="166"></line>
          <polyline class="chart-path" points="${points.join(" ")}"></polyline>
          <circle class="chart-current-dot" cx="${currentX}" cy="${currentY.toFixed(1)}" r="5"></circle>
          <circle class="chart-settle-dot" cx="${scenarioX}" cy="${scenarioY.toFixed(1)}" r="5"></circle>
          <text class="chart-tag" x="26" y="${Math.max(22, targetY - 8).toFixed(1)}">Target ${formatUsd(product.strike)}</text>
          <text class="chart-tooltip" x="224" y="${Math.max(28, currentY - 18).toFixed(1)}">Spot ${formatUsd(SPOT_PRICE.value)}</text>
          <text class="chart-price" x="296" y="${Math.min(176, scenarioY + 20).toFixed(1)}">${formatUsd(scenarioPrice)}</text>
          <text class="chart-axis" x="24" y="181">Today</text>
          <text class="chart-axis" x="286" y="181">Settlement</text>
        </svg>
      </div>
      <label class="scenario-slider">
        <span>Settlement Price</span>
        <strong id="scenarioPriceLabel">${formatUsd(scenarioPrice)}</strong>
        <input
          id="scenarioPrice"
          type="range"
          min="${bounds.floor}"
          max="${bounds.ceiling}"
          step="0.1"
          value="${scenarioPrice}"
          aria-label="Settlement Price"
        >
      </label>
      <div class="scenario-result">
        <span>${outcome.label}</span>
        <strong>${outcome.value}</strong>
      </div>
      <p class="scenario-breakdown">${breakdown}</p>
    </div>
  `;
}

function updateScenarioView(product, quote, price) {
  const quoteBox = document.querySelector("#quoteBox");
  const bounds = scenarioBounds(product);
  const scenarioY = priceToY(price, bounds);
  const outcome = scenarioOutcome(product, quote, price);
  const priceLabel = quoteBox.querySelector("#scenarioPriceLabel");
  const settleDot = quoteBox.querySelector(".chart-settle-dot");
  const chartPrice = quoteBox.querySelector(".chart-price");
  const result = quoteBox.querySelector(".scenario-result");
  const breakdown = quoteBox.querySelector(".scenario-breakdown");
  const chart = quoteBox.querySelector(".scenario-chart");
  const path = quoteBox.querySelector(".chart-path");

  if (priceLabel) {
    priceLabel.textContent = formatUsd(price);
  }

  if (settleDot) {
    settleDot.setAttribute("cy", scenarioY.toFixed(1));
  }

  if (chartPrice) {
    chartPrice.textContent = formatUsd(price);
    chartPrice.setAttribute("y", Math.min(176, scenarioY + 20).toFixed(1));
  }

  if (path) {
    const xPoints = [26, 64, 102, 140, 178, 216, 254, 292, 330];
    const prices = [...CHART_PATH_PRICES, price];
    path.setAttribute("points", prices.map((point, index) => `${xPoints[index]},${priceToY(point, bounds).toFixed(1)}`).join(" "));
  }

  if (chart) {
    chart.dataset.outcome = outcome.tone;
  }

  if (result) {
    result.innerHTML = `
      <span>${outcome.label}</span>
      <strong>${outcome.value}</strong>
    `;
  }

  if (breakdown) {
    breakdown.textContent = scenarioBreakdown(product, quote, outcome);
  }
}

function updateRewardPreview(product, quote) {
  const rewardValue = document.querySelector("#detailRewardValue");
  if (!rewardValue) {
    return;
  }

  rewardValue.textContent = quote ? formatUsd(quote.rewardValue) : "Enter amount";
}

function renderQuote(product) {
  const amountInput = document.querySelector("#depositAmount");
  const quoteBox = document.querySelector("#quoteBox");
  const amount = Number(amountInput.value);
  const quote = quoteForAmount(product, amount);
  const scenarioPrice = scenarioPriceFor(product);

  quoteBox.innerHTML = renderScenarioChart(product, quote, scenarioPrice);
  updateRewardPreview(product, quote);
  updateAmountConversion();

  const scenarioInput = document.querySelector("#scenarioPrice");
  scenarioInput.addEventListener("input", () => {
    scenarioPrices[product.id] = Number(scenarioInput.value);
    updateScenarioView(product, quote, scenarioPrices[product.id]);
  });
}

function renderDetail() {
  const product = getProduct(selectedProductId);
  const amount = Number(depositAmountValue);
  const quote = quoteForAmount(product, amount);

  detailContent.innerHTML = `
    <div class="detail-stack">
      <div class="detail-header">
        <h3 id="detailTitle">${product.choice}</h3>
        <div class="info-popover">
          <button class="info-button" type="button" aria-describedby="settlementTooltip">Settlement rules</button>
          <div id="settlementTooltip" class="tooltip" role="tooltip">
            <strong>${product.mode === "buy-low" ? "Above target" : "Below target"}:</strong>
            ${product.mode === "buy-low" ? "USDT back." : "STT back."}
            <strong>${product.mode === "buy-low" ? "At or below" : "At or above"}:</strong>
            ${product.mode === "buy-low" ? "Buy STT at target." : "Sell STT at target."}
          </div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat">
          <span class="metric-label">Strike Price</span>
          <strong class="metric-value">${formatUsd(product.strike)}</strong>
        </div>
        <div class="stat">
          <span class="metric-label">Settlement</span>
          <strong class="metric-value">${expiryLabel()}</strong>
        </div>
        <div class="stat">
          <span class="metric-label">APY</span>
          <strong class="metric-value">${formatPercent(productApr(product))}</strong>
        </div>
        <div class="stat">
          <span class="metric-label">Potential Earning</span>
          <strong id="detailRewardValue" class="metric-value">${quote ? formatUsd(quote.rewardValue) : "Enter amount"}</strong>
        </div>
      </div>

      <form id="depositForm" class="deposit-form">
        <div class="amount-field">
          <div class="amount-heading">
            <label for="depositAmount">Invest Amount</label>
            <div class="amount-unit-toggle" role="tablist" aria-label="Amount currency">
              <button class="${selectedAmountAsset === "USDT" ? "is-active" : ""}" type="button" data-amount-asset="USDT" role="tab" aria-selected="${selectedAmountAsset === "USDT"}">USDT</button>
              <button class="${selectedAmountAsset === "STT" ? "is-active" : ""}" type="button" data-amount-asset="STT" role="tab" aria-selected="${selectedAmountAsset === "STT"}">STT</button>
            </div>
          </div>
          <input id="depositAmount" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off" value="${formatInputValue(depositAmountValue)}">
          <div id="amountConversion" class="amount-conversion">
            ${amountConversionText(amount, selectedAmountAsset)}
          </div>
        </div>
        <button class="primary-button" type="submit">${product.userAction}</button>
      </form>
    </div>
  `;

  const amountInput = document.querySelector("#depositAmount");
  const depositForm = document.querySelector("#depositForm");
  document.querySelectorAll("[data-amount-asset]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextAsset = button.dataset.amountAsset;
      const inputAmount = Number(depositAmountValue);

      if (nextAsset === selectedAmountAsset) {
        return;
      }

      if (inputAmount > 0) {
        const equivalent = equivalentAmount(inputAmount, selectedAmountAsset);
        depositAmountValue = formatAmountInputValue(equivalent.amount, nextAsset);
      }

      selectedAmountAsset = nextAsset;
      renderDetail();
    });
  });
  amountInput.addEventListener("input", () => {
    depositAmountValue = amountInput.value;
    renderQuote(product);
  });
  depositForm.addEventListener("submit", (event) => handleDeposit(event, product));
  renderQuote(product);
}

function updateAmountConversion() {
  const conversion = document.querySelector("#amountConversion");
  if (!conversion) {
    return;
  }

  conversion.textContent = amountConversionText(Number(depositAmountValue), selectedAmountAsset);
}

function handleDeposit(event, product) {
  event.preventDefault();

  if (!walletConnected) {
    showToast("Connect the demo wallet first.");
    return;
  }

  const inputAmount = Number(document.querySelector("#depositAmount").value);
  const depositAmount = amountToProductAsset(product, inputAmount, selectedAmountAsset);

  if (!inputAmount || inputAmount <= 0) {
    showToast("Enter a deposit amount.");
    return;
  }

  const quote = quoteForAmount(product, inputAmount);
  const expiryDate = settlementDateForExpiry(selectedExpiry());
  const settlementLabel = expiryLabel();
  pendingOrder = {
    productId: product.id,
    inputAmount,
    inputAsset: selectedAmountAsset,
    depositAmount,
    depositAsset: product.depositAsset,
    expiryId: selectedExpiryId,
    expiryDate: expiryDate.toISOString(),
    expiryLabel: settlementLabel,
    quote
  };
  confirmSummary.innerHTML = `
    <span class="invest-summary">
      <small>Invest Amount</small>
      <strong>${amountConversionText(inputAmount, selectedAmountAsset)}</strong>
    </span>
    <span>
      <small>Settlement</small>
      <strong>${settlementLabel}</strong>
    </span>
    <span>
      <small>Potential earning</small>
      <strong>${formatUsd(quote.rewardValue)}</strong>
    </span>
  `;
  confirmTerms.checked = false;
  stopConfirmCountdown();
  confirmModal.hidden = false;
}

function confirmPendingOrder() {
  if (!pendingOrder || !confirmTerms.checked || confirmCountdownTimer || confirmCountdownRemaining > 0) {
    showToast("Review and accept the terms first.");
    return;
  }

  const product = getProduct(pendingOrder.productId);
  const positions = loadPositions();
  const position = {
    id: `POS-${Date.now()}`,
    productId: product.id,
    amount: pendingOrder.depositAmount,
    depositAsset: pendingOrder.depositAsset,
    inputAmount: pendingOrder.inputAmount,
    inputAsset: pendingOrder.inputAsset,
    expiryId: pendingOrder.expiryId,
    expiryLabel: pendingOrder.expiryLabel,
    expiryDate: pendingOrder.expiryDate,
    rewardValue: pendingOrder.quote.rewardValue,
    createdAt: new Date().toISOString(),
    status: "active"
  };

  positions.unshift(position);
  savePositions(positions);
  renderPositions();
  renderSettlementTerms();
  depositAmountValue = "";
  closeConfirmModal();
  renderDetail();
  showToast("Demo position created.");
}

function settlementForPosition(position, finalPrice) {
  const product = getProduct(position.productId);
  const previousExpiryId = selectedExpiryId;
  selectedExpiryId = position.expiryId || "term-1m";
  const quote = quoteForAmount(product, position.amount, product.depositAsset);
  selectedExpiryId = previousExpiryId;

  if (product.mode === "buy-low") {
    const converted = finalPrice <= product.strike;
    return {
      converted,
      finalPrice,
      outcome: converted ? "STT accumulated at target" : "USDT returned",
      payoutAmount: converted ? quote.conversionAmount : quote.noConversionAmount,
      payoutAsset: converted ? quote.conversionAsset : quote.noConversionAsset
    };
  }

  const converted = finalPrice >= product.strike;
  return {
    converted,
    finalPrice,
    outcome: converted ? "STT sold at target" : "STT returned",
    payoutAmount: converted ? quote.conversionAmount : quote.noConversionAmount,
    payoutAsset: converted ? quote.conversionAsset : quote.noConversionAsset
  };
}

function renderPositions() {
  const positions = loadPositions();

  if (!positions.length) {
    positionsList.innerHTML = `<div class="empty-state">No demo positions yet.</div>`;
    return;
  }

  positionsList.innerHTML = positions
    .map((position) => {
      const product = getProduct(position.productId);
      const result = position.settlement;
      const status = position.status === "claimed" ? "Claimed" : position.status === "settled" ? "Claimable" : "Active";
      const payout = result
        ? formatTokenAmount(result.payoutAmount, result.payoutAsset)
        : `~${formatUsd(position.rewardValue)} potential earning`;
      const action = position.status === "settled"
        ? `<button class="ghost-button compact" type="button" data-claim-id="${position.id}">Claim</button>`
        : `<span class="status-pill">${status}</span>`;

      return `
        <div class="position-row">
          <span class="product-title">
            <strong>${modeLabel(product.mode)} ${product.choice}</strong>
            <span>${positionExpiryLabel(position)} / ${position.id}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Deposit</span>
            <span class="metric-value">${formatTokenAmount(position.amount, position.depositAsset)}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Strike</span>
            <span class="metric-value">${formatUsd(product.strike)}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Status</span>
            <span class="metric-value">${status}</span>
          </span>
          <span class="metric">
            <span class="metric-label">${result ? result.outcome : "Estimate"}</span>
            <span class="metric-value">${payout}</span>
          </span>
          ${action}
        </div>
      `;
    })
    .join("");
}

function renderSettlementTerms() {
  settlementProduct.innerHTML = EXPIRY_FAMILIES.monthly.map((expiry) => {
    return `<option value="${expiry.id}">${expiry.shortLabel} silver price</option>`;
  }).join("");
}

function handleSettlement(event) {
  event.preventDefault();
  const expiryId = settlementProduct.value;
  const finalPrice = Number(finalPriceInput.value);

  if (!finalPrice || finalPrice <= 0) {
    showToast("Enter a silver price.");
    return;
  }

  const positions = loadPositions();
  let settledCount = 0;
  const updated = positions.map((position) => {
    const positionExpiryId = position.expiryId || "term-1m";
    if (positionExpiryId !== expiryId || position.status !== "active") {
      return position;
    }

    settledCount += 1;
    return {
      ...position,
      status: "settled",
      settlement: settlementForPosition(position, finalPrice)
    };
  });

  savePositions(updated);
  renderPositions();
  const selectedTerm = EXPIRY_FAMILIES.monthly.find((expiry) => expiry.id === expiryId);
  const termLabel = selectedTerm ? selectedTerm.shortLabel : "selected term";
  showToast(settledCount ? `${termLabel} silver price settled ${settledCount} position(s).` : `No active ${termLabel} positions.`);
}

function handleClaim(positionId) {
  const positions = loadPositions();
  const updated = positions.map((position) => {
    if (position.id !== positionId || position.status !== "settled") {
      return position;
    }
    return { ...position, status: "claimed", claimedAt: new Date().toISOString() };
  });
  savePositions(updated);
  renderPositions();
  showToast("Demo payout claimed.");
}

function syncStickyControls() {
  const controlsTop = controlsRow.getBoundingClientRect().top;
  const isStuck = window.scrollY > 180 && controlsTop <= 92;
  controlsRow.classList.toggle("is-stuck", isStuck);
  document.querySelector(".topbar").classList.toggle("has-spot", isStuck);
  document.body.classList.toggle("market-stuck", isStuck);
}

function wireEvents() {
  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      currentMode = button.dataset.mode;
      selectedProductId = PRODUCTS.find((product) => product.mode === currentMode).id;
      render();
    });
  });

  document.querySelectorAll(".term-segment").forEach((button) => {
    button.addEventListener("click", () => {
      selectedExpiryFamily = button.dataset.family;
      selectedExpiryId = EXPIRY_FAMILIES[selectedExpiryFamily][0].id;
      render();
    });
  });

  expiryList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-expiry]");
    if (!button) {
      return;
    }
    selectedExpiryId = button.dataset.expiry;
    render();
  });

  productList.addEventListener("click", (event) => {
    const row = event.target.closest("[data-product-id]");
    if (!row) {
      return;
    }
    selectedProductId = row.dataset.productId;
    renderProductList();
    renderDetail();
  });

  positionsList.addEventListener("click", (event) => {
    const claimButton = event.target.closest("[data-claim-id]");
    if (!claimButton) {
      return;
    }
    handleClaim(claimButton.dataset.claimId);
  });

  walletButton.addEventListener("click", () => {
    walletConnected = !walletConnected;
    walletButton.textContent = walletConnected ? "0x51...STT" : "Connect Wallet";
    showToast(walletConnected ? "Demo wallet connected." : "Demo wallet disconnected.");
  });

  clearPositionsButton.addEventListener("click", () => {
    savePositions([]);
    renderPositions();
    showToast("Demo positions cleared.");
  });

  confirmTerms.addEventListener("change", () => {
    if (confirmTerms.checked) {
      startConfirmCountdown();
      return;
    }

    stopConfirmCountdown();
  });

  cancelConfirmButton.addEventListener("click", () => {
    closeConfirmModal();
  });

  confirmDepositButton.addEventListener("click", confirmPendingOrder);

  confirmModal.addEventListener("click", (event) => {
    if (event.target === confirmModal) {
      closeConfirmModal();
    }
  });

  settlementForm.addEventListener("submit", handleSettlement);
  window.addEventListener("scroll", syncStickyControls, { passive: true });
  window.addEventListener("resize", syncStickyControls);
}

function render() {
  renderSpotPrice();
  renderTabs();
  renderProductList();
  renderDetail();
  renderPositions();
  renderSettlementTerms();
  syncStickyControls();
}

wireEvents();
render();
