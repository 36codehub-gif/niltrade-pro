
// =====================================
// NILTRADE PRO - DEMO TRADING APP
// NIFTY 50 + SENSEX
// Simulated market data only
// =====================================

let nifty = 26150;
let sensex = 85600;

let balance = 100000;
let bookedProfit = 0;
let positions = [];

let prices = [];
let currentMarket = "NIFTY";

const $ = (id) => document.getElementById(id);

const money = (value) =>
  "₹" + Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2
  });

// Generate simulated market movement
function updateMarket() {
  nifty += (Math.random() - 0.48) * 35;
  sensex += (Math.random() - 0.48) * 100;

  $("nifty").textContent = nifty.toFixed(2);
  $("sensex").textContent = sensex.toFixed(2);

  $("niftyChange").textContent =
    ((nifty - 26150) / 26150 * 100).toFixed(2) + "%";

  $("sensexChange").textContent =
    ((sensex - 85600) / 85600 * 100).toFixed(2) + "%";

  const currentPrice =
    currentMarket === "NIFTY" ? nifty : sensex;

  prices.push(currentPrice);
  if (prices.length > 40) prices.shift();

  updateChart();
  updateIndicators();
  updatePositions();
  updateWallet();
}

// Chart setup
let chart;

function createChart() {
  const canvas = $("marketChart");
  if (!canvas || typeof Chart === "undefined") return;

  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: prices.map((_, i) => i + 1),
      datasets: [{
        label: currentMarket + " Simulated Price",
        data: prices,
        borderColor: "#00d4aa",
        backgroundColor: "rgba(0,212,170,0.10)",
        fill: true,
        tension: 0.35,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          labels: { color: "#ffffff" }
        }
      },
      scales: {
        x: {
          ticks: { color: "#999999" },
          grid: { color: "#252a35" }
        },
        y: {
          ticks: { color: "#999999" },
          grid: { color: "#252a35" }
        }
      }
    }
  });
}

function updateChart() {
  if (!chart) return;

  chart.data.labels = prices.map((_, i) => i + 1);
  chart.data.datasets[0].label =
    currentMarket + " Simulated Price";
  chart.data.datasets[0].data = [...prices];
  chart.update("none");
}

// EMA calculation
function calculateEMA(data, period) {
  if (!data.length) return 0;

  const multiplier = 2 / (period + 1);
  let ema = data[0];

  for (let i = 1; i < data.length; i++) {
    ema = (data[i] - ema) * multiplier + ema;
  }

  return ema;
}

// RSI calculation
function calculateRSI(data, period = 14) {
  if (data.length <= period) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    const difference = data[i] - data[i - 1];

    if (difference > 0) gains += difference;
    else losses += Math.abs(difference);
  }

  if (losses === 0) return 100;

  const rs = gains / losses;
  return 100 - (100 / (1 + rs));
}

// Indicators and demo signal
function updateIndicators() {
  const ema9 = calculateEMA(prices, 9);
  const ema21 = calculateEMA(prices, 21);
  const rsi = calculateRSI(prices);

  $("ema9").textContent = ema9.toFixed(2);
  $("ema21").textContent = ema21.toFixed(2);
  $("rsi").textContent = rsi.toFixed(2);

  const signal = $("signal");
  const signalText = $("signalText");

  if (prices.length < 22) {
    signal.textContent = "WAIT";
    signalText.textContent = "Collecting simulated price data...";
    return;
  }

  if (ema9 > ema21 && rsi > 50) {
    signal.textContent = "BUY CALL";
    signalText.textContent =
      "Simulated bullish indicator condition";
  } else if (ema9 < ema21 && rsi < 50) {
    signal.textContent = "BUY PUT";
    signalText.textContent =
      "Simulated bearish indicator condition";
  } else {
    signal.textContent = "WAIT";
    signalText.textContent =
      "No clear simulated indicator condition";
  }
}

