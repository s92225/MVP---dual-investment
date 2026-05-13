const PRODUCTS = [
  {
    id: "buy-low-aggressive",
    mode: "buy-low",
    choice: "Aggressive",
    userAction: "Deposit USDT",
    summary: "Deposit USDT and choose a lower STT accumulation price.",
    comexReference: "Sell Put",
    strike: 77.5,
    exerciseDate: "25 Jun 2026",
    modelPremium: 4.17,
    rewardPerUnit: 2.71,
    rewardUnit: "STT-equivalent",
    periodYield: 0.0336,
    apr: 0.272,
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
    comexReference: "Sell Put",
    strike: 75,
    exerciseDate: "25 Jun 2026",
    modelPremium: 3.16,
    rewardPerUnit: 2.05,
    rewardUnit: "STT-equivalent",
    periodYield: 0.0254,
    apr: 0.206,
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
    comexReference: "Sell Put",
    strike: 70,
    exerciseDate: "25 Jun 2026",
    modelPremium: 1.64,
    rewardPerUnit: 1.06,
    rewardUnit: "STT-equivalent",
    periodYield: 0.0132,
    apr: 0.107,
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
    comexReference: "Sell Call",
    strike: 85,
    exerciseDate: "25 Jun 2026",
    modelPremium: 4.1,
    rewardPerUnit: 2.67,
    rewardUnit: "STT",
    periodYield: 0.033,
    apr: 0.268,
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
    comexReference: "Sell Call",
    strike: 90,
    exerciseDate: "25 Jun 2026",
    modelPremium: 2.61,
    rewardPerUnit: 1.7,
    rewardUnit: "STT",
    periodYield: 0.021,
    apr: 0.17,
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
    comexReference: "Sell Call",
    strike: 95,
    exerciseDate: "25 Jun 2026",
    modelPremium: 1.6,
    rewardPerUnit: 1.04,
    rewardUnit: "STT",
    periodYield: 0.0129,
    apr: 0.105,
    depositAsset: "STT",
    primaryOutcome: "If silver stays below target, STT principal returns with estimated yield.",
    conversionOutcome: "If silver reaches or exceeds target, STT is sold at the target price."
  }
];

const STORAGE_KEY = "silvertimes-dual-investment-positions";
const SPOT_PRICE = {
  value: 87.13,
  unit: "USD / oz",
  asOf: "May 11, 2026 10:59 PM ET",
  source: "Bullion.com"
};
const CHART_BOUNDS = { floor: 60, ceiling: 110 };
const CHART_PATH_PRICES = [92, 86, 88, 82, 78, 76, 83, SPOT_PRICE.value];
const EXPIRY_APR_MULTIPLIERS = {
  "weekly-2026-05-18": 1.22,
  "weekly-2026-05-19": 1.1,
  "weekly-2026-05-20": 0.98,
  "weekly-2026-05-21": 0.9,
  "weekly-2026-05-22": 0.84,
  "monthly-2026-06-25": 1,
  "monthly-2026-07-30": 0.84,
  "monthly-2026-08-27": 0.72
};
const EXPIRY_FAMILIES = {
  weekly: [
    { id: "weekly-2026-05-18", label: "Mon, 18 May", shortLabel: "18 May", days: 6 },
    { id: "weekly-2026-05-19", label: "Tue, 19 May", shortLabel: "19 May", days: 7 },
    { id: "weekly-2026-05-20", label: "Wed, 20 May", shortLabel: "20 May", days: 8 },
    { id: "weekly-2026-05-21", label: "Thu, 21 May", shortLabel: "21 May", days: 9 },
    { id: "weekly-2026-05-22", label: "Fri, 22 May", shortLabel: "22 May", days: 10 }
  ],
  monthly: [
    { id: "monthly-2026-06-25", label: "Thu, 25 Jun", shortLabel: "25 Jun", days: 44, sourceExpiry: true },
    { id: "monthly-2026-07-30", label: "Thu, 30 Jul", shortLabel: "30 Jul", days: 79 },
    { id: "monthly-2026-08-27", label: "Thu, 27 Aug", shortLabel: "27 Aug", days: 107 }
  ]
};

let currentMode = "buy-low";
let selectedProductId = "buy-low-aggressive";
let selectedExpiryFamily = "weekly";
let selectedExpiryId = "weekly-2026-05-19";
let walletConnected = false;
let toastTimer = null;
let depositAmountValue = "";
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
const heroTerm = document.querySelector("#heroTerm");
const expiryList = document.querySelector("#expiryList");
const spotPricePill = document.querySelector("#spotPricePill");
const spotPriceInline = document.querySelector("#spotPriceInline");
const spotPriceHeader = document.querySelector("#spotPriceHeader");
const controlsRow = document.querySelector(".controls-row");

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

function formatPercent(value) {
  return `${(value * 100).toFixed(2).replace(/\.00$/, "")}%`;
}

