const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const myUsername = localStorage.getItem("username");

// --- 1. INITIAL LOAD & ROUTING ---
document.addEventListener("DOMContentLoaded", () => {
    const isChatPage = window.location.pathname.includes("chat.html");

    if (isChatPage) {
        if (!myUsername) {
            window.location.href = "login.html";
            return;
        }
        document.getElementById("display-username").innerText = "@" + myUsername;
        
        // Restore Chat History
        const savedChat = localStorage.getItem("chat_history");
        if (savedChat) {
            document.getElementById("messages").innerHTML = savedChat;
            const messagesUl = document.getElementById("messages");
            messagesUl.scrollTop = messagesUl.scrollHeight;
        }
    } else if (myUsername && (window.location.pathname.includes("login.html") || window.location.pathname.includes("register.html"))) {
        window.location.href = "chat.html";
    }
});

// --- 2. GESTURE & SCREENSHOT ALERT ---
let gestureTimer;
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => {
            if (socket) {
                socket.emit("sendMessage", { 
                    username: "SYSTEM", 
                    text: `📸 ${myUsername} captured screen`, 
                    time: getCurrentTime() 
                });
            }
        }, 1000);
    }
}, { passive: true });

document.addEventListener('touchend', () => { if (gestureTimer) clearTimeout(gestureTimer); });

// --- 3. SOCKET EVENTS ---
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
    let m = now.getMinutes().toString().padStart(2, '0');
    return `${h % 12 || 12}:${m} ${h >= 12 ? 'PM' : 'AM'}`;
}

// --- 4. DISPLAY MESSAGE ---
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
    
    // Save to LocalStorage after every message
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// --- 5. ACTIONS ---
window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        socket.emit("sendMessage", { username: myUsername, text, time: getCurrentTime() });
        input.value = "";
    }
};

document.getElementById("msg")?.addEventListener("input", () => {
    if (socket) socket.emit("typing", { username: myUsername });
});

document.getElementById("msg")?.addEventListener("keypress", (e) => { if (e.key === "Enter") window.handleSend(); });

window.clearChat = function() { if (confirm("Clear chat?")) socket?.emit("clearAllChat"); };

window.logout = function() { localStorage.removeItem("username"); window.location.href = "login.html"; };
                              
