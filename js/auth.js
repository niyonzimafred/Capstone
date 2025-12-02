// Authentication JavaScript - Handles login and signup

// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const currentPage = window.location.pathname;

  // If user is logged in and on auth pages, redirect to dashboard
  if (
    user &&
    (currentPage.includes("index.html") ||
      currentPage.includes("Signup.html") ||
      currentPage.endsWith("/Capstone/"))
  ) {
    window.location.href = "./Pages/dashboard.html";
    return;
  }

  // If user is not logged in and trying to access protected pages, redirect to login
  if (
    !user &&
    (currentPage.includes("dashboard.html") ||
      currentPage.includes("transactions.html") ||
      currentPage.includes("categories.html") ||
      currentPage.includes("analytics.html") ||
      currentPage.includes("settings.html"))
  ) {
    window.location.href = "../../index.html";
    return;
  }

  setupAuthForms();
});

// Setup auth forms
function setupAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
}

// Handle login
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  // Clear previous error
  errorMessage.textContent = "";

  // Validate input
  if (!email || !password) {
    showError("Please fill in all fields", errorMessage);
    return;
  }

  // Get registered users
  const registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];

  // Find user with matching email and password
  const user = registeredUsers.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    showError("Invalid email or password", errorMessage);
    return;
  }

  // Store logged in user
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: user.id,
      displayName: user.name,
      email: user.email,
      loginTime: new Date().toISOString(),
    })
  );

  // Redirect to dashboard
  setTimeout(() => {
    window.location.href = "./Pages/dashboard.html";
  }, 100);
}

// Handle signup
function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorMessage = document.getElementById("errorMessage");

  // Clear previous error
  errorMessage.textContent = "";

  // Validate input
  if (!name || !email || !password || !confirmPassword) {
    showError("Please fill in all fields", errorMessage);
    return;
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long", errorMessage);
    return;
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match", errorMessage);
    return;
  }

  // Validate email format
  if (!isValidEmail(email)) {
    showError("Please enter a valid email", errorMessage);
    return;
  }

  // Get registered users
  let registeredUsers =
    JSON.parse(localStorage.getItem("registeredUsers")) || [];

  // Check if email already exists
  if (registeredUsers.some((u) => u.email === email)) {
    showError(
      "Email already registered. Please login or use a different email",
      errorMessage
    );
    return;
  }

  // Create new user
  const newUser = {
    id:
      registeredUsers.length > 0
        ? Math.max(...registeredUsers.map((u) => u.id)) + 1
        : 1,
    name,
    email,
    password, // In production, this should be hashed
    createdAt: new Date().toISOString(),
  };

  // Add user to registered users
  registeredUsers.push(newUser);
  localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

  // Auto-login the user
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: newUser.id,
      displayName: newUser.name,
      email: newUser.email,
      loginTime: new Date().toISOString(),
    })
  );

  // Redirect to dashboard
  setTimeout(() => {
    window.location.href = "./Pages/dashboard.html";
  }, 100);
}

// Show error message
function showError(message, errorElement) {
  errorElement.textContent = message;
  errorElement.style.display = "block";

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.textContent = "";
    errorElement.style.display = "none";
  }, 5000);
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
