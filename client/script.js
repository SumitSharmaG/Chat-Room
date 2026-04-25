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

// 🟢 Typing system
let typingTimeout;

// --- REGISTER & LOGIN ---
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
    } catch {
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
    } catch {
        alert("Server error.");
    }
});

// --- UTILS ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
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

document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => {
            sendScreenshotAlert("captured screen");
        }, 1000);
    }
});

document.addEventListener('touchend', () => {
    if (gestureTimer) clearTimeout(gestureTimer);
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen') sendScreenshotAlert("captured screen");
});

}

// --- CHAT ---
const messagesUl = document.getElementById("messages");

function scrollToBottom() {
    if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight;
}

// 🟢 PAGE LOAD FIX
document.addEventListener("DOMContentLoaded", () => {
    const myUser = localStorage.getItem("username");

    // username show
    const userDisplayEl = document.getElementById("display-username");
    if (userDisplayEl && myUser) {
        userDisplayEl.innerText = `@${myUser}`;
    }

    // restore chat
    const savedChat = localStorage.getItem("chat_history");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        scrollToBottom();
    }
});

// 🟢 Typing input
const msgInput = document.getElementById("msg");

msgInput?.addEventListener("input", () => {
    const username = localStorage.getItem("username");

    socket?.emit("typing", username);

    clearTimeout(typingTimeout);

    typingTimeout = setTimeout(() => {
        socket?.emit("stopTyping", username);
    }, 1000);
});

// 🟢 Typing UI
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

// 🟢 Seen system
const seenMap = {};

if (socket) {
    socket.on("updateSeen", ({ messageId, seenBy }) => {
        seenMap[messageId] = seenBy;
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

    socket.on("chatCleared", () => {
        if (messagesUl) messagesUl.innerHTML = "";
        localStorage.removeItem("chat_history");
    });
}

// --- DISPLAY MESSAGE ---
function displayMessage(data) {
    if (!messagesUl) return;

    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");

    if (data.isAlert || data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; color: yellow; font-size: 0.6rem;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        if (data.username === myUser) {
            li.classList.add("my-message");
        }

        const messageId = data._id || Math.random();

        li.innerHTML = `
            <span><strong style="color: var(--accent-gold)">${data.username}:</strong> ${data.text}</span>
            <span style="font-size: 0.6rem; color: #b59461;">
                ${data.time || getCurrentTime()}
                <button class="info-btn" onclick="showSeen('${messageId}')">ⓘ</button>
            </span>
        `;
    }

    messagesUl.appendChild(li);
    scrollToBottom();

    // 🔥 SAVE CHAT FIX
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// 🟢 Seen popup
window.showSeen = function(messageId) {
    const users = seenMap[messageId] || [];
    alert("This Msg Seen By:\n" + users.join("\n"));
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

window.clearChat = function () {
    if (confirm("Clear chat history?")) {
        socket?.emit("clearAllChat");
        if (messagesUl) messagesUl.innerHTML = "";
        localStorage.removeItem("chat_history");
    }
};

window.logout = function () {
    localStorage.clear();
    window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        window.handleSend();
    }
});
