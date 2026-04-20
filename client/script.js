const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

// --- 1. CORE UTILS ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

// --- 2. ADVANCED SCREENSHOT & GESTURE DETECTION (1.5s Timer) ---
let gestureTimer = null;
let lastAlertTime = 0;

function sendScreenshotAlert(reason = "took a screenshot") {
    const now = Date.now();
    if (now - lastAlertTime < 2000) return; // Prevent spam
    lastAlertTime = now;

    const username = localStorage.getItem("username") || "Someone";
    if (socket) {
        socket.emit("sendMessage", { 
            username: "SYSTEM ALERT", 
            text: `📸 ${username} ${reason}!`, 
            isAlert: true, 
            time: getCurrentTime() 
        });
    }
}

// Mobile Three-Finger Swipe with 1.5s Gesture Duration Logic
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 3) {
        // Agar 3 ungliyan touch hui, timer shuru karo (1.5 seconds)
        gestureTimer = setTimeout(() => {
            sendScreenshotAlert("performed a 1.5s screenshot gesture");
        }, 1500);
    }
}, { passive: false });

document.addEventListener('touchend', () => {
    // Agar user ne 1.5s se pehle ungli hata li, timer cancel kar do
    if (gestureTimer) {
        clearTimeout(gestureTimer);
        gestureTimer = null;
    }
});

document.addEventListener('touchcancel', () => {
    if (gestureTimer) {
        clearTimeout(gestureTimer);
        gestureTimer = null;
    }
});

// PC & Focus Detection
window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') sendScreenshotAlert("pressed PrintScreen");
});
window.addEventListener('blur', () => sendScreenshotAlert("lost focus (possible screenshot)"));

// --- 3. CHAT LOGIC ---
document.addEventListener("DOMContentLoaded", () => {
    const savedChat = localStorage.getItem("chat_history");
    const messagesUl = document.getElementById("messages");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        messagesUl.scrollTo(0, messagesUl.scrollHeight);
    }
});

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
}

function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;

    const li = document.createElement("li");
    if (data.isAlert || data.username === "SYSTEM ALERT") {
        li.className = "alert-msg";
        li.innerHTML = `<span>${data.text} - ${data.time}</span>`;
    } else {
        li.innerHTML = `
            <span><strong>${data.username}:</strong> ${data.text}</span>
            <span style="font-size: 0.6rem; color: #b59461; align-self: flex-end; margin-top: 4px;">${data.time || getCurrentTime()}</span>
        `;
    }
    messagesUl.appendChild(li);
    messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
    localStorage.setItem("chat_history", messagesUl.innerHTML);
}

// --- 4. GLOBAL ACTIONS ---
window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        socket.emit("sendMessage", { 
            username: localStorage.getItem("username"), 
            text, time: getCurrentTime() 
        });
        input.value = "";
        input.focus();
    }
};

window.clearChat = function() {
    if (confirm("Clear chat for everyone?")) {
        socket?.emit("clearAllChat");
        document.getElementById("messages").innerHTML = "";
        localStorage.removeItem("chat_history");
    }
};

window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.handleSend();
});
              
