const BACKEND = "https://chat-backend-gtg5.onrender.com";

// --- REGISTER ---
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    await fetch(BACKEND + "/api/register", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });
    alert("Registered successfully!");
    window.location.href = "login.html";
  } catch (err) {
    alert("Registration failed. Try again.");
  }
});

// --- LOGIN ---
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(BACKEND + "/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem("username", username);
      window.location.href = "chat.html";
    } else {
      alert("Login failed: " + (data.message || "Invalid credentials"));
    }
  } catch (err) {
    alert("Server error. Please try again later.");
  }
});

// --- LOGOUT ---
function logout() {
  localStorage.removeItem("username");
  window.location.href = "login.html";
}

// --- SOCKET & CHAT LOGIC ---
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

// Handle Sending Messages
function handleSend() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  const username = localStorage.getItem("username");

  if (text !== "" && socket) {
    socket.emit("sendMessage", { username, text: text });
    input.value = ""; // Clear box after send
    input.focus(); // Keep keyboard open
  }
}

// Backwards compatibility for HTML onclick
function sendMsg() { handleSend(); }

// Enter Key Support
document.getElementById("msg")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});

// --- REAL-TIME UPDATES ---
if (socket) {
  // 1. Receive Message Logic with 12hr AM/PM Time
  socket.on("receiveMessage", (data) => {
    const messagesUl = document.getElementById("messages");
    if (messagesUl) {
      const li = document.createElement("li");
      
      // --- Time Formatting Logic ---
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12; // Convert 24h to 12h
      const hoursStr = hours.toString().padStart(2, '0');
      const timeStr = `${hoursStr}:${minutes}:${seconds} ${ampm}`;

      li.innerHTML = `
        <span><strong>${data.username}:</strong> ${data.text}</span>
        <span class="msg-time" style="font-size: 0.65rem; color: #b59461; align-self: flex-end; margin-top: 4px;">${timeStr}</span>
      `;
      
      messagesUl.appendChild(li);

      // Auto-scroll to latest message
      messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
    }
  });

  // 2. Online User Counter
  socket.on("updateUserCount", (count) => {
    const countElement = document.getElementById("online-count");
    if (countElement) countElement.innerText = count;
  });
}

// Mobile Keyboard fix: Prevent chat occlusion
document.getElementById("msg")?.addEventListener("focus", () => {
    setTimeout(() => {
        const messagesUl = document.getElementById('messages');
        if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight;
    }, 300);
});
  
