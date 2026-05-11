const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = io(BACKEND, { transports: ["websocket"] });
const myUser = localStorage.getItem("username");
let currentMode = "world"; // 'world' or 'private'
let activePrivateUser = null;
let seenMap = {};

if (!myUser) window.location.href = "login.html";

socket.on("connect", () => {
    socket.emit("userJoined", myUser);
});

// --- UI Logic ---
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-' + mode).classList.add('active');
    
    const plusBtn = document.getElementById('new-chat-plus');
    if (mode === 'private') {
        plusBtn.style.display = 'flex';
        document.getElementById('chat-title').innerText = activePrivateUser ? "Chat: @" + activePrivateUser : "Private Inbox";
    } else {
        plusBtn.style.display = 'none';
        document.getElementById('chat-title').innerText = "World Chat";
    }
    document.getElementById("messages").innerHTML = ""; // Switch pe clear
}

function startNewPrivate() {
    const user = prompt("Enter @username to message:");
    if (user) {
        activePrivateUser = user.replace("@", "").trim();
        document.getElementById('chat-title').innerText = "Chat: @" + activePrivateUser;
        document.getElementById("messages").innerHTML = "";
    }
}

// --- Send Logic ---
window.handleSend = function () {
    const input = document.getElementById("msg");
    const text = input.value.trim();
    if (!text) return;

    const receiver = (currentMode === "world") ? "world" : activePrivateUser;
    
    if (currentMode === "private" && !activePrivateUser) {
        alert("Click + to start a private chat first!");
        return;
    }

    socket.emit("sendMessage", {
        username: myUser,
        text,
        receiver: receiver,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    input.value = "";
};

// --- Receive Logic ---
socket.on("receiveMessage", (data) => {
    if (currentMode === "world" && data.receiver === "world") {
        appendMessage(data);
    } else if (currentMode === "private") {
        if ((data.username === activePrivateUser && data.receiver === myUser) || 
            (data.username === myUser && data.receiver === activePrivateUser)) {
            appendMessage(data);
        } else if (data.receiver === myUser) {
            alert("New Private Message from @" + data.username);
        }
    }
});

function appendMessage(data) {
    const ul = document.getElementById("messages");
    const li = document.createElement("li");
    li.className = (data.username === myUser) ? "my-message" : "other-message";
    
    li.innerHTML = `
        <div style="font-size:0.7rem; color:gray;">${data.username}</div>
        <div>${data.text}</div>
        <div style="font-size:0.5rem; text-align:right;">${data.time}</div>
    `;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
}

// Typing logic, Online Count, Logout... (Aapka purana code yahan add kar sakte hain)
socket.on("updateUserCount", (count) => {
    document.getElementById("online-count").innerText = count;
});

window.logout = function() {
    localStorage.clear();
    window.location.href = "login.html";
};
            
