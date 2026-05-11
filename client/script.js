const BACKEND = "https://chat-backend-gtg5.onrender.com";
const isChatPage = window.location.pathname.includes("chat.html");
const isLoginPage = window.location.pathname.includes("login.html") || window.location.pathname.endsWith("/");
const isRegisterPage = window.location.pathname.includes("register.html");

// ✅ Socket connection sirf chat page par
const socket = isChatPage ? io(BACKEND, { transports: ["websocket"] }) : null;
const myUser = localStorage.getItem("username");

let currentMode = "world";
let activePrivateUser = null;
let typingTimer;

// Redirect logic
if (isChatPage && !myUser) window.location.href = "login.html";

// ================= LOGIN & REGISTER LOGIC (Missing Part) =================
if (isLoginPage || isRegisterPage) {
    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");

        // Login Submit
        if (loginForm) {
            loginForm.querySelector("button").addEventListener("click", async () => {
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();

                const res = await fetch(`${BACKEND}/api/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.success) {
                    localStorage.setItem("username", username);
                    window.location.href = "chat.html";
                } else {
                    alert("Invalid Username or Password");
                }
            });
        }

        // Register Submit
        if (registerForm) {
            registerForm.querySelector("button").addEventListener("click", async () => {
                const username = document.getElementById("username").value.trim();
                const password = document.getElementById("password").value.trim();

                const res = await fetch(`${BACKEND}/api/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.success) {
                    alert("Account Created! Please Login.");
                    window.location.href = "login.html";
                } else {
                    alert("Registration Failed");
                }
            });
        }
    });
}

// ================= CHAT PAGE SOCKET LOGIC =================
if (socket) {
    socket.on("connect", () => {
        if (myUser) socket.emit("userJoined", myUser);
    });

    // 📸 SCREENSHOT ALERT
    window.addEventListener("keyup", (e) => {
        if (e.key === "PrintScreen") {
            socket.emit("sendMessage", {
                username: "SYSTEM",
                text: `📸 ALERT: ${myUser} took a screenshot!`,
                receiver: "world",
                time: new Date().toLocaleTimeString()
            });
        }
    });

    // ⌨️ TYPING
    window.isTyping = () => {
        socket.emit("typing", myUser);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => socket.emit("stopTyping", myUser), 2000);
    };

    socket.on("userTyping", (user) => {
        const info = document.getElementById("typing-info");
        if (info) info.innerText = `${user} is typing...`;
    });
    socket.on("userStopTyping", () => {
        const info = document.getElementById("typing-info");
        if (info) info.innerText = "";
    });

    // 📩 RECEIVE LOGIC
    socket.on("receiveMessage", (data) => {
        if (currentMode === "world" && data.receiver === "world") {
            appendMessage(data);
        } else if (currentMode === "private") {
            if ((data.username === activePrivateUser && data.receiver === myUser) || 
                (data.username === myUser && data.receiver === activePrivateUser)) {
                appendMessage(data);
            } else if (data.receiver === myUser) {
                alert(`📩 New PM from @${data.username}`);
            }
        }
    });

    socket.on("updateUserCount", (count) => {
        const el = document.getElementById("online-count");
        if (el) el.innerText = count;
    });

    socket.on("chatCleared", () => {
        document.getElementById("messages").innerHTML = "";
    });
}

// ================= UI FUNCTIONS =================
window.switchMode = (mode) => {
    currentMode = mode;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + mode).classList.add('active');
    document.getElementById('add-private').style.display = (mode === 'private') ? 'flex' : 'none';
    document.getElementById('view-title').innerText = (mode === 'world') ? 'World Chat' : 'Private Inbox';
    document.getElementById('messages').innerHTML = "";
    activePrivateUser = null;
};

window.startPrivate = () => {
    const user = prompt("Enter @username to chat privately:");
    if (user && user.trim() !== "") {
        activePrivateUser = user.replace("@", "").trim();
        document.getElementById('view-title').innerText = "Chatting with @" + activePrivateUser;
        document.getElementById('messages').innerHTML = "";
    }
};

window.handleSend = () => {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (!text || !socket) return;

    if (currentMode === "private" && !activePrivateUser) {
        alert("Use the + button to select a user!");
        return;
    }

    socket.emit("sendMessage", {
        username: myUser,
        text: text,
        receiver: (currentMode === "world") ? "world" : activePrivateUser,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    input.value = "";
    socket.emit("stopTyping", myUser);
};

function appendMessage(data) {
    const ul = document.getElementById("messages");
    if (!ul) return;
    const li = document.createElement("li");
    li.className = `msg-container ${data.username === myUser ? 'my-msg' : 'other-msg'}`;
    
    li.innerHTML = `
        <div style="font-size: 0.7rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 4px;">${data.username}</div>
        <div>${data.text}</div>
        <div style="font-size: 0.6rem; color: #666; text-align: right; margin-top: 5px;">${data.time}</div>
    `;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
}

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };
window.clearChat = () => { if(confirm("Clear all?")) socket.emit("clearAllChat"); };
            
