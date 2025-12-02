// Dashboard Page JavaScript

// DOM Elements
const totalBalanceEl = document.getElementById("totalBalance");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const welcomeMessageEl = document.getElementById("welcomeMessage");
const recentTransactionsList = document.getElementById(
  "recentTransactionsList"
);
const logoutBtn = document.getElementById("logoutBtn");
const userDisplayNameEl = document.getElementById("userDisplayName");
const userEmailEl = document.getElementById("userEmail");

// Modal Elements
const transactionModal = document.getElementById("transactionModal");
const addTransactionBtn = document.getElementById("addTransactionBtn");
const closeBtn = document.querySelector(".close");
const transactionForm = document.getElementById("transactionForm");
const transactionTypeInput = document.getElementById("transactionType");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");

const currency = localStorage.getItem("currency") || "USD";

// Global chart reference
let balanceChart = null;

// Initialize dashboard on page load
document.addEventListener("DOMContentLoaded", () => {
  checkUserLoggedIn();
  loadDashboardData();
  initializeCharts();
  setupEventListeners();
  setDefaultDate();
});

// Setup event listeners
function setupEventListeners() {
  logoutBtn.addEventListener("click", handleLogout);
  addTransactionBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  transactionForm.addEventListener("submit", handleTransactionSubmit);

  // Type toggle buttons
  const typeButtons = document.querySelectorAll(".type-btn");
  typeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      typeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      transactionTypeInput.value = btn.dataset.type;
    });
  });

  // Receipt upload click handler
  const receiptUpload = document.querySelector(".receipt-upload");
  if (receiptUpload) {
    receiptUpload.addEventListener("click", () => {
      document.getElementById("receipt").click();
    });
  }

  // Cancel button
  const cancelBtn = document.querySelector(".btn-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === transactionModal) {
      closeModal();
    }
  });
}

// Check if user is logged in
function checkUserLoggedIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "../../index.html";
  }
}

// Load and display dashboard data
function loadDashboardData() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  // Display user information
  if (userDisplayNameEl) {
    userDisplayNameEl.textContent = user.displayName || "User";
  }
  if (userEmailEl) {
    userEmailEl.textContent = user.email || "email@example.com";
  }

  // Update welcome message
  if (user.displayName) {
    welcomeMessageEl.textContent = `Welcome back, ${user.displayName}!`;
  }

  // Calculate totals for all time
  let totalIncome = 0;
  let totalExpenses = 0;

  // Calculate this month's totals
  let thisMonthIncome = 0;
  let thisMonthExpenses = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount);

    if (t.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
    }

    // Check if transaction is from this month
    const transactionDate = new Date(t.date);
    if (
      transactionDate.getMonth() === currentMonth &&
      transactionDate.getFullYear() === currentYear
    ) {
      if (t.type === "income") {
        thisMonthIncome += amount;
      } else {
        thisMonthExpenses += amount;
      }
    }
  });

  const totalBalance = totalIncome - totalExpenses;

  // Display totals
  totalBalanceEl.textContent = formatCurrency(totalBalance);
  totalIncomeEl.textContent = formatCurrency(thisMonthIncome);
  totalExpensesEl.textContent = formatCurrency(thisMonthExpenses);

  // Display recent transactions (last 5)
  displayRecentTransactions(transactions.slice(-5).reverse());
}

// Open modal
function openModal() {
  transactionForm.reset();
  dateInput.valueAsDate = new Date();
  transactionTypeInput.value = "expense";

  // Reset type buttons
  const typeButtons = document.querySelectorAll(".type-btn");
  typeButtons.forEach((btn) => btn.classList.remove("active"));
  document.querySelector(".expense-btn").classList.add("active");

  transactionModal.style.display = "block";
}

// Close modal
function closeModal() {
  transactionModal.style.display = "none";
  transactionForm.reset();
}

// Set default date
function setDefaultDate() {
  dateInput.valueAsDate = new Date();
}

