// Categories Page JavaScript

// DOM Elements
const addCategoryBtn = document.getElementById("addCategoryBtn");
const categoryModal = document.getElementById("categoryModal");
const closeBtn = document.querySelector(".close");
const categoryForm = document.getElementById("categoryForm");
const logoutBtn = document.getElementById("logoutBtn");

const categoryNameInput = document.getElementById("categoryName");
const categoryTypeInput = document.getElementById("categoryType");
const categoryColorInput = document.getElementById("categoryColor");
const colorPreview = document.getElementById("colorPreview");

// User info elements
const userDisplayNameEl = document.getElementById("userDisplayName");
const userEmailEl = document.getElementById("userEmail");

let categories = [];
let editingCategoryId = null;

// Initialize categories on page load
document.addEventListener("DOMContentLoaded", () => {
  checkUserLoggedIn();
  loadUserInfo();
  loadCategories();
  setupEventListeners();
  displayCategories();
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
  addCategoryBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  categoryForm.addEventListener("submit", handleCategorySubmit);

  // Color picker preview update
  categoryColorInput.addEventListener("change", (e) => {
    colorPreview.style.backgroundColor = e.target.value;
  });

  // Cancel button
  const cancelBtn = document.querySelector(".btn-cancel");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      closeModal();
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === categoryModal) {
      closeModal();
    }
  });
  logoutBtn.addEventListener("click", handleLogout);
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

  displayCategories();
}

// Display categories separated by type
function displayCategories() {
  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  // Display income categories
  const incomeCategoriesList = document.getElementById("incomeCategoriesList");
  const incomeCountEl = document.getElementById("incomeCount");

  if (incomeCategories.length === 0) {
    incomeCategoriesList.innerHTML =
      '<p class="no-data">No income categories yet</p>';
    incomeCountEl.textContent = "0";
  } else {
    incomeCountEl.textContent = incomeCategories.length;
    incomeCategoriesList.innerHTML = incomeCategories
      .map((category) => createCategoryItemHTML(category))
      .join("");
  }

  // Display expense categories
  const expenseCategoriesList = document.getElementById(
    "expenseCategoriesList"
  );
  const expenseCountEl = document.getElementById("expenseCount");

  if (expenseCategories.length === 0) {
    expenseCategoriesList.innerHTML =
      '<p class="no-data">No expense categories yet</p>';
    expenseCountEl.textContent = "0";
  } else {
    expenseCountEl.textContent = expenseCategories.length;
    expenseCategoriesList.innerHTML = expenseCategories
      .map((category) => createCategoryItemHTML(category))
      .join("");
  }
}

// Create category item HTML
function createCategoryItemHTML(category) {
  const typeClass = category.type === "expense" ? "expense" : "";
  return `
    <div class="category-item">
      <div class="category-left">
        <div class="category-dot" style="background-color: ${
          category.color
        };"></div>
        <div class="category-info">
          <p class="category-name">${category.name}</p>
          <p class="category-type ${typeClass}">${
    category.type === "income" ? "Income" : "Expense"
  }</p>
        </div>
      </div>
      <div class="category-actions">
        <button class="btn-category-action" onclick="editCategory(${
          category.id
        })" title="Edit">✏️</button>
        <button class="btn-category-action btn-category-delete" onclick="deleteCategory(${
          category.id
        })" title="Delete">🗑️</button>
      </div>
    </div>
  `;
}

// Open modal for adding category
function openModal() {
  editingCategoryId = null;
  categoryForm.reset();
  categoryTypeInput.value = "expense";
  categoryColorInput.value = "#ef4444";
  colorPreview.style.backgroundColor = "#ef4444";
  categoryModal.style.display = "block";
}

// Close modal
function closeModal() {
  categoryModal.style.display = "none";
  editingCategoryId = null;
  categoryForm.reset();
}

// Handle category form submission
function handleCategorySubmit(e) {
  e.preventDefault();

  const name = categoryNameInput.value.trim();
  const type = categoryTypeInput.value;
  const color = categoryColorInput.value;

  if (!name) {
    alert("Please enter a category name");
    return;
  }

  if (editingCategoryId !== null) {
    // Update existing category
    const category = categories.find((c) => c.id === editingCategoryId);
    if (category) {
      category.name = name;
      category.type = type;
      category.color = color;
    }
  } else {
    // Add new category
    const newCategory = {
      id:
        categories.length > 0
          ? Math.max(...categories.map((c) => c.id)) + 1
          : 1,
      name,
      type,
      color,
    };
    categories.push(newCategory);
  }

  saveCategories();
  displayCategories();
  closeModal();
}

// Edit category
function editCategory(id) {
  const category = categories.find((c) => c.id === id);
  if (!category) return;

  editingCategoryId = id;
  categoryNameInput.value = category.name;
  categoryTypeInput.value = category.type;
  categoryColorInput.value = category.color;
  colorPreview.style.backgroundColor = category.color;
  categoryModal.style.display = "block";
}

// Delete category
function deleteCategory(id) {
  if (confirm("Are you sure you want to delete this category?")) {
    categories = categories.filter((c) => c.id !== id);
    saveCategories();
    displayCategories();
  }
}

// Save categories to localStorage
function saveCategories() {
  localStorage.setItem("categories", JSON.stringify(categories));
}

// Handle logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("user");
    localStorage.removeItem("currency");
    window.location.href = "../../index.html";
  }
}
