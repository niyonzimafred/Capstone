// Switch between Sign In and Create Account tabs
function switchTab(tab) {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((t) => t.classList.remove("active"));

  if (tab === "signin") {
    tabs[0].classList.add("active");
    document.querySelector(".sign-in-btn").textContent = "Sign In";
  } else {
    tabs[1].classList.add("active");
    document.querySelector(".sign-in-btn").textContent = "Create Account";
  }
}

// Handle form submission
function handleSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const activeTab = document.querySelector(".tab.active").textContent;

  // Here you would typically make an API call to authenticate or create account
  console.log("Form submitted:", {
    action: activeTab,
    email: email,
    password: password,
  });

  alert(`${activeTab} attempted with email: ${email}`);

  // Clear form after submission (optional)
  // document.getElementById('loginForm').reset();
}

// Handle Google Sign In
function handleGoogleSignIn() {
  // Here you would integrate with Google OAuth
  console.log("Google Sign In clicked");
  alert("Google Sign In clicked - Integration would go here");
}

// Add input validation feedback (optional enhancement)
document.addEventListener("DOMContentLoaded", function () {
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Email validation on blur
  emailInput.addEventListener("blur", function () {
    if (this.value && !isValidEmail(this.value)) {
      this.style.borderColor = "#ef4444";
    } else if (this.value) {
      this.style.borderColor = "#10b981";
    }
  });

  // Reset border on focus
  emailInput.addEventListener("focus", function () {
    this.style.borderColor = "#10b981";
  });

  passwordInput.addEventListener("focus", function () {
    this.style.borderColor = "#10b981";
  });
});

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
