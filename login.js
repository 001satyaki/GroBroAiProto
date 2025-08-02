document.querySelector(".login-form").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const email = document.querySelector("input[type='email']").value.trim().toLowerCase();
    const password = document.querySelector("input[type='password']").value;
  
    const storedData = localStorage.getItem(email);
  
    if (!storedData) {
      alert("No account found with this email.");
      return;
    }
  
    const user = JSON.parse(storedData);
  
    if (user.password !== password) {
      alert("Incorrect password.");
      return;
    }
  
    // Set session
    localStorage.setItem("currentUser", email);
    alert("Login successful!");
    window.location.href = "dashboard.html";
  });
  