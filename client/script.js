const BACKEND = "https://chat-backend-gtg5.onrender.com";
const isChatPage = window.location.pathname.includes("chat.html");
const socket = isChatPage ? io(BACKEND, { transports: ["websocket"] }) : null;
const myUser = localStorage.getItem("username");

let currentMode = "world";
let activePrivateUser = null;
let typingTimer;

if (isChatPage && !myUser) window.location.href = "login.html";

if (socket) {
    socket.on("connect", () => {
        if (myUser) socket.emit("userJoined", myUser);
    });

    // 📸 OLD FEATURE: SCREENSHOT ALERT
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

    // ⌨️ OLD FEATURE: TYPING
    window.isTyping = () => {
        socket.emit("typing", myUser);
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => socket.emit("stopTyping", myUser), 2000);
    };

    socket.on("userTyping", (user) => {
        document.getElementById("typing-info").innerText = `${user} is typing...`;
    });
    socket.on("userStopTyping", () => {
        document.getElementById("typing-info").innerText = "";
    });

    // 📩 RECEIVE LOGIC
    socket.on("receiveMessage", (data) => {
        if (currentMode === "world" && data.receiver === "world") {
            appendMessage(data);
        } else if (currentMode === "private") {
            // Sirf is active user ke sath chat dikhao
            if ((data.username === activePrivateUser && data.receiver === myUser) || 
                (data.username === myUser && data.receiver === activePrivateUser)) {
                appendMessage(data);
            } else if (data.receiver === myUser) {
                alert(`📩 New Private Message from @${data.username}`);
            }
        }
    });

    socket.on("updateUserCount", (count) => {
        document.getElementById("online-count").innerText = count;
    });

    socket.on("chatCleared", () => {
        document.getElementById("messages").innerHTML = "";
    });
}

// --- TAB SWITCHING ---
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
        alert("Please use the + button to start a private chat first!");
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
                                
