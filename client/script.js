const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const messagesUl = document.getElementById("messages");
let typingTimeout;

// --- 1. AUTH LOGIC ---
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
    } catch (err) { alert("Server error. Check if Backend is awake."); }
});

// --- 2. UTILS ---
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function scrollToBottom() { if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight; }

// --- 3. CHAT MAIN LOGIC ---
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
document.getElementById("msg")?.addEventListener("input", () => {
    socket?.emit("typing", { username: localStorage.getItem("username") });
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => socket?.emit("stopTyping"), 2000);
});

if (socket) {
    socket.on("receiveMessage", (data) => {
        displayMessage(data);
        const myUser = localStorage.getItem("username");
        if (data.username !== myUser && data.id) {
            socket.emit("messageSeenUpdate", { msgId: data.id, user: myUser });
        }
    });

    socket.on("displayTyping", (data) => { 
        document.getElementById("typing-indicator").innerText = `${data.username} is typing...`; 
    });

    socket.on("removeTyping", () => { 
        document.getElementById("typing-indicator").innerText = ""; 
    });

    socket.on("userSeenTheMessage", (data) => {
        const { msgId, user } = data;
        const box = document.querySelector(`#box-${msgId} .names`);
        if (box) {
            if (box.innerText === "Loading...") box.innerText = "";
            if (!box.innerText.includes(user)) {
                box.innerText = box.innerText ? `${box.innerText}, ${user}` : user;
                localStorage.setItem("chat_history", messagesUl.innerHTML);
            }
        }
    });

    socket.on("updateUserCount", (count) => {
        const el = document.getElementById("online-count");
        if (el) el.innerText = count;
    });

    socket.on("chatCleared", () => {
        messagesUl.innerHTML = "";
        localStorage.removeItem("chat_history");
    });
}

function displayMessage(data) {
    if (!messagesUl) return;
    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");
    const msgId = data.id || "msg_" + Date.now();

    if (data.isAlert || data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; padding: 2px;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        if (data.username === myUser) li.classList.add("my-message");
        li.innerHTML = `
            <span><strong style="color: var(--accent-gold)">${data.username}:</strong> ${data.text}</span>
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px;">
                <span style="font-size: 0.55rem; color: #b59461;">${data.time}</span>
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
    if (confirm("Clear all chat for everyone?")) {
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
