const BACKEND = "https://chat-backend-gtg5.onrender.com";

const isChatPage = window.location.pathname.includes("chat.html");
const socket = isChatPage ? io(BACKEND, { transports: ["websocket"] }) : null;

// 🔥 CONNECT
if (socket) {
    socket.on("connect", () => {
        console.log("✅ Socket Connected:", socket.id);

        const username = localStorage.getItem("username");
        if (username) {
            socket.emit("userJoined", username);
        }
    });
}

// ================== SCREENSHOT LOGIC ==================
let gestureTimer = null;
let lastAlertTime = 0;

function sendScreenshotAlert(reason = "captured screen") {
    const now = Date.now();
    if (now - lastAlertTime < 2000) return;

    lastAlertTime = now;

    const username = localStorage.getItem("username") || "User";

    socket?.emit("sendMessage", {
        username: "SYSTEM",
        text: `📸 ${username} ${reason}`,
        isAlert: true,
        time: getCurrentTime()
    });
}

// 📱 3 finger mobile detection
document.addEventListener("touchstart", (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => {
            sendScreenshotAlert();
        }, 800);
    }
});

document.addEventListener("touchend", () => {
    if (gestureTimer) clearTimeout(gestureTimer);
});

// 💻 PrintScreen detection
window.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen" || e.key === "PrtSc") {
        sendScreenshotAlert();
    }
});

// 👀 TAB SWITCH (MOST IMPORTANT)
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        sendScreenshotAlert("switched screen");
    }
});
// ======================================================

// --- LOGIN / REGISTER ---
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(BACKEND + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        alert("Registered!");
        window.location.href = "login.html";
    } else {
        alert("Error");
    }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

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
        alert("Login failed");
    }
});

// --- TIME ---
function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m}:${s} ${ampm}`;
}

// --- CHAT ---
const messagesUl = document.getElementById("messages");

function scrollToBottom() {
    if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight;
}

// PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("username");

    const userDisplayEl = document.getElementById("display-username");
    if (userDisplayEl && user) userDisplayEl.innerText = `@${user}`;

    const savedChat = localStorage.getItem("chat_history");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        scrollToBottom();
    }
});

// ================== TYPING ==================
let typingTimeout;

document.getElementById("msg")?.addEventListener("input", () => {
    const username = localStorage.getItem("username");

    socket?.emit("typing", username);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        socket?.emit("stopTyping", username);
    }, 1000);
});

let typingEl = null;

socket?.on("userTyping", (username) => {
    if (typingEl) return;

    typingEl = document.createElement("li");
    typingEl.innerHTML = `${username} typing...`;
    typingEl.style.fontSize = "0.7rem";

    messagesUl.appendChild(typingEl);
    scrollToBottom();
});

socket?.on("userStopTyping", () => {
    typingEl?.remove();
    typingEl = null;
});
// ============================================

// ================== SEEN ==================
const seenMap = {};

socket?.on("updateSeen", ({ messageId, seenBy }) => {
    seenMap[messageId] = seenBy;
});
// =========================================

// SOCKET EVENTS
socket?.on("receiveMessage", (data) => {
    displayMessage(data);

    const myUser = localStorage.getItem("username");

    if (data._id && data.username !== myUser) {
        socket.emit("messageSeen", {
            messageId: data._id,
            username: myUser
        });
    }
});

socket?.on("updateUserCount", (count) => {
    document.getElementById("online-count").innerText = count;
});

socket?.on("chatCleared", () => {
    messagesUl.innerHTML = "";
    localStorage.removeItem("chat_history");
});

// DISPLAY
function displayMessage(data) {
    if (!messagesUl) return;

    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");

    if (data.username === myUser) li.classList.add("my-message");

    const messageId = data._id || Math.random();

    li.innerHTML = `
        <span><strong>${data.username}:</strong> ${data.text}</span>
        <span style="font-size: 0.6rem;">
            ${data.time || getCurrentTime()}
            <button onclick="showSeen('${messageId}')">ⓘ</button>
        </span>
    `;

    messagesUl.appendChild(li);
    scrollToBottom();

    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// Seen popup
window.showSeen = function(id) {
    const users = seenMap[id] || [];
    alert("Seen by:\n" + users.join("\n"));
};

// ACTIONS
window.handleSend = function () {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    if (text && socket) {
        socket.emit("sendMessage", {
            username: localStorage.getItem("username"),
            text,
            time: getCurrentTime()
        });
        input.value = "";
    }
};

window.clearChat = function () {
    if (confirm("Clear chat?")) {
        socket.emit("clearAllChat");
    }
};

window.logout = function () {
    localStorage.clear();
    window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
    }
});
