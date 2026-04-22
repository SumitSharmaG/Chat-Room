const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const myUsername = localStorage.getItem("username");

// --- 1. LOGIN/REGISTER REDIRECT FIX ---
(function handleRouting() {
    const path = window.location.pathname;
    const isChatPage = path.includes("chat.html");
    const isAuthPage = path.includes("login.html") || path.includes("register.html");

    if (isChatPage && !myUsername) {
        window.location.href = "login.html";
    } else if (isAuthPage && myUsername) {
        window.location.href = "chat.html";
    }
})();

// --- 2. AUTHENTICATION LOGIC ---
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
        } else { alert("Registration failed. Try another username."); }
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
        } else { alert("Login failed. Check credentials."); }
    } catch (err) { alert("Server error."); }
});

// --- 3. CHAT INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("chat.html") && myUsername) {
        document.getElementById("display-username").innerText = "@" + myUsername;
        const savedChat = localStorage.getItem("chat_history");
        if (savedChat) {
            const msgUl = document.getElementById("messages");
            msgUl.innerHTML = savedChat;
            msgUl.scrollTop = msgUl.scrollHeight;
        }
    }
});

// --- 4. GESTURE & SOCKETS ---
let gestureTimer;
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => {
            if (socket) socket.emit("sendMessage", { username: "SYSTEM", text: `📸 ${myUsername} captured screen`, time: getCurrentTime() });
        }, 1000);
    }
}, { passive: true });
document.addEventListener('touchend', () => { if (gestureTimer) clearTimeout(gestureTimer); });

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
    socket.on("displayTyping", (data) => {
        const typingBox = document.getElementById("typing-box");
        if (typingBox && data.username !== myUsername) {
            typingBox.innerText = `${data.username} typing...`;
            typingBox.style.visibility = "visible";
            setTimeout(() => { typingBox.style.visibility = "hidden"; }, 3000);
        }
    });
}

function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    return `${h % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;
    const li = document.createElement("li");
    if (data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; text-align: center;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        const isMe = data.username === myUsername;
        li.className = isMe ? "msg-sent" : "msg-received";
        li.innerHTML = `
            <span class="msg-user">${data.username}</span>
            <span style="user-select: text;">${data.text}</span>
            <span class="msg-time">${data.time} ${isMe ? '✓✓' : ''}</span>
        `;
    }
    messagesUl.appendChild(li);
    messagesUl.scrollTop = messagesUl.scrollHeight;
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        socket.emit("sendMessage", { username: myUsername, text, time: getCurrentTime() });
        input.value = "";
    }
};

document.getElementById("msg")?.addEventListener("input", () => { if (socket) socket.emit("typing", { username: myUsername }); });
document.getElementById("msg")?.addEventListener("keypress", (e) => { if (e.key === "Enter") window.handleSend(); });
window.clearChat = function() { if (confirm("Clear chat?")) socket?.emit("clearAllChat"); };
window.logout = function() { localStorage.removeItem("username"); window.location.href = "login.html"; };
    
