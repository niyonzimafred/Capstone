// Transactions Page JavaScript

// DOM Elements
const addTransactionBtn = document.getElementById("addTransactionBtn");
const transactionModal = document.getElementById("transactionModal");
const closeBtn = document.querySelector(".close");
const transactionForm = document.getElementById("transactionForm");
const transactionsList = document.getElementById("transactionsList");
const typeFilter = document.getElementById("typeFilter");
const categoryFilter = document.getElementById("categoryFilter");
const logoutBtn = document.getElementById("logoutBtn");

const transactionTypeInput = document.getElementById("transactionType");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const descriptionInput = document.getElementById("description");
const dateInput = document.getElementById("date");

// User info elements
const userDisplayNameEl = document.getElementById("userDisplayName");
const userEmailEl = document.getElementById("userEmail");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpensesEl = document.getElementById("totalExpenses");
const netBalanceEl = document.getElementById("netBalance");
const incomeCountEl = document.getElementById("incomeCount");
const expenseCountEl = document.getElementById("expenseCount");
const balanceCountEl = document.getElementById("balanceCount");
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.querySelector(".btn-clear-filters");

let transactions = [];
let categories = [];
let editingTransactionId = null;

// Initialize transactions on page load
document.addEventListener("DOMContentLoaded", () => {
  checkUserLoggedIn();
  loadUserInfo();
  loadTransactions();
  loadCategories();
  populateCategoryFilters();
  displayTransactions();
  updateStats();
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
  addTransactionBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  transactionForm.addEventListener("submit", handleTransactionSubmit);
  typeFilter.addEventListener("change", displayTransactions);
  categoryFilter.addEventListener("change", displayTransactions);
  searchInput.addEventListener("input", displayTransactions);
  clearFiltersBtn.addEventListener("click", clearAllFilters);

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
  logoutBtn.addEventListener("click", handleLogout);
}

// Load transactions from localStorage
function loadTransactions() {
  transactions = JSON.parse(localStorage.getItem("transactions")) || [];
}

// Load categories from localStorage
function loadCategories() {
  categories = JSON.parse(localStorage.getItem("categories")) || [
    { id: 1, name: "Food", type: "expense", color: "#ef4444" },
    { id: 2, name: "Transport", type: "expense", color: "#f59e0b" },
    { id: 3, name: "Entertainment", type: "expense", color: "#ec4899" },
    { id: 4, name: "Utilities", type: "expense", color: "#06b6d4" },
    { id: 5, name: "Salary", type: "income", color: "#10b981" },
  ];
}

// Populate category filters
function populateCategoryFilters() {
  const categoryOptions = [
    '<option value="all">All Categories</option>',
    ...categories.map((c) => `<option value="${c.name}">${c.name}</option>`),
  ].join("");

  categoryFilter.innerHTML = categoryOptions;

  // Also populate category select in form
  const formCategoryOptions = categories
    .map((c) => `<option value="${c.name}">${c.name}</option>`)
    .join("");
  categoryInput.innerHTML = formCategoryOptions;
}

// Display transactions with filters applied
function displayTransactions() {
  const typeFilterValue = typeFilter.value;
  const categoryFilterValue = categoryFilter.value;
  const searchValue = searchInput.value.toLowerCase();

  let filteredTransactions = transactions.filter((t) => {
    const typeMatch = typeFilterValue === "all" || t.type === typeFilterValue;
    const categoryMatch =
      categoryFilterValue === "all" || t.category === categoryFilterValue;
    const searchMatch =
      searchValue === "" ||
      t.category.toLowerCase().includes(searchValue) ||
      t.description.toLowerCase().includes(searchValue);
    return typeMatch && categoryMatch && searchMatch;
  });

  if (filteredTransactions.length === 0) {
    transactionsList.innerHTML = '<p class="no-data">No transactions found</p>';
    return;
  }

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

  transactionsList.innerHTML = filteredTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(
      (t) => `
      <div class="transaction-item ${t.type}">
        <div class="transaction-main">
          <div class="transaction-dot"></div>
          <div class="transaction-info">
            <div class="transaction-header">
              <p class="transaction-name">${t.category}</p>
              <p class="transaction-category">${t.category}</p>
            </div>
            <p class="transaction-description">${t.description}</p>
          </div>
        </div>
        <div class="transaction-actions">
          <p class="transaction-amount ${t.type}">
            ${t.type === "income" ? "+" : "-"}${formatCurrency(t.amount)}
          </p>
          <p class="transaction-date">${formatDate(t.date)}</p>
          <button class="btn-transaction-action" onclick="editTransaction(${
            t.id
          })" title="Edit">✏️</button>
          <button class="btn-transaction-action btn-transaction-delete" onclick="deleteTransaction(${
            t.id
          })" title="Delete">🗑️</button>
        </div>
      </div>
    `
    )
    .join("");
}

// Open modal for adding transaction
function openModal() {
  editingTransactionId = null;
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
  editingTransactionId = null;
  transactionForm.reset();
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

  if (editingTransactionId !== null) {
    // Update existing transaction
    const transaction = transactions.find((t) => t.id === editingTransactionId);
    if (transaction) {
      transaction.type = type;
      transaction.amount = amount;
      transaction.category = category;
      transaction.description = description;
      transaction.date = date;
    }
  } else {
    // Add new transaction
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
  }

  saveTransactions();
  displayTransactions();
  updateStats();
  closeModal();
}

// Update stats cards
function updateStats() {
  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  transactions.forEach((t) => {
    const amount = parseFloat(t.amount);
    if (t.type === "income") {
      totalIncome += amount;
      incomeCount++;
    } else {
      totalExpenses += amount;
      expenseCount++;
    }
  });

  const netBalance = totalIncome - totalExpenses;

  if (totalIncomeEl) totalIncomeEl.textContent = formatCurrency(totalIncome);
  if (totalExpensesEl)
    totalExpensesEl.textContent = formatCurrency(totalExpenses);
  if (netBalanceEl) netBalanceEl.textContent = formatCurrency(netBalance);
  if (incomeCountEl) incomeCountEl.textContent = `+${incomeCount}`;
  if (expenseCountEl) expenseCountEl.textContent = expenseCount;
  if (balanceCountEl)
    balanceCountEl.textContent = `${transactions.length} total`;
}

// Clear all filters
function clearAllFilters() {
  typeFilter.value = "all";
  categoryFilter.value = "all";
  searchInput.value = "";
  displayTransactions();
}

// Delete transaction
function deleteTransaction(id) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions = transactions.filter((t) => t.id !== id);
    saveTransactions();
    displayTransactions();
    updateStats();
  }
}

// Edit transaction (placeholder - can be expanded)
function editTransaction(id) {
  const transaction = transactions.find((t) => t.id === id);
  if (transaction) {
    editingTransactionId = id;
    transactionTypeInput.value = transaction.type;
    amountInput.value = transaction.amount;
    categoryInput.value = transaction.category;
    descriptionInput.value = transaction.description;
    dateInput.value = transaction.date;

    // Update type button state
    const typeButtons = document.querySelectorAll(".type-btn");
    typeButtons.forEach((btn) => btn.classList.remove("active"));
    document.querySelector(`.${transaction.type}-btn`).classList.add("active");

    transactionModal.style.display = "block";
  }
}

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
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
