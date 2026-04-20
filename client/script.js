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
        alert("Server error during registration.");
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
        alert("Server error during login.");
    }
});

// --- 3. UTILITY & TIME ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

// --- 4. ADVANCED SCREENSHOT & 1.5s GESTURE DETECTION ---
let gestureTimer = null;
let lastAlertTime = 0;

function sendScreenshotAlert(reason = "took a screenshot") {
    const now = Date.now();
    if (now - lastAlertTime < 2000) return; 
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

// Mobile 3-Finger Gesture (1.5s Timer)
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => {
            sendScreenshotAlert("performed a 1.5s screenshot gesture");
        }, 1500);
    }
}, { passive: false });

document.addEventListener('touchend', () => {
    if (gestureTimer) { clearTimeout(gestureTimer); gestureTimer = null; }
});

// PC & Blur detection
window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') sendScreenshotAlert("pressed PrintScreen");
});
window.addEventListener('blur', () => sendScreenshotAlert("lost focus (possible screenshot)"));

// --- 5. CHAT LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const savedChat = localStorage.getItem("chat_history");
    const messagesUl = document.getElementById("messages");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }
});

if (socket) {
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

// --- 6. GLOBAL FUNCTIONS ---
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

document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.handleSend();
});
                                                       
