document.getElementById("admin-login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
  
    // Hardcoded for now — secure later with backend
    const validAdmin = {
      email: "admin@growbroai.com",
      password: "admin123"
    };
  
    if (email === validAdmin.email && password === validAdmin.password) {
      localStorage.setItem("currentAdmin", email);
      window.location.href = "admin-dashboard.html";
    } else {
      document.getElementById("error-msg").textContent = "Invalid admin credentials.";
    }
  });
  