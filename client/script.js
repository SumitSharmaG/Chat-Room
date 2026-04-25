const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const messagesUl = document.getElementById("messages");

// --- 1. LOGIN & REGISTER (Waisa hi rahega) ---
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    try {
        const res = await fetch(BACKEND + "/api/login", { 
            method: "POST", headers: { "Content-Type": "application/json" }, 
            body: JSON.stringify({ username, password }) 
        });
        const data = await res.json();
        if (data.success) { localStorage.setItem("username", username); window.location.href = "chat.html"; }
        else { alert("Login failed."); }
    } catch (err) { alert("Server Error. Check Backend."); }
});

// --- 2. UTILS ---
function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
function scrollToBottom() { if (messagesUl) { messagesUl.scrollTop = messagesUl.scrollHeight; } }

// --- 3. CORE MESSAGE DISPLAY (ISSUE YAHAN HO SAKTA HAI) ---
function displayMessage(data) {
    if (!messagesUl) return;
    
    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");
    const msgId = data.id || "msg_" + Date.now();

    // System Alerts Logic
    if (data.isAlert || data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; padding: 2px; list-style: none;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } 
    // Normal Messages Logic
    else {
        if (data.username === myUser) {
            li.classList.add("my-message");
        }
        
        li.innerHTML = `
            <span><strong style="color: #b59461">${data.username}:</strong> ${data.text}</span>
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px; margin-top: 4px;">
                <span style="font-size: 0.55rem; color: #b59461;">${data.time || getCurrentTime()}</span>
                <button class="info-btn" style="background:none; border:none; color:#b59461; cursor:pointer;" onclick="window.toggleSeenInfo('${msgId}')">ⓘ</button>
            </div>
            <div id="box-${msgId}" class="seen-box" style="display:none; font-size:0.55rem; color:#888; background:rgba(0,0,0,0.2); padding:4px; border-radius:4px; margin-top:4px;">
                <strong>Seen by:</strong> <span class="names">Loading...</span>
            </div>
        `;
    }
    
    messagesUl.appendChild(li);
    scrollToBottom();
    // Save locally
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// --- 4. SOCKET CONNECTIONS ---
if (socket) {
    socket.on("connect", () => { console.log("Connected to Backend!"); });

    socket.on("receiveMessage", (data) => {
        console.log("Message received:", data); // Check console for this!
        displayMessage(data);
        
        // Seen Logic
        const myUser = localStorage.getItem("username");
        if (data.username !== myUser && data.id && data.username !== "SYSTEM") {
            socket.emit("messageSeenUpdate", { msgId: data.id, user: myUser });
        }
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

    socket.on("displayTyping", (data) => {
        const el = document.getElementById("typing-indicator");
        if (el) el.innerText = `${data.username} is typing...`;
    });

    socket.on("removeTyping", () => {
        const el = document.getElementById("typing-indicator");
        if (el) el.innerText = "";
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

// --- 5. GLOBAL ACTIONS ---
window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    const myUser = localStorage.getItem("username");

    if (text !== "" && socket) {
        const msgData = { 
            id: "msg_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            username: myUser, 
            text: text, 
            time: getCurrentTime() 
        };
        socket.emit("sendMessage", msgData);
        input.value = "";
    }
};

window.toggleSeenInfo = function(msgId) {
    const el = document.getElementById(`box-${msgId}`);
    if (el) el.style.display = (el.style.display === "block") ? "none" : "block";
};

window.clearChat = function() { if (confirm("Clear all?")) socket?.emit("clearAllChat"); };
window.logout = function() { localStorage.removeItem("username"); window.location.href = "login.html"; };

document.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("chat_history");
    if (saved && messagesUl) { messagesUl.innerHTML = saved; scrollToBottom(); }
});
        