// Handle transaction form submission
function handleTransactionSubmit(e) {
  e.preventDefault();

  const type = transactionTypeInput.value;
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const description = descriptionInput.value.trim();
  const date = dateInput.value;

  if (!type || !amount || !category || !description || !date) {
    alert("Please fill all fields");
    return;
  }

  if (amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  // Add new transaction
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const newTransaction = {
    id:
      transactions.length > 0
        ? Math.max(...transactions.map((t) => t.id)) + 1
        : 1,
    type,
    amount,
    category,
    description,
    date,
    createdAt: new Date().toISOString(),
  };
  transactions.push(newTransaction);

  localStorage.setItem("transactions", JSON.stringify(transactions));
  loadDashboardData();
  initializeCharts();
  closeModal();
}

// Initialize charts
function initializeCharts() {
  const chartCanvas = document.getElementById("balanceTrendChart");
  if (!chartCanvas) return;

  // Destroy previous chart if it exists
  if (balanceChart) {
    balanceChart.destroy();
  }

  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const last30Days = getLast30Days();
  const balanceData = calculateBalanceByDay(transactions, last30Days);

  // Calculate dynamic scale based on data
  const maxBalance = balanceData.length > 0 ? Math.max(...balanceData, 0) : 0;
  const minBalance = balanceData.length > 0 ? Math.min(...balanceData, 0) : 0;

  // Calculate nice round numbers for Y-axis
  let yMax = 3000; // Default max
  let yMin = 0;
  let step = 750;

  if (maxBalance > 0 || minBalance < 0) {
    const range = Math.abs(maxBalance - minBalance);

    if (range > 0) {
      // Round to nearest 250
      step = Math.ceil(range / 4 / 250) * 250;
      if (step < 250) step = 250;

      yMax = Math.ceil(maxBalance / step) * step;
      if (yMax < 1000) yMax = 1000;

      yMin = minBalance < 0 ? Math.floor(minBalance / step) * step : 0;
    }
  }

  const ctx = chartCanvas.getContext("2d");
  balanceChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: last30Days.map((date) => {
        const dateObj = new Date(date);

        // Show "Today" for current date
        if (dateObj.toLocaleDateString() === new Date().toLocaleDateString()) {
          return "Today";
        }

        // Show every 5 days starting from day 1
        const dayOfMonth = dateObj.getDate();
        if (dayOfMonth === 1 || (dayOfMonth - 1) % 5 === 0) {
          return `Jan ${dayOfMonth}`;
        }
        return "";
      }),
      datasets: [
        {
          label: "Balance",
          data: balanceData,
          borderColor: "#1ec988",
          backgroundColor: "rgba(30, 201, 136, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointBackgroundColor: "#1ec988",
          pointBorderColor: "#fff",
          pointBorderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          min: yMin,
          max: yMax,
          ticks: {
            stepSize: step,
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: true,
            drawBorder: false,
            color: "rgba(0, 0, 0, 0.05)",
            tickLength: 0,
          },
          ticks: {
            font: {
              size: 12,
            },
            maxRotation: 0,
            minRotation: 0,
          },
        },
      },
    },
  });
}
function getLast30Days() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toISOString().split("T")[0]);
  }
  return days;
}

function calculateBalanceByDay(transactions, days) {
  let runningBalance = 0;
  return days.map((day) => {
    const dayTransactions = transactions.filter((t) => t.date === day);
    dayTransactions.forEach((t) => {
      if (t.type === "income") {
        runningBalance += parseFloat(t.amount);
      } else {
        runningBalance -= parseFloat(t.amount);
      }
    });
    return runningBalance;
  });
}

// Display recent transactions
function displayRecentTransactions(transactions) {
  if (transactions.length === 0) {
    recentTransactionsList.innerHTML =
      '<p class="no-data">No transactions yet</p>';
    return;
  }

  recentTransactionsList.innerHTML = transactions
    .map((t) => {
      const categoryIcons = {
        Salary: "💼",
        Food: "🍔",
        Transport: "🚗",
        Entertainment: "🎬",
        Utilities: "💡",
        "Coffee Shop": "☕",
        "Grocery Store": "🛒",
        "Netflix Subscription": "📺",
        "Freelance Project": "💻",
        Other: "📌",
      };
      const icon = categoryIcons[t.category] || "📌";
      return `
    <div class="transaction-item ${t.type}">
      <div class="transaction-icon">${icon}</div>
      <div class="transaction-details">
        <p class="transaction-name">${t.category}</p>
        <p class="transaction-category">${t.description}</p>
      </div>
      <div class="transaction-meta">
        <p class="transaction-amount ${t.type}">
          ${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}
        </p>
        <p class="transaction-date">${formatDate(t.date)}</p>
      </div>
    </div>
  `;
    })
    .join("");
}

// Format currency with selected currency symbol
function formatCurrency(amount) {
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const symbol = currencySymbols[currency] || "$";
  return `${symbol}${Math.abs(amount).toFixed(2)}`;
}

// Format date to readable format
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Handle logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("user");
    localStorage.removeItem("currency");
    window.location.href = "../../index.html";
  }
}
