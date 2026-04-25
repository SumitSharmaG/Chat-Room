const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

if (socket) {
    socket.on("connect", () => {
        const username = localStorage.getItem("username");

        if (username) {
            socket.emit("userJoined", username);
        }
    });
}


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
        if (res.ok) { alert("Registered successfully!"); window.location.href = "login.html"; }
        else { alert("Registration failed."); }
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
        } else { alert("Login failed."); }
    } catch (err) { alert("Server error."); }
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

// --- 3. SCREENSHOT & GESTURE DETECTION ---
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
}, { passive: false });

document.addEventListener('touchend', () => {
    if (gestureTimer) { clearTimeout(gestureTimer); gestureTimer = null; }
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') sendScreenshotAlert("captured screen");
});

// --- 4. CHAT LOGIC ---
const messagesUl = document.getElementById("messages");

function scrollToBottom() {
    if (messagesUl) {
        messagesUl.scrollTop = messagesUl.scrollHeight;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Header mein username dikhana
    const myUser = localStorage.getItem("username");
    const userDisplayEl = document.getElementById("display-username");
    if (userDisplayEl && myUser) {
        userDisplayEl.innerText = `@${myUser}`;
    }

    const savedChat = localStorage.getItem("chat_history");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        scrollToBottom();
    }
});

// Keyboard open hone par auto-scroll
window.addEventListener('resize', () => {
    if (document.activeElement.tagName === 'INPUT') {
        setTimeout(scrollToBottom, 100);
    }
});

if (socket) {
    socket.on("receiveMessage", (data) => displayMessage(data));
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

    if (data.isAlert || data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; padding: 2px; margin: 2px 0; list-style: none;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        if (data.username === myUser) {
            li.classList.add("my-message");
        }
        
        li.innerHTML = `
            <span><strong style="color: var(--accent-gold)">${data.username}:</strong> ${data.text}</span>
            <span style="font-size: 0.6rem; color: #b59461; align-self: flex-end; margin-top: 4px;">${data.time || getCurrentTime()}</span>
        `;
    }
    
    messagesUl.appendChild(li);
    scrollToBottom();
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// --- GLOBAL ACTIONS ---
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
    if (confirm("Clear chat history?")) {
        socket?.emit("clearAllChat");
        // Local cleanup
        if (messagesUl) messagesUl.innerHTML = "";
        localStorage.removeItem("chat_history");
    }
};

window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        window.handleSend();
    }
});
                   
