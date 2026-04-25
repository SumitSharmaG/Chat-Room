const BACKEND = "https://chat-backend-gtg5.onrender.com";

// ✅ Detect page
const isChatPage = window.location.pathname.includes("chat.html");

// ✅ Socket only for chat page
const socket = isChatPage ? io(BACKEND, { transports: ["websocket"] }) : null;

// 🔥 CONNECT + USER JOIN
if (socket) {
    socket.on("connect", () => {
        console.log("✅ Socket Connected:", socket.id);

        const username = localStorage.getItem("username");

        if (username) {
            socket.emit("userJoined", username);
        }
    });
}

// 🟢 NEW: Typing system
let typingTimeout;

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

        if (res.ok) {
            alert("Registered successfully!");
            window.location.href = "login.html";
        } else {
            alert("Registration failed.");
        }
    } catch (err) {
        alert("Server error.");
    }
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
        } else {
            alert("Login failed.");
        }
    } catch (err) {
        alert("Server error.");
    }
});

// --- 2. UTILS ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

// --- 3. SCREENSHOT DETECTION ---
let gestureTimer = null;
let lastAlertTime = 0;

function sendScreenshotAlert(reason = "Screenshot") {
    const now = Date.now();
    if (now - lastAlertTime < 2000) return;

    lastAlertTime = now;

    const username = localStorage.getItem("username") || "User";

    if (socket) {
        socket.emit("sendMessage", {
            username: "SYSTEM",
            text: `📸 ${username} ${reason}`,
            isAlert: true,
            time: getCurrentTime()
        });
    }
}

// 🟢 NEW: Typing input event
const msgInput = document.getElementById("msg");

msgInput?.addEventListener("input", () => {
    const username = localStorage.getItem("username");

    socket.emit("typing", username);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        socket.emit("stopTyping", username);
    }, 1000);
});

// --- 4. CHAT LOGIC ---
const messagesUl = document.getElementById("messages");

function scrollToBottom() {
    if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight;
}

// 🟢 NEW typing UI
let typingEl = null;

if (socket) {
    socket.on("userTyping", (username) => {
        if (typingEl) return;

        typingEl = document.createElement("li");
        typingEl.innerHTML = `${username} typing...`;
        typingEl.style.fontSize = "0.7rem";

        messagesUl.appendChild(typingEl);
        scrollToBottom();
    });

    socket.on("userStopTyping", () => {
        if (typingEl) {
            typingEl.remove();
            typingEl = null;
        }
    });
}

// 🔥 SOCKET EVENTS
if (socket) {
    socket.on("receiveMessage", (data) => {
        displayMessage(data);

        const username = localStorage.getItem("username");

        if (data._id && data.username !== username) {
            socket.emit("messageSeen", {
                messageId: data._id,
                username
            });
        }
    });

    socket.on("updateUserCount", (count) => {
        const el = document.getElementById("online-count");
        if (el) el.innerText = count;
    });
}

// 🟢 NEW Seen map
const seenMap = {};

if (socket) {
    socket.on("updateSeen", ({ messageId, seenBy }) => {
        seenMap[messageId] = seenBy;
    });
}

// --- DISPLAY MESSAGE ---
function displayMessage(data) {
    if (!messagesUl) return;

    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");

    if (data.username === myUser) {
        li.classList.add("my-message");
    }

    const messageId = data._id || Math.random();

    li.innerHTML = `
        <span><strong>${data.username}:</strong> ${data.text}</span>
        <span style="font-size: 0.6rem;">
            ${data.time || getCurrentTime()}
            <button onclick="showSeen('${messageId}')">⫶</button>
        </span>
    `;

    messagesUl.appendChild(li);
    scrollToBottom();
}

// 🟢 NEW popup
window.showSeen = function(messageId) {
    const users = seenMap[messageId] || [];
    alert("This Msg Seen By :--:\n" + users.join("\n"));
};

// --- GLOBAL ACTIONS ---
window.handleSend = function () {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    if (text !== "" && socket) {
        socket.emit("sendMessage", {
            username: localStorage.getItem("username"),
            text,
            time: getCurrentTime()
        });

        input.value = "";
    }
};
