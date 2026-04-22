const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const myUsername = localStorage.getItem("username");

// --- 1. LOGIN REDIRECT & DISPLAY USERNAME ---
document.addEventListener("DOMContentLoaded", () => {
    if (!myUsername) {
        window.location.href = "login.html";
        return;
    }
    const userEl = document.getElementById("display-username");
    if (userEl) userEl.innerText = "@" + myUsername;

    // Load history
    const savedChat = localStorage.getItem("chat_history");
    const messagesUl = document.getElementById("messages");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }
});

// --- 2. UTILS ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

// --- 3. SOCKET LOGIC ---
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

    // Typing Status Listeners
    socket.on("displayTyping", (data) => {
        const typingBox = document.getElementById("typing-box");
        if (typingBox && data.username !== myUsername) {
            typingBox.innerText = `${data.username} typing...`;
            typingBox.style.visibility = "visible";
            setTimeout(() => { typingBox.style.visibility = "hidden"; }, 3000);
        }
    });
}

// --- 4. DISPLAY MESSAGE (RIGHT/LEFT LOGIC) ---
function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;

    const li = document.createElement("li");
    
    if (data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; padding: 2px; margin: 2px 0; list-style: none;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        // Decide Alignment
        const isMe = data.username === myUsername;
        li.classList.add(isMe ? "msg-sent" : "msg-received");
        
        li.innerHTML = `
            ${!isMe ? `<span class="msg-user">${data.username}</span>` : ""}
            <span class="msg-text" style="user-select: text;">${data.text}</span>
            <span class="msg-time">
                ${data.time || getCurrentTime()} 
                ${isMe ? `<span style="color:var(--accent-gold)">✓✓</span>` : ""}
            </span>
        `;
    }
    
    messagesUl.appendChild(li);
    messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// --- 5. SEND & TYPING EVENTS ---
window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        socket.emit("sendMessage", { 
            username: myUsername, 
            text, 
            time: getCurrentTime() 
        });
        input.value = "";
        input.focus();
    }
};

// Typing Event
document.getElementById("msg")?.addEventListener("input", () => {
    if (socket) {
        socket.emit("typing", { username: myUsername });
    }
});

document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.handleSend();
});

// --- 6. AUTH & SCREENSHOT ALERT ---
window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

window.clearChat = function() {
    if (confirm("Clear chat history?")) {
        socket?.emit("clearAllChat");
    }
};

// Anti-Screenshot (Simplified Alert)
window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') {
        socket.emit("sendMessage", { 
            username: "SYSTEM", 
            text: `📸 ${myUsername} captured screen`, 
            time: getCurrentTime() 
        });
    }
});
