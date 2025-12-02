// Settings Page JavaScript

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const messageDiv = document.getElementById("message");

// Form elements - Profile tab
const displayNameInput = document.getElementById("displayName");
const emailInput = document.getElementById("email");
const profilePicInput = document.getElementById("profilePic");
const profileSaveBtn = document.getElementById("profileSave");

// Form elements - Preferences tab
const currencySelect = document.getElementById("currency");
const notificationToggle = document.getElementById("notifications");
const preferencesSaveBtn = document.getElementById("preferencesSaveBtn");

// Form elements - Account tab
const oldPasswordInput = document.getElementById("oldPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmPasswordInput = document.getElementById("confirmPassword");
const accountSaveBtn = document.getElementById("accountSaveBtn");

// Danger zone
const deleteDataBtn = document.getElementById("deleteData");
const logoutBtn = document.getElementById("logoutBtn");

// Initialize settings on page load
document.addEventListener("DOMContentLoaded", () => {
  displayUserInfo();
  loadUserSettings();
  setupTabNavigation();
  setupEventListeners();
});

// Display user info in header
function displayUserInfo() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const userNameElem = document.querySelector(".user-info h3");
  const userEmailElem = document.querySelector(".user-info p");

  if (userNameElem) {
    userNameElem.textContent = user.displayName || "User";
  }
  if (userEmailElem) {
    userEmailElem.textContent = user.email || "user@example.com";
  }
}

// Setup tab navigation
function setupTabNavigation() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabName = btn.getAttribute("data-tab");
      switchTab(tabName);
    });
  });
}

// Switch between tabs
function switchTab(tabName) {
  // Remove active class from all buttons and contents
  tabButtons.forEach((btn) => btn.classList.remove("active"));
  tabContents.forEach((content) => content.classList.remove("active"));

  // Add active class to clicked button and corresponding content
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(tabName).classList.add("active");
}

// Load user settings from localStorage
function loadUserSettings() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  const savedCurrency = localStorage.getItem("currency") || "USD";
  const notificationsEnabled =
    localStorage.getItem("notifications") !== "false";

  if (user.displayName) {
    displayNameInput.value = user.displayName;
  }

  if (user.email) {
    emailInput.value = user.email;
  }

  currencySelect.value = savedCurrency;
  notificationToggle.checked = notificationsEnabled;
}

// Setup event listeners for all forms and buttons
function setupEventListeners() {
  profileSaveBtn.addEventListener("click", handleProfileSubmit);
  preferencesSaveBtn.addEventListener("click", handlePreferencesSubmit);
  accountSaveBtn.addEventListener("click", handlePasswordSubmit);
  logoutBtn.addEventListener("click", handleLogout);
  deleteDataBtn.addEventListener("click", handleDeleteData);
}

// Handle profile form submission
function handleProfileSubmit(e) {
  e.preventDefault();

  const displayName = displayNameInput.value.trim();

  if (!displayName) {
    showMessage("Please enter a display name", "error");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user")) || {};
  user.displayName = displayName;
  localStorage.setItem("user", JSON.stringify(user));

  showMessage("✓ Profile updated successfully!", "success");
  displayUserInfo();

  // Reset form after a short delay
  setTimeout(() => {
    loadUserSettings();
  }, 1000);
}

// Handle preferences form submission
function handlePreferencesSubmit(e) {
  e.preventDefault();

  const selectedCurrency = currencySelect.value;
  const notificationsEnabled = notificationToggle.checked;

  localStorage.setItem("currency", selectedCurrency);
  localStorage.setItem(
    "notifications",
    notificationsEnabled ? "true" : "false"
  );

  showMessage(
    `✓ Preferences updated! Currency: ${selectedCurrency}`,
    "success"
  );
}

// Handle password form submission
function handlePasswordSubmit(e) {
  e.preventDefault();

  const user = JSON.parse(localStorage.getItem("user")) || {};
  const oldPassword = oldPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Verify old password
  if (oldPassword !== user.password) {
    showMessage("Current password is incorrect", "error");
    return;
  }

  if (newPassword.length < 6) {
    showMessage("New password must be at least 6 characters long", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    showMessage("New passwords do not match", "error");
    return;
  }

  user.password = newPassword;
  localStorage.setItem("user", JSON.stringify(user));

  showMessage("✓ Password changed successfully!", "success");

  // Clear password fields
  setTimeout(() => {
    oldPasswordInput.value = "";
    newPasswordInput.value = "";
    confirmPasswordInput.value = "";
  }, 1000);
}

// Handle logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("user");
    localStorage.removeItem("currency");
    localStorage.removeItem("notifications");
    showMessage("Logging out...", "success");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1000);
  }
}

// Handle delete all data
function handleDeleteData() {
  if (
    confirm(
      "⚠️ Are you sure you want to delete ALL your data? This cannot be undone."
    )
  ) {
    if (
      confirm("🚨 Final warning: Click OK to permanently delete everything")
    ) {
      localStorage.clear();
      showMessage("All data deleted. Redirecting to login...", "success");
      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1500);
    }
  }
}

// Show message function
function showMessage(text, type) {
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = "block";

  // Auto-hide message after 5 seconds
  setTimeout(() => {
    messageDiv.textContent = "";
    messageDiv.className = "message";
    messageDiv.style.display = "none";
  }, 5000);
}
