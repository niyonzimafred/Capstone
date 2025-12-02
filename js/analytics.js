// Analytics Page JavaScript

let incomeExpenseChart, categoryChart;

// DOM Elements
const logoutBtn = document.getElementById("logoutBtn");
const userDisplayNameEl = document.getElementById("userDisplayName");
const userEmailEl = document.getElementById("userEmail");

// Stats elements
const topCategoryEl = document.getElementById("topCategory");
const totalIncomeYTDEl = document.getElementById("totalIncomeYTD");
const totalExpenseYTDEl = document.getElementById("totalExpenseYTD");
const savingsRateEl = document.getElementById("savingsRate");
const avgMonthlyExpenseEl = document.getElementById("avgMonthlyExpense");
const avgMonthlyIncomeEl = document.getElementById("avgMonthlyIncome");

// Initialize analytics on page load
document.addEventListener("DOMContentLoaded", () => {
  checkUserLoggedIn();
  loadUserInfo();
  initializeCharts();
  loadAnalyticsData();
  setupEventListeners();
});

// Check if user is logged in
function checkUserLoggedIn() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) {
    window.location.href = "../../index.html";
  }
}

// Load and display user info
function loadUserInfo() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  if (userDisplayNameEl) {
    userDisplayNameEl.textContent = user.displayName || "User";
  }
  if (userEmailEl) {
    userEmailEl.textContent = user.email || "email@example.com";
  }
}

// Setup event listeners
function setupEventListeners() {
  logoutBtn.addEventListener("click", handleLogout);
}

// Initialize Chart.js charts
function initializeCharts() {
  const incomeExpenseCtx = document
    .getElementById("incomeExpenseChart")
    .getContext("2d");
  incomeExpenseChart = new Chart(incomeExpenseCtx, {
    type: "bar",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [
        {
          label: "Income",
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: "#1ec988",
          borderColor: "#16b875",
          borderWidth: 0,
          borderRadius: 6,
        },
        {
          label: "Expense",
          data: [0, 0, 0, 0, 0, 0],
          backgroundColor: "#ef4444",
          borderColor: "#dc2626",
          borderWidth: 0,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
        x: {
          stacked: false,
        },
      },
    },
  });

  const categoryCtx = document.getElementById("categoryChart").getContext("2d");
  categoryChart = new Chart(categoryCtx, {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            "#1ec988",
            "#06b6d4",
            "#f59e0b",
            "#a855f7",
            "#ec4899",
            "#8b5cf6",
          ],
          borderColor: "white",
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              size: 12,
            },
          },
        },
      },
    },
  });
}

// Load analytics data
function loadAnalyticsData() {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];

  updateStats(transactions);
  updateIncomeExpenseChart(transactions);
  updateCategoryChart(transactions);
}

// Update stats cards
function updateStats(transactions) {
  let totalIncome = 0;
  let totalExpenses = 0;
  const categoryExpenses = {};

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount);
    if (t.type === "income") {
      totalIncome += amount;
    } else {
      totalExpenses += amount;
      categoryExpenses[t.category] =
        (categoryExpenses[t.category] || 0) + amount;
    }
  });

  // Top category
  let topCategory = "$0.00";
  let topCategoryAmount = 0;
  for (const [category, amount] of Object.entries(categoryExpenses)) {
    if (amount > topCategoryAmount) {
      topCategoryAmount = amount;
      topCategory = formatCurrency(amount);
    }
  }

  // Calculate year-to-date (YTD) - from January 1 of this year
  const currentYear = new Date().getFullYear();
  const ytdTransactions = transactions.filter((t) => {
    return new Date(t.date).getFullYear() === currentYear;
  });

  let ytdIncome = 0;
  let ytdExpenses = 0;
  ytdTransactions.forEach((t) => {
    const amount = parseFloat(t.amount);
    if (t.type === "income") {
      ytdIncome += amount;
    } else {
      ytdExpenses += amount;
    }
  });

  // Average monthly calculations
  const months = new Set(
    transactions.map((t) => {
      const date = new Date(t.date);
      return (
        date.getFullYear() + "-" + String(date.getMonth()).padStart(2, "0")
      );
    })
  ).size;

  const avgMonthlyExpense = months > 0 ? totalExpenses / months : 0;
  const avgMonthlyIncome = months > 0 ? totalIncome / months : 0;

  // Savings rate
  const savingsRate =
    totalIncome > 0
      ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)
      : 0;

  // Update UI
  if (topCategoryEl) topCategoryEl.textContent = topCategory;
  if (totalIncomeYTDEl)
    totalIncomeYTDEl.textContent = formatCurrency(ytdIncome);
  if (totalExpenseYTDEl)
    totalExpenseYTDEl.textContent = formatCurrency(ytdExpenses);
  if (savingsRateEl) savingsRateEl.textContent = savingsRate + "%";
  if (avgMonthlyExpenseEl)
    avgMonthlyExpenseEl.textContent = formatCurrency(avgMonthlyExpense);
  if (avgMonthlyIncomeEl)
    avgMonthlyIncomeEl.textContent = formatCurrency(avgMonthlyIncome);
}

// Update income vs expenses chart
function updateIncomeExpenseChart(transactions) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const incomeByMonth = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0 };
  const expenseByMonth = { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0 };

  const currentYear = new Date().getFullYear();

  transactions.forEach((t) => {
    const date = new Date(t.date);
    if (date.getFullYear() === currentYear) {
      const monthName = date.toLocaleDateString("en-US", { month: "short" });
      if (incomeByMonth.hasOwnProperty(monthName)) {
        const amount = parseFloat(t.amount);
        if (t.type === "income") {
          incomeByMonth[monthName] += amount;
        } else {
          expenseByMonth[monthName] += amount;
        }
      }
    }
  });

  incomeExpenseChart.data.labels = months;
  incomeExpenseChart.data.datasets[0].data = months.map(
    (m) => incomeByMonth[m]
  );
  incomeExpenseChart.data.datasets[1].data = months.map(
    (m) => expenseByMonth[m]
  );
  incomeExpenseChart.update();
}

// Update spending by category chart
function updateCategoryChart(transactions) {
  const categoryData = {};

  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      if (!categoryData[t.category]) {
        categoryData[t.category] = 0;
      }
      categoryData[t.category] += parseFloat(t.amount);
    });

  const labels = Object.keys(categoryData);
  const data = Object.values(categoryData);

  categoryChart.data.labels = labels;
  categoryChart.data.datasets[0].data = data;
  categoryChart.update();
}

// Format currency with selected currency symbol
function formatCurrency(amount) {
  const currency = localStorage.getItem("currency") || "USD";
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
  };

  const symbol = currencySymbols[currency] || "$";
  return `${symbol}${Math.abs(amount).toFixed(2)}`;
}

// Handle logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("user");
    localStorage.removeItem("currency");
    window.location.href = "../../index.html";
  }
}
