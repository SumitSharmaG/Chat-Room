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

// Message bhejne aur box clear karne ka main function
function sendMsg() {
  const input = document.getElementById("msg");
  const text = input.value.trim();
  const username = localStorage.getItem("username");

  if (text !== "" && socket) {
    // 1. Socket par message bhejna
    socket.emit("sendMessage", { username, text: text });

    // 2. MAGIC: Input box ko turant khali karna
    input.value = "";

    // 3. Wapas box par focus lana (taaki user typing jari rakh sake)
    input.focus();
  }
}

// Enter Key dabane par message send ho jaye
document.getElementById("msg")?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMsg();
  }
});

// Message receive hone par screen par dikhana
if (socket) {
  socket.on("receiveMessage", (data) => {
    const messagesUl = document.getElementById("messages");
    if (messagesUl) {
      const li = document.createElement("li");
      
      // Ise premium look dene ke liye formatting
      li.innerHTML = `<strong>${data.username}:</strong> ${data.text}`;
      
      messagesUl.appendChild(li);

      // Auto-scroll to bottom: Naya message aate hi screen niche chali jayegi
      messagesUl.scrollTop = messagesUl.scrollHeight;
    }
  });
    }
