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
    // 1. Socket par message bhejna
    socket.emit("sendMessage", { username, text: text });

    // 2. Input box ko turant khali karna
    input.value = "";

    // 3. Wapas focus rakhna (Mobile keyboard up rakhne ke liye)
    input.focus();

    // 4. Manual Scroll (Sending ke waqt)
    const messagesUl = document.getElementById('messages');
    if (messagesUl) {
      messagesUl.scrollTop = messagesUl.scrollHeight;
    }
  }
}

// Ye purane 'sendMsg' function ka alias hai agar aapne HTML me sendMsg use kiya ho
function sendMsg() {
    handleSend();
}

// Enter Key Support
document.getElementById("msg")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    handleSend();
  }
});

// --- REAL-TIME UPDATES ---
if (socket) {
  // 1. Receive Message Logic
  socket.on("receiveMessage", (data) => {
    const messagesUl = document.getElementById("messages");
    if (messagesUl) {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
      messagesUl.appendChild(li);

      // Smooth Auto-scroll to bottom
      messagesUl.scrollTo({
        top: messagesUl.scrollHeight,
        behavior: 'smooth'
      });
    }
  });

  // 2. Online User Counter (👁️ Symbol update)
  socket.on("updateUserCount", (count) => {
    const countElement = document.getElementById("online-count");
    if (countElement) {
      countElement.innerText = count;
    }
  });
}

// Mobile Keyboard fix: Input par click karte hi screen scroll ho jaye
document.getElementById("msg")?.addEventListener("focus", () => {
    setTimeout(() => {
        const messagesUl = document.getElementById('messages');
        if (messagesUl) {
            messagesUl.scrollTop = messagesUl.scrollHeight;
        }
    }, 300);
});
      
