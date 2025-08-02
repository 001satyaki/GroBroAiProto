document.getElementById('register-form').addEventListener('submit', function (e) {
    e.preventDefault();
  
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
  
    // Check if user already exists
    if (localStorage.getItem(email)) {
      alert("An account with this email already exists.");
      return;
    }
  
    // Create new user object
    const newUser = {
      name: name,
      email: email,
      password: password,
      activeProjects: 0,
      pendingTasks: 0,
      credits: 1000,
      services: [
        { name: "Content Creation", status: "Not Started" },
        { name: "UI/UX Design", status: "Not Started" },
        { name: "Automation Setup", status: "Not Started" }
      ]
    };
  
    // Save user data and session
    localStorage.setItem(email, JSON.stringify(newUser));
    localStorage.setItem("currentUser", email);
  
    alert("Account created successfully!");
    window.location.href = "dashboard.html";
  });
  