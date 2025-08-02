document.addEventListener("DOMContentLoaded", () => {
  const adminEmail = localStorage.getItem("currentAdmin");
  if (!adminEmail) {
    alert("Admin not logged in.");
    window.location.href = "admin-login.html";
    return;
  }

  const ordersContainer = document.getElementById("orders-container");
  const searchBar = document.getElementById("searchBar");
  const statusFilter = document.getElementById("statusFilter");

  let allOrders = [];

  Object.keys(localStorage).forEach(key => {
    if (key === "currentUser" || key === "currentAdmin") return;

    try {
      const user = JSON.parse(localStorage.getItem(key));
      if (!user.selectedServices) return;

      user.selectedServices.forEach((svc, index) => {
        allOrders.push({
          ...svc,
          index,
          email: key,
          userName: user.name
        });
      });
    } catch {}
  });

  function renderOrders(orders) {
    ordersContainer.innerHTML = "";
    orders.forEach(order => {
      const card = document.createElement("div");
      card.className = "order-card";

      let formHTML = "";
      if (order.form) {
        formHTML = `
          <div class="form-details">
            <h4>📝 Form Details:</h4>
            <p><strong>Brand:</strong> ${order.form.brand}</p>
            <p><strong>Target:</strong> ${order.form.target}</p>
            <p><strong>Colors:</strong> ${order.form.colors}</p>
            <p><strong>Reference:</strong> <a href="${order.form.reference}" target="_blank">${order.form.reference}</a></p>
            <p><strong>Notes:</strong> ${order.form.notes}</p>
          </div>
        `;
      }

      card.innerHTML = `
        <p><strong>User:</strong> ${order.userName} (${order.email})</p>
        <p><strong>Service:</strong> ${order.service}</p>
        <p><strong>Category:</strong> ${order.category}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Cost:</strong> ${order.cost} credits</p>
        <p><strong>Sample ID:</strong> ${order.sampleId ? order.sampleId.toUpperCase() : "None"}</p>
        ${formHTML}
        ${order.status === "Pending Approval" ? `
          <button class="btn approve-btn" data-email="${order.email}" data-index="${order.index}">Accept</button>
          <button class="btn reject reject-btn" data-email="${order.email}" data-index="${order.index}">Reject</button>
        ` : ""}
        ${order.status === "In Progress" ? `
          <input type="text" placeholder="Delivery link..." data-email="${order.email}" data-index="${order.index}" class="delivery-input" />
          <button class="btn deliver deliver-btn" data-email="${order.email}" data-index="${order.index}">Deliver</button>
        ` : ""}
        ${order.status === "Completed" ? `
          <p><strong>Delivered:</strong> <a href="${order.attachment}" target="_blank">${order.attachment}</a></p>
        ` : ""}
      `;
      ordersContainer.appendChild(card);
    });
  }

  function updateAnalytics() {
    document.getElementById("total-orders").textContent = `📦 Total Orders: ${allOrders.length}`;
    const revenue = allOrders.filter(o => o.status === "Completed").reduce((sum, o) => sum + parseInt(o.cost), 0);
    const activeClients = new Set(allOrders.map(o => o.email));
    const pendingCount = allOrders.filter(o => o.status === "Pending Approval").length;

    document.getElementById("total-revenue").textContent = `💰 Total Revenue: ${revenue}`;
    document.getElementById("active-clients").textContent = `👥 Active Clients: ${activeClients.size}`;
    document.getElementById("notifications").textContent = `🔔 New Requests: ${pendingCount}`;
  }

  function saveStatus(email, index, status, attachment = null) {
    const user = JSON.parse(localStorage.getItem(email));
    user.selectedServices[index].status = status;
    if (attachment) user.selectedServices[index].attachment = attachment;
    localStorage.setItem(email, JSON.stringify(user));
  }

  ordersContainer.addEventListener("click", e => {
    const el = e.target;

    if (el.classList.contains("approve-btn")) {
      saveStatus(el.dataset.email, el.dataset.index, "In Progress");
      location.reload();
    }

    if (el.classList.contains("reject-btn")) {
      saveStatus(el.dataset.email, el.dataset.index, "Rejected");
      location.reload();
    }

    if (el.classList.contains("deliver-btn")) {
      const linkInput = document.querySelector(`.delivery-input[data-email="${el.dataset.email}"][data-index="${el.dataset.index}"]`);
      const link = linkInput.value.trim();
      if (!link) return alert("Enter delivery link.");
      saveStatus(el.dataset.email, el.dataset.index, "Completed", link);
      location.reload();
    }
  });

  function applyFilters() {
    const keyword = searchBar.value.toLowerCase();
    const status = statusFilter.value;

    const filtered = allOrders.filter(order => {
      const matchText = (order.userName + order.email + order.service).toLowerCase();
      const statusMatch = (status === "all" || order.status === status);
      return matchText.includes(keyword) && statusMatch;
    });

    renderOrders(filtered);
  }

  searchBar.addEventListener("input", applyFilters);
  statusFilter.addEventListener("change", applyFilters);

  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("currentAdmin");
    window.location.href = "admin-login.html";
  });

  renderOrders(allOrders);
  updateAnalytics();

  // ===== ADMIN CHATROOM =====
  const userListEl = document.getElementById("user-list");
  const messagesEl = document.getElementById("admin-chat-messages");
  const inputEl = document.getElementById("admin-chat-input");
  const sendBtn = document.getElementById("admin-send");
  const chatWith = document.getElementById("chat-with");
  const chatTabBtn = document.getElementById("open-chat-tab");
  const chatSection = document.getElementById("admin-chatroom");
  const ordersSection = document.querySelector(".orders-section");

  let currentUserEmail = null;

  function getAllChatUsers() {
    return Object.keys(localStorage)
      .filter(k => k.startsWith("chat_"))
      .map(k => k.replace("chat_", ""));
  }

  function loadUsers() {
    const users = getAllChatUsers();
    userListEl.innerHTML = "";
    users.forEach(email => {
      const unread = JSON.parse(localStorage.getItem(`chat_unread_${email}`)) || {};
      const div = document.createElement("div");
      div.className = "user-item";
      if (unread.admin) div.classList.add("unread");
      div.textContent = email;
      div.dataset.email = email;
      userListEl.appendChild(div);
    });
  }

  function renderMessages(email) {
    currentUserEmail = email;
    chatWith.textContent = `Chat with ${email}`;
    const messages = JSON.parse(localStorage.getItem(`chat_${email}`)) || [];
    messagesEl.innerHTML = "";
    messages.forEach(msg => {
      const div = document.createElement("div");
      div.className = `msg ${msg.sender}`;
      div.textContent = msg.message;
      messagesEl.appendChild(div);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
    localStorage.setItem(`chat_unread_${email}`, JSON.stringify({ admin: false, user: true }));
    loadUsers();
  }

  sendBtn.addEventListener("click", () => {
    if (!currentUserEmail) return;
    const message = inputEl.value.trim();
    if (!message) return;
    const msg = { sender: "admin", message, timestamp: new Date().toLocaleString() };
    const key = `chat_${currentUserEmail}`;
    const data = JSON.parse(localStorage.getItem(key)) || [];
    data.push(msg);
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`chat_unread_${currentUserEmail}`, JSON.stringify({ admin: false, user: true }));
    inputEl.value = "";
    renderMessages(currentUserEmail);
  });

  userListEl.addEventListener("click", e => {
    if (e.target.classList.contains("user-item")) {
      const email = e.target.dataset.email;
      renderMessages(email);
    }
  });

  chatTabBtn.addEventListener("click", () => {
    chatSection.classList.toggle("hidden");
    ordersSection.classList.toggle("hidden");
  });

  loadUsers();
});
