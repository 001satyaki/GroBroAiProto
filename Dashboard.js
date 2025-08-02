document.addEventListener("DOMContentLoaded", () => {
  const currentEmail = localStorage.getItem("currentUser");
  if (!currentEmail) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  const user = JSON.parse(localStorage.getItem(currentEmail));
  document.getElementById("user-name").textContent = user.name;
  document.getElementById("username-display").textContent = user.name;

  const services = user.selectedServices || [];
  const activeProjects = services.filter(s => s.status === "In Progress").length;
  const pendingTasks = services.filter(s => s.status === "Cancelled").length;
  const recentOrders = services.length;

  document.getElementById("active-projects").textContent = activeProjects;
  document.getElementById("pending-tasks").textContent = pendingTasks;
  document.getElementById("recent-orders").textContent = recentOrders;
  document.getElementById("credits").textContent = user.credits;

  // ========== Active Services Rendering ==========
  const tracker = document.getElementById("progress-cards");
  tracker.innerHTML = "";

  services.forEach((svc, i) => {
    let card = `
      <div class="card">
        <h4>${svc.service}</h4>
        <p><strong>Category:</strong> ${svc.category}</p>
        <p><strong>Status:</strong> ${svc.status}</p>
        <p><strong>Cost:</strong> ${svc.cost} credits</p>
    `;

    if (svc.sampleId) {
      card += `<p><strong>Sample:</strong> ${svc.sampleId.toUpperCase()}</p>`;
    }

    if (svc.status === "In Progress") {
      card += `<button class="cancel-service" data-index="${i}">Cancel</button>`;
    }

    if (svc.status === "Completed" && svc.attachment) {
      card += `<a href="${svc.attachment}" target="_blank" class="btn">📎 View Delivered Work</a>`;
    }

    card += "</div>";
    tracker.innerHTML += card;
  });

  // Cancel Service Handler
  setTimeout(() => {
    document.querySelectorAll(".cancel-service").forEach(btn => {
      btn.addEventListener("click", () => {
        const i = btn.dataset.index;
        const svc = user.selectedServices[i];
        if (svc.status === "Completed") return alert("You cannot cancel a completed order.");
        user.credits += Math.floor(svc.cost / 2);
        user.selectedServices[i].status = "Cancelled";
        localStorage.setItem(currentEmail, JSON.stringify(user));
        location.reload();
      });
    });
  }, 100);

  // Logout Handler
  document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });

  // ========== SAMPLE + FORM LOGIC ==========
  let selectedSample = null;
  let filledForm = null;

  const sampleData = {
    "SEO Blog Post": [...Array(5)].map((_, i) => ({
      id: `seo${i + 1}`,
      images: [`/samples/blog${i + 1}-1.jpg`, `/samples/blog${i + 1}-2.jpg`, `/samples/blog${i + 1}-3.jpg`, `/samples/blog${i + 1}-4.jpg`, `/samples/blog${i + 1}-5.jpg`]
    })),
    "Landing Page UI": [...Array(5)].map((_, i) => ({
      id: `ui${i + 1}`,
      images: [`/samples/ui${i + 1}-1.jpg`, `/samples/ui${i + 1}-2.jpg`, `/samples/ui${i + 1}-3.jpg`, `/samples/ui${i + 1}-4.jpg`, `/samples/ui${i + 1}-5.jpg`]
    }))
  };

  document.querySelectorAll('.service-dropdown').forEach(select => {
    select.addEventListener('change', function () {
      const selected = this.options[this.selectedIndex].value;
      const category = this.parentElement.querySelector("h4").textContent;
      if (selected) showSamples(selected);
    });
  });

  function showSamples(serviceName) {
    const section = document.getElementById("sample-section");
    const container = document.getElementById("sample-cards");
    document.getElementById("sample-service-name").textContent = serviceName;
    section.style.display = "block";
    container.innerHTML = "";

    const samples = sampleData[serviceName];
    samples.forEach(sample => {
      let currentIndex = 0;
      const card = document.createElement("div");
      card.className = "sample-card";
      const sliderId = `slider-${sample.id}`;
      const sliderImgs = sample.images.map((img, i) =>
        `<img src="${img}" class="${i === 0 ? 'active' : ''}" />`
      ).join("");

      card.innerHTML = `
        <h4>Sample ${sample.id.toUpperCase()}</h4>
        <div class="sample-slider" id="${sliderId}">
          <span class="arrow left">&#10094;</span>
          ${sliderImgs}
          <span class="arrow right">&#10095;</span>
        </div>
        <button class="btn choose-sample" data-id="${sample.id}" data-service="${serviceName}">Choose this Sample</button>
      `;
      container.appendChild(card);

      const slider = card.querySelector(".sample-slider");
      const images = slider.querySelectorAll("img");
      slider.querySelector(".arrow.left").addEventListener("click", () => {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        images[currentIndex].classList.add("active");
      });
      slider.querySelector(".arrow.right").addEventListener("click", () => {
        images[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add("active");
      });
    });

    setTimeout(() => {
      document.querySelectorAll(".choose-sample").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedSample = btn.dataset.id;
          openForm();
        });
      });
    }, 200);
  }

  function openForm() {
    document.getElementById("sample-form-modal").classList.remove("hidden");
  }

  document.getElementById("close-form").addEventListener("click", () => {
    document.getElementById("sample-form-modal").classList.add("hidden");
  });

  document.getElementById("sample-details-form").addEventListener("submit", e => {
    e.preventDefault();
    const form = e.target;
    filledForm = {
      brand: form.brand.value,
      target: form.target.value,
      colors: form.colors.value,
      reference: form.reference.value,
      notes: form.notes.value
    };
    alert("Details submitted. Now click 'Request' to place order.");
    document.getElementById("sample-form-modal").classList.add("hidden");
  });

  document.querySelectorAll('.request-service').forEach(btn => {
    btn.addEventListener('click', () => {
      const select = btn.previousElementSibling;
      const selected = select.options[select.selectedIndex];
      const name = selected.value;
      const cost = parseInt(selected.dataset.cost);
      const category = btn.parentElement.querySelector('h4').textContent;

      if (!name) return alert("Choose a service.");
      if (!selectedSample || !filledForm) return alert("Select a sample and fill the form.");
      if (user.credits < cost) return alert("Not enough credits!");

      user.credits -= cost;
      user.selectedServices = user.selectedServices || [];
      user.selectedServices.push({
        service: name,
        category,
        sampleId: selectedSample,
        form: filledForm,
        status: "Pending Approval",
        cost,
        date: new Date().toLocaleString(),
        attachment: ""
      });

      localStorage.setItem(currentEmail, JSON.stringify(user));
      alert("Order placed successfully!");
      selectedSample = null;
      filledForm = null;
      location.reload();
    });
  });
});