// Select market
function selectMarket(market) {
  currentMarket = market;
  prices = [];

  const currentPrice =
    market === "NIFTY" ? nifty : sensex;

  for (let i = 0; i < 25; i++) {
    prices.push(currentPrice + (Math.random() - 0.5) * 100);
  }

  if (chart) {
    chart.destroy();
    chart = null;
  }

  createChart();
  updateIndicators();
}

// Option premium simulation
function getPremium() {
  const currentPrice =
    currentMarket === "NIFTY" ? nifty : sensex;

  return Math.max(
    20,
    100 + (currentPrice % 100) * 0.5
  );
}

function updateCost() {
  const premiumInput = $("premium");
  const quantityInput = $("quantity");

  if (!premiumInput || !quantityInput) return;

  const premium = Number(premiumInput.value) || 0;
  const quantity = Number(quantityInput.value) || 0;

  $("cost").textContent = money(premium * quantity);
}

// Buy demo option
function buyTrade() {
  const type = $("tradeType").value;
  const premium = Number($("premium").value);
  const quantity = Number($("quantity").value);

  if (!["CALL", "PUT"].includes(type)) {
    alert("Please select CALL or PUT.");
    return;
  }

  if (
    !Number.isFinite(premium) ||
    !Number.isInteger(quantity) ||
    premium <= 0 ||
    quantity <= 0
  ) {
    alert("Enter a valid premium and whole-number quantity.");
    return;
  }

  const cost = premium * quantity;

  if (cost > balance) {
    alert("Insufficient demo balance!");
    return;
  }

  balance -= cost;

  positions.push({
    id: Date.now(),
    market: currentMarket,
    type,
    entry: premium,
    quantity,
    current: premium
  });

  updateWallet();
  updatePositions();
  updateCost();

  alert("Demo trade opened successfully!");
}

// Update positions
function updatePositions() {
  const container = $("positions");
  if (!container) return;

  container.innerHTML = "";

  positions.forEach(position => {
    const marketPrice =
      position.market === "NIFTY" ? nifty : sensex;

    const movement = Math.abs(
      marketPrice % 20
    ) / 100;

    position.current =
      position.entry *
      (1 + (Math.random() - 0.45) * movement);

    const pnl =
      (position.current - position.entry) *
      position.quantity;

    const item = document.createElement("div");
    item.className = "position-item";

    const details = document.createElement("span");
    details.textContent =
      `${position.market} ${position.type} | Qty: ${position.quantity} | Entry: ${money(position.entry)} | LTP: ${money(position.current)} | P&L: ${money(pnl)}`;

    const exitButton = document.createElement("button");
    exitButton.textContent = "EXIT";
    exitButton.addEventListener("click", () => {
      exitTrade(position.id);
    });

    item.append(details, exitButton);
    container.appendChild(item);
  });
}

// Exit demo trade
function exitTrade(id) {
  const index = positions.findIndex(p => p.id === id);
  if (index === -1) return;

  const position = positions[index];

  const pnl =
    (position.current - position.entry) *
    position.quantity;

  balance += position.current * position.quantity;
  bookedProfit += pnl;

  positions.splice(index, 1);

  updateWallet();
  updatePositions();

  alert("Demo position closed. P&L: " + money(pnl));
}

// Wallet
function updateWallet() {
  $("balance").textContent = money(balance);

  const profitElement = $("bookedProfit");
  if (profitElement) {
    profitElement.textContent = money(bookedProfit);
  }
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  if (!$("nifty") || !$("marketChart")) {
    console.error("Required HTML elements are missing.");
    return;
  }

  for (let i = 0; i < 25; i++) {
    prices.push(nifty + (Math.random() - 0.5) * 100);
  }

  createChart();
  updateWallet();
  updateMarket();

  if ($("premium")) {
    $("premium").value = getPremium().toFixed(2);
  }

  if ($("quantity")) {
    $("quantity").value = 1;
  }

  updateCost();

  if ($("premium")) {
    $("premium").addEventListener("input", updateCost);
  }

  if ($("quantity")) {
    $("quantity").addEventListener("input", updateCost);
  }

  setInterval(updateMarket, 2000);
});
