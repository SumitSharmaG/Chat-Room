const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

// --- UTILITY: Get Current Time in 12hr AM/PM Format ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

// --- SCREENSHOT DETECTION ---
function sendScreenshotAlert() {
    const username = localStorage.getItem("username") || "Someone";
    const time = getCurrentTime();
    if (socket) {
        socket.emit("sendMessage", { 
            username: "SYSTEM ALERT", 
            text: `📸 ${username} took a screenshot!`, 
            isAlert: true, 
            time: time 
        });
    }
}

// Detect PrintScreen Key
window.addEventListener('keyup', (e) => {
    if (e.key === 'PrintScreen' || e.key === 'PrtSc') {
        sendScreenshotAlert();
    }
});

// Detect Common Screenshot Shortcuts (Win+Shift+S, etc.)
window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'S' || e.key === 's')) {
        sendScreenshotAlert();
    }
});

// --- CHAT LOGIC ---

if (socket) {
    // MongoDB se purani chat load karna
    socket.on("loadHistory", (history) => {
        const messagesUl = document.getElementById("messages");
        messagesUl.innerHTML = "";
        history.forEach(data => displayMessage(data));
    });

    // Naya message receive karna
    socket.on("receiveMessage", (data) => {
        displayMessage(data);
    });

    // Online User Count
    socket.on("updateUserCount", (count) => {
        const countEl = document.getElementById("online-count");
        if (countEl) countEl.innerText = count;
    });

    // Chat Clear Event
    socket.on("chatCleared", () => {
        document.getElementById("messages").innerHTML = "";
    });
}

function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;

    const li = document.createElement("li");
    
    // Check if it's a System Alert (Screenshot)
    if (data.isAlert || data.username === "SYSTEM ALERT") {
        li.className = "alert-msg";
        li.innerHTML = `<span>${data.text} - ${data.time}</span>`;
    } else {
        li.innerHTML = `
            <span><strong>${data.username}:</strong> ${data.text}</span>
            <span class="msg-time">${data.time || getCurrentTime()}</span>
        `;
    }
    
    messagesUl.appendChild(li);
    messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
}

function handleSend() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    const username = localStorage.getItem("username");

    if (text !== "" && socket) {
        socket.emit("sendMessage", { username, text, time: getCurrentTime() });
        input.value = "";
        input.focus();
    }
}

// Enter Key Support
document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSend();
});

// --- CLEAR & LOGOUT ---
function clearChat() {
    if (confirm("Kya aap sabhi ke liye chat history delete karna chahte hain?")) {
        socket.emit("clearAllChat"); // Backend par ye event handle hona chahiye
    }
}

function logout() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
}

// Mobile keyboard focus fix
document.getElementById("msg")?.addEventListener("focus", () => {
    setTimeout(() => {
        const messagesUl = document.getElementById('messages');
        if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight;
    }, 300);
});
      