// ==== CHAT WIDGET ====
const chatBtn = document.getElementById("open-chat");
const chatPopup = document.getElementById("chat-popup");
const closeChat = document.getElementById("close-chat");
const chatTabs = document.querySelectorAll(".tab-btn");
const chatContents = document.querySelectorAll(".chat-content");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-chat");
const messagesDiv = document.getElementById("chat-messages");

const currentEmail = localStorage.getItem("currentUser");
const chatKey = `chat_${currentEmail}`;
let chatData = JSON.parse(localStorage.getItem(chatKey)) || [];

function renderMessages() {
  messagesDiv.innerHTML = "";
  chatData.forEach(msg => {
    const div = document.createElement("div");
    div.className = `msg ${msg.sender}`;
    div.textContent = msg.message;
    messagesDiv.appendChild(div);
  });
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

chatBtn.addEventListener("click", () => {
  chatPopup.style.display = "block";
  localStorage.setItem(`chat_unread_${currentEmail}`, JSON.stringify({ user: false, admin: true }));
  renderMessages();
});

closeChat.addEventListener("click", () => chatPopup.style.display = "none");

chatTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    chatTabs.forEach(b => b.classList.remove("active"));
    chatContents.forEach(c => c.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById(`${btn.dataset.tab}-tab`).classList.remove("hidden");
  });
});

sendBtn.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  if (!msg) return;
  const messageObj = { sender: "user", message: msg, timestamp: new Date().toLocaleString() };
  chatData.push(messageObj);
  localStorage.setItem(chatKey, JSON.stringify(chatData));
  localStorage.setItem(`chat_unread_${currentEmail}`, JSON.stringify({ user: false, admin: true }));
  chatInput.value = "";
  renderMessages();
});
