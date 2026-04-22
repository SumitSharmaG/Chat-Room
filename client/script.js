const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = typeof io !== "undefined" ? io(BACKEND) : null;
const myUsername = localStorage.getItem("username");

// --- 1. PAGE ROUTING & INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    const currentPage = window.location.pathname;

    // Agar chat page par ho aur username nahi hai, toh login par bhejo
    if (currentPage.includes("chat.html")) {
        if (!myUsername) {
            window.location.href = "login.html";
            return;
        }
        
        // Display Username in Header
        const userEl = document.getElementById("display-username");
        if (userEl) userEl.innerText = "@" + myUsername;

        // Load Chat History
        const savedChat = localStorage.getItem("chat_history");
        const messagesUl = document.getElementById("messages");
        if (savedChat && messagesUl) {
            messagesUl.innerHTML = savedChat;
            messagesUl.scrollTop = messagesUl.scrollHeight;
        }
    } 
    // Agar login/register page par ho aur user pehle se login hai, toh chat par bhejo
    else if (currentPage.includes("login.html") || currentPage.includes("register.html")) {
        if (myUsername) {
            window.location.href = "chat.html";
        }
    }
});

// --- 2. LOGIN & REGISTER HANDLERS ---
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
        } else { alert("Registration failed."); }
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

// --- 3. UTILS & SOCKET LOGIC ---
function getCurrentTime() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
}

if (socket) {
    socket.on("receiveMessage", (data) => displayMessage(data));
    
    socket.on("updateUserCount", (count) => {
        const el = document.getElementById("online-count");
        if (el) el.innerText = count;
    });

    socket.on("chatCleared", () => {
        const msgUl = document.getElementById("messages");
        if (msgUl) msgUl.innerHTML = "";
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

// --- 4. DISPLAY MESSAGE ---
function displayMessage(data) {
    const messagesUl = document.getElementById("messages");
    if (!messagesUl) return;

    const li = document.createElement("li");
    if (data.username === "SYSTEM") {
        li.style.cssText = "align-self: center; background: transparent; border: none; color: #ffff00; font-size: 0.6rem; padding: 2px; margin: 2px 0; list-style: none;";
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        const isMe = data.username === myUsername;
        li.classList.add(isMe ? "msg-sent" : "msg-received");
        li.innerHTML = `
            ${!isMe ? `<span class="msg-user">${data.username}</span>` : ""}
            <span class="msg-text">${data.text}</span>
            <span class="msg-time">${data.time || getCurrentTime()} ${isMe ? `✓✓` : ""}</span>
        `;
    }
    messagesUl.appendChild(li);
    messagesUl.scrollTo({ top: messagesUl.scrollHeight, behavior: 'smooth' });
    if (currentPage.includes("chat.html")) {
        localStorage.setItem("chat_history", messagesUl.innerHTML);
    }
}

// --- 5. CHAT ACTIONS ---
window.handleSend = function() {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (text !== "" && socket) {
        socket.emit("sendMessage", { username: myUsername, text, time: getCurrentTime() });
        input.value = "";
        input.focus();
    }
};

document.getElementById("msg")?.addEventListener("input", () => {
    if (socket) socket.emit("typing", { username: myUsername });
});

document.getElementById("msg")?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") window.handleSend();
});

window.logout = function() {
    localStorage.removeItem("username");
    window.location.href = "login.html";
};

window.clearChat = function() {
    if (confirm("Clear chat history?")) socket?.emit("clearAllChat");
};
                                                       