function formatInputValue(value) {
  return String(value).replace(/"/g, "&quot;");
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
    .find((expiry) => expiry.id === selectedExpiryId) || EXPIRY_FAMILIES.weekly[1];
}

function expiryLabel() {
  return selectedExpiry().label;
}

function expiryShortLabel() {
  return selectedExpiry().shortLabel;
}

function renderExpiryOptions() {
  expiryList.innerHTML = EXPIRY_FAMILIES[selectedExpiryFamily]
    .map((expiry) => {
      const active = expiry.id === selectedExpiryId ? " is-active" : "";
      return `
        <button class="expiry-option${active}" type="button" data-expiry="${expiry.id}" role="tab" aria-selected="${expiry.id === selectedExpiryId}">
          ${expiry.shortLabel}
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

function renderTabs() {
  document.querySelectorAll(".segment").forEach((button) => {
    const isActive = button.dataset.mode === currentMode;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  document.querySelectorAll(".term-segment").forEach((button) => {
    const isActive = button.dataset.family === selectedExpiryFamily;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  renderExpiryOptions();
  heroTerm.textContent = "Weekly / Monthly";
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
    <strong>${formatPercent(avgApr)} avg APR</strong>
  `;

  productList.innerHTML = products
    .map((product) => {
      const selectedClass = product.id === selectedProductId ? " is-selected" : "";
      return `
        <button class="product-row${selectedClass}" type="button" data-product-id="${product.id}">
          <span class="product-title">
            <strong>${product.choice}</strong>
            <span>${product.comexReference}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Strike</span>
            <span class="metric-value">${formatUsd(product.strike)}</span>
          </span>
          <span class="metric">
            <span class="metric-label">APR</span>
            <span class="metric-value">${formatPercent(productApr(product))}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Expiry</span>
            <span class="metric-value">${expiryShortLabel()}</span>
          </span>
        </button>
      `;
    })
    .join("");
}

function quoteForAmount(product, amount) {
  if (!amount || amount <= 0) {
    return null;
  }

  const adjustedYield = termAdjustedYield(product);

  if (product.mode === "buy-low") {
    const rewardValue = amount * adjustedYield;
    return {
      rewardValue,
      rewardAsset: "USDT value",
      noConversionAmount: amount + rewardValue,
      noConversionAsset: "USDT",
      conversionAmount: (amount + rewardValue) / product.strike,
      conversionAsset: "STT"
    };
  }

  const rewardValue = amount * adjustedYield * product.strike;
  return {
    rewardValue,
    rewardAsset: "USDT value",
    noConversionAmount: amount + rewardValue / product.strike,
    noConversionAsset: "STT",
    conversionAmount: amount * product.strike + rewardValue,
    conversionAsset: "USDT"
  };
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
      value: `${formatNumber(quote.noConversionAmount)} ${quote.noConversionAsset}`,
      tone: "primary"
    };
  }

  if (converts && product.mode === "buy-low") {
    return {
      label: "Buy STT",
      value: `${formatNumber(quote.conversionAmount)} ${quote.conversionAsset}`,
      tone: "convert"
    };
  }

  if (!converts) {
    return {
      label: "STT back",
      value: `${formatNumber(quote.noConversionAmount)} ${quote.noConversionAsset}`,
      tone: "primary"
    };
  }

  return {
    label: "Sell STT",
    value: `${formatNumber(quote.conversionAmount)} ${quote.conversionAsset}`,
    tone: "convert"
  };
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
  const prices = [...CHART_PATH_PRICES, scenarioPrice];
  const points = prices.map((price, index) => {
    const x = xPoints[index];
    return `${x},${priceToY(price, bounds).toFixed(1)}`;
  });

  return `
    <div class="scenario-chart ${quote ? "" : "is-empty"}" data-outcome="${outcome.tone}">
      <div class="chart-header">
        <span>Reward</span>
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
          <text class="chart-axis" x="296" y="181">Expiry</text>
        </svg>
      </div>
      <label class="scenario-slider">
        <span>Expiry silver price</span>
        <strong id="scenarioPriceLabel">${formatUsd(scenarioPrice)}</strong>
        <input
          id="scenarioPrice"
          type="range"
          min="${bounds.floor}"
          max="${bounds.ceiling}"
          step="0.1"
          value="${scenarioPrice}"
          aria-label="Expiry silver price"
        >
      </label>
      <div class="scenario-result">
        <span>${outcome.label}</span>
        <strong>${outcome.value}</strong>
      </div>
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
}

function updateRewardPreview(product, quote) {
  const rewardValue = document.querySelector("#detailRewardValue");
  if (!rewardValue) {
    return;
  }

  rewardValue.textContent = quote ? `~${formatUsd(quote.rewardValue)}` : "Enter amount";
}

function renderQuote(product) {
  const amountInput = document.querySelector("#depositAmount");
  const quoteBox = document.querySelector("#quoteBox");
  const amount = Number(amountInput.value);
  const quote = quoteForAmount(product, amount);
  const scenarioPrice = scenarioPriceFor(product);

  quoteBox.innerHTML = renderScenarioChart(product, quote, scenarioPrice);
  updateRewardPreview(product, quote);

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
          <span class="metric-label">Expiry</span>
          <strong class="metric-value">${expiryLabel()}</strong>
        </div>
        <div class="stat">
          <span class="metric-label">APR</span>
          <strong class="metric-value">${formatPercent(productApr(product))}</strong>
        </div>
        <div class="stat">
          <span class="metric-label">Reward</span>
          <strong id="detailRewardValue" class="metric-value">${quote ? `~${formatUsd(quote.rewardValue)}` : "Enter amount"}</strong>
        </div>
      </div>

      <form id="depositForm" class="deposit-form">
        <label>
          Amount (${product.depositAsset})
          <input id="depositAmount" type="text" inputmode="decimal" placeholder="0.00" autocomplete="off" value="${formatInputValue(depositAmountValue)}">
        </label>
        <div id="quoteBox" class="quote-box"></div>
        <ul class="ack-list">
          <li>
            <label>
              <input type="checkbox" name="ack">
              <span>I understand settlement may return a different asset.</span>
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" name="ack">
              <span>I understand funds are locked until the selected expiry.</span>
            </label>
          </li>
          <li>
            <label>
              <input type="checkbox" name="ack">
              <span>I understand reward is previewed from APR for the selected expiry.</span>
            </label>
          </li>
        </ul>
        <button class="primary-button" type="submit">${product.userAction}</button>
      </form>
    </div>
  `;

  const amountInput = document.querySelector("#depositAmount");
  const depositForm = document.querySelector("#depositForm");
  amountInput.addEventListener("input", () => {
    depositAmountValue = amountInput.value;
    renderQuote(product);
  });
  depositForm.addEventListener("submit", (event) => handleDeposit(event, product));
  renderQuote(product);
}

function handleDeposit(event, product) {
  event.preventDefault();

  if (!walletConnected) {
    showToast("Connect the demo wallet first.");
    return;
  }

  const amount = Number(document.querySelector("#depositAmount").value);
  const checks = Array.from(document.querySelectorAll("input[name='ack']"));
  const allChecked = checks.every((checkbox) => checkbox.checked);

  if (!amount || amount <= 0) {
    showToast("Enter a deposit amount.");
    return;
  }

  if (!allChecked) {
    showToast("Confirm all acknowledgements.");
    return;
  }

  const quote = quoteForAmount(product, amount);
  const positions = loadPositions();
  const position = {
    id: `POS-${Date.now()}`,
    productId: product.id,
    amount,
    depositAsset: product.depositAsset,
    expiryId: selectedExpiryId,
    expiryLabel: expiryLabel(),
    rewardValue: quote.rewardValue,
    createdAt: new Date().toISOString(),
    status: "active"
  };

  positions.unshift(position);
  savePositions(positions);
  renderPositions();
  renderSettlementProducts();
  depositAmountValue = "";
  event.target.reset();
  renderQuote(product);
  showToast("Demo position created.");
}

function settlementForPosition(position, finalPrice) {
  const product = getProduct(position.productId);
  const previousExpiryId = selectedExpiryId;
  selectedExpiryId = position.expiryId || "monthly-2026-06-25";
  const quote = quoteForAmount(product, position.amount);
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
        ? `${formatNumber(result.payoutAmount)} ${result.payoutAsset}`
        : `~${formatUsd(position.rewardValue)} reward value`;
      const action = position.status === "settled"
        ? `<button class="ghost-button compact" type="button" data-claim-id="${position.id}">Claim</button>`
        : `<span class="status-pill">${status}</span>`;

      return `
        <div class="position-row">
          <span class="product-title">
            <strong>${modeLabel(product.mode)} ${product.choice}</strong>
            <span>${position.expiryLabel || "Thu, 25 Jun"} / ${position.id}</span>
          </span>
          <span class="metric">
            <span class="metric-label">Deposit</span>
            <span class="metric-value">${formatNumber(position.amount)} ${position.depositAsset}</span>
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

function renderSettlementProducts() {
  settlementProduct.innerHTML = PRODUCTS.map((product) => {
    const label = `${modeLabel(product.mode)} ${product.choice} - ${formatUsd(product.strike)}`;
    return `<option value="${product.id}">${label}</option>`;
  }).join("");
}

function handleSettlement(event) {
  event.preventDefault();
  const productId = settlementProduct.value;
  const finalPrice = Number(finalPriceInput.value);

  if (!finalPrice || finalPrice <= 0) {
    showToast("Enter a final reference price.");
    return;
  }

  const positions = loadPositions();
  let settledCount = 0;
  const updated = positions.map((position) => {
    if (position.productId !== productId || position.status !== "active") {
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
  showToast(settledCount ? `${settledCount} position(s) settled.` : "No active positions for that product.");
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
  renderSettlementProducts();
  syncStickyControls();
}

wireEvents();
render();
