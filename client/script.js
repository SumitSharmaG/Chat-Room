const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const messagesUl = document.getElementById("messages");

// --- 1. UTILS ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

function scrollToBottom() { if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight; }

// --- 2. SCREENSHOT & SECURITY (RESTORED) ---
let gestureTimer = null;
let lastAlertTime = 0;

function sendScreenshotAlert(reason = "Screenshot") {
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

document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => { sendScreenshotAlert("captured screen"); }, 1000);
    }
}, { passive: false });

document.addEventListener('touchend', () => { if (gestureTimer) { clearTimeout(gestureTimer); gestureTimer = null; } });
window.addEventListener('keyup', (e) => { if (e.key === 'PrintScreen' || e.key === 'PrtSc') sendScreenshotAlert("captured screen"); });

// --- 3. CHAT INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const myUser = localStorage.getItem("username");
    if (document.getElementById("display-username") && myUser) {
        document.getElementById("display-username").innerText = `@${myUser}`;
    }
    const savedChat = localStorage.getItem("chat_history");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        scrollToBottom();
    }
});

// Typing Event
let typingTimeout;
document.getElementById("msg")?.addEventListener("input", () => {
    socket?.emit("typing", { username: localStorage.getItem("username") });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket?.emit("stopTyping"), 2000);
});

// --- 4. SOCKET EVENTS ---
if (socket) {
    socket.on("receiveMessage", (data) => {
        displayMessage(data);
        const myUser = localStorage.getItem("username");
        // Mark as seen only if not my message and not a system alert
        if (data.username !== myUser && data.id && data.username !== "SYSTEM") {
            socket.emit("messageSeenUpdate", { msgId: data.id, user: myUser });
        }
    });

    socket.on("displayTyping", (data) => { 
        const el = document.getElementById("typing-indicator");
        if (el) el.innerText = `${data.username} is typing...`; 
    });

    socket.on("removeTyping", () => { 
        const el = document.getElementById("typing-indicator");
        if (el) el.innerText = ""; 
    });

    socket.on("userSeenTheMessage", (data) => {
        const namesSpan = document.querySelector(`#box-${data.msgId} .names`);
        if (namesSpan) {
            if (namesSpan.innerText === "Loading...") namesSpan.innerText = "";
            if (!namesSpan.innerText.includes(data.user)) {
                namesSpan.innerText = namesSpan.innerText ? `${namesSpan.innerText}, ${data.user}` : data.user;
                localStorage.setItem("chat_history", messagesUl.innerHTML);
            }
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

function displayMessage(data) {
    if (!messagesUl) return;
    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");
    const msgId = data.id || "msg_" + Date.now();

    if (data.isAlert || data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; padding: 2px; margin: 2px 0; list-style: none;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        if (data.username === myUser) li.classList.add("my-message");
        li.innerHTML = `
            <span><strong style="color: var(--accent-gold)">${data.username}:</strong> ${data.text}</span>
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px;">
                <span style="font-size: 0.55rem; color: #b59461;">${data.time || getCurrentTime()}</span>
                <button class="info-btn" onclick="window.toggleSeenInfo('${msgId}')">ⓘ</button>
            </div>
            <div id="box-${msgId}" class="seen-box"><strong>Seen by:</strong><span class="names">Loading...</span></div>
        `;
    }
    messagesUl.appendChild(li);
    scrollToBottom();
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

window.toggleSeenInfo = function(msgId) {
    const el = document.getElementById(`box-${msgId}`);
    if (el) el.style.display = (el.style.display === "block") ? "none" : "block";
};

window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        const msgId = "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
        socket.emit("sendMessage", { 
            id: msgId,
            username: localStorage.getItem("username"), 
            text: text, 
            time: getCurrentTime() 
        });
        input.value = "";
        socket.emit("stopTyping");
    }
};

window.clearChat = function() {
    if (confirm("Clear chat history?")) {
        socket?.emit("clearAllChat");
    }
};

window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); window.handleSend(); }
});
        
