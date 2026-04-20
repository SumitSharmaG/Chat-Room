const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

// --- 1. REGISTER & LOGIN LOGIC ---
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
        const res = await fetch(BACKEND + "/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        if (res.ok) { alert("Registered successfully!"); window.location.href = "login.html"; }
        else { alert("Registration failed."); }
    } catch (err) { alert("Server error."); }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
        const res = await fetch(BACKEND + "/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            localStorage.setItem("username", username);
            window.location.href = "chat.html";
        } else { alert("Login failed."); }
    } catch (err) { alert("Server error."); }
});

// --- 2. UTILITY FUNCTIONS ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

// --- 3. ADVANCED SCREENSHOT DETECTION ---
let lastAlertTime = 0;
function sendScreenshotAlert(reason = "took a screenshot") {
    const now = Date.now();
    if (now - lastAlertTime < 3000) return; // 3 second gap to avoid spam
    lastAlertTime = now;

    const username = localStorage.getItem("username") || "Someone";
    if (socket) {
        socket.emit("sendMessage", { 
            username: "SYSTEM ALERT", 
            text: `📸 ${username} ${reason}!`, 
            isAlert: true, 
            time: getCurrentTime() 
        });
    }
}

// PC Shortcuts
window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') sendScreenshotAlert("pressed PrintScreen");
});

// Mobile/Desktop Focus Detection (Jugad for mobile screenshots)
window.addEventListener('blur', () => {
    sendScreenshotAlert("possible screenshot/tab switch");
});

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === 'hidden') {
        sendScreenshotAlert("screen hidden/screenshot");
    }
});

// --- 4. CHAT LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const savedChat = localStorage.getItem("chat_history");
    const messagesUl = document.getElementById("messages");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }
});

if (socket) {
    socket.on("loadHistory", (history) => {
        const messagesUl = document.getElementById("messages");
        if (messagesUl && messagesUl.innerHTML.trim() === "") {
            history.forEach(data => displayMessage(data));
        }
    });

    socket.on("receiveMessage", (data) => displayMessage(data));

    socket.on("updateUserCount", (count) => {
        const el = document.getElementById("online-count");
        if (el) el.innerText = count;
    });

    socket.on("chatCleared", () => {
        document.getElementById("messages").innerHTML = "";
        localStorage.removeItem("chat_history");
    });
}

function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;

    const li = document.createElement("li");
    if (data.isAlert || data.username === "SYSTEM ALERT") {
        li.className = "alert-msg";
        li.innerHTML = `<span>${data.text} - ${data.time}</span>`;
    } else {
        li.innerHTML = `
            <span><strong>${data.username}:</strong> ${data.text}</span>
            <span class="msg-time">${data.time || getCurrentTime()}</span>
        `;
    }
    messagesUl.appendChild(li);
    messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// --- GLOBAL ACTIONS ---
window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        socket.emit("sendMessage", { 
            username: localStorage.getItem("username"), 
            text, 
            time: getCurrentTime() 
        });
        input.value = "";
        input.focus();
    }
};

window.clearChat = function() {
    if (confirm("Delete all chat history for everyone?")) {
        socket?.emit("clearAllChat");
        document.getElementById("messages").innerHTML = "";
        localStorage.removeItem("chat_history");
    }
};

window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.handleSend();
});
