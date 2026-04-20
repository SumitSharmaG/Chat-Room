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

// Handle Sending Messages (WhatsApp Style)
function handleSend() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  const username = localStorage.getItem("username");

  if (text !== "" && socket) {
    // Socket par message bhejna
    socket.emit("sendMessage", { username, text: text });

    // Input box ko turant khali karna aur focus wapas lana
    input.value = "";
    input.focus();

    // Manual Scroll (Sending ke waqt turant niche le jaye)
    const messagesUl = document.getElementById('messages');
    if (messagesUl) {
      messagesUl.scrollTop = messagesUl.scrollHeight;
    }
  }
}

// Enter Key Support
document.getElementById("msg")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
});

// --- REAL-TIME UPDATES ---
if (socket) {
  // 1. Receive Message Logic with Time Stamp
  socket.on("receiveMessage", (data) => {
    const messagesUl = document.getElementById("messages");
    if (messagesUl) {
      const li = document.createElement("li");
      
      // Current Time nikalne ka logic (HH:MM:SS)
      const now = new Date();
      const timeStr = now.getHours().toString().padStart(2, '0') + ":" + 
                      now.getMinutes().toString().padStart(2, '0') + ":" + 
                      now.getSeconds().toString().padStart(2, '0');

      // Message content with Time span
      li.innerHTML = `
        <span><strong>${data.username}:</strong> ${data.text}</span>
        <span class="msg-time" style="font-size: 0.65rem; color: #b59461; align-self: flex-end; margin-top: 4px; opacity: 0.8;">${timeStr}</span>
      `;
      
      messagesUl.appendChild(li);

      // Smooth Auto-scroll to bottom
      messagesUl.scrollTo({
        top: messagesUl.scrollHeight,
        behavior: 'smooth'
      });
    }
  });

  // 2. Online User Counter (👁️ Update)
  socket.on("updateUserCount", (count) => {
    const countElement = document.getElementById("online-count");
    if (countElement) {
      countElement.innerText = count;
    }
  });
}

// Mobile Keyboard fix: Jab user type karne ke liye click kare to last message dikhe
document.getElementById("msg")?.addEventListener("focus", () => {
    setTimeout(() => {
        const messagesUl = document.getElementById('messages');
        if (messagesUl) {
            messagesUl.scrollTo({
                top: messagesUl.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, 300);
});
