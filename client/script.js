const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

// --- 1. REGISTER LOGIC ---
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
        if (res.ok) {
            alert("Registered successfully!");
            window.location.href = "login.html";
        } else {
            alert("Registration failed. User might already exist.");
        }
    } catch (err) {
        alert("Server error. Try again.");
    }
});

// --- 2. LOGIN LOGIC ---
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
        } else {
            alert("Login failed: " + (data.message || "Invalid credentials"));
        }
    } catch (err) {
        alert("Server error. Please try again later.");
    }
});

// --- 3. CHAT & PERSISTENCE LOGIC ---

// Page load par LocalStorage se chat dikhao
document.addEventListener("DOMContentLoaded", () => {
    const savedChat = localStorage.getItem("chat_history");
    const messagesUl = document.getElementById("messages");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }
});

function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

// --- SCREENSHOT DETECTION ---
function sendScreenshotAlert() {
    const username = localStorage.getItem("username") || "Someone";
    if (socket) {
        socket.emit("sendMessage", { 
            username: "SYSTEM ALERT", 
            text: `📸 ${username} took a screenshot!`, 
            isAlert: true, 
            time: getCurrentTime() 
        });
    }
}

window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') sendScreenshotAlert();
});

// --- SOCKET EVENTS ---
if (socket) {
    socket.on("loadHistory", (history) => {
        const messagesUl = document.getElementById("messages");
        // Sirf tab load karein jab screen khali ho
        if (messagesUl && messagesUl.innerHTML.trim() === "") {
            history.forEach(data => displayMessage(data));
        }
    });

    socket.on("receiveMessage", (data) => {
        displayMessage(data);
    });

    socket.on("updateUserCount", (count) => {
        const countEl = document.getElementById("online-count");
        if (countEl) countEl.innerText = count;
    });

    socket.on("chatCleared", () => {
        const messagesUl = document.getElementById("messages");
        if (messagesUl) messagesUl.innerHTML = "";
        localStorage.removeItem("chat_history");
    });
}

function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;

    const li = document.createElement("li");
    if (data.isAlert || data.username === "SYSTEM ALERT") {
        li.style.cssText = "align-self: center; background: rgba(255, 77, 77, 0.15); border: 1px solid #ff4d4d; color: #ff4d4d; font-size: 0.75rem; font-weight: bold; border-radius: 8px; padding: 5px 10px; margin: 5px 0;";
        li.innerHTML = `<span>${data.text} - ${data.time}</span>`;
    } else {
        li.innerHTML = `
            <span><strong>${data.username}:</strong> ${data.text}</span>
            <span style="font-size: 0.6rem; color: #b59461; align-self: flex-end; margin-top: 4px;">${data.time || getCurrentTime()}</span>
        `;
    }
    
    messagesUl.appendChild(li);
    messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// Global functions for HTML
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
    if (confirm("Clear all chat for everyone?")) {
        socket?.emit("clearAllChat");
        document.getElementById("messages").innerHTML = "";
        localStorage.removeItem("chat_history");
    }
};

window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

// Enter Key
document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.handleSend();
});
    
