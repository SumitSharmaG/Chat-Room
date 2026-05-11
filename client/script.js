const BACKEND = "https://chat-backend-gtg5.onrender.com";
const socket = window.location.pathname.includes("chat.html") ? io(BACKEND, { transports: ["websocket"] }) : null;
const myUser = localStorage.getItem("username");

let view = "world"; // 'world' or 'private'
let activeChat = null; // Username we are currently chatting with

if (!myUser && window.location.pathname.includes("chat.html")) window.location.href = "login.html";

if (socket) {
    socket.on("connect", () => {
        if (myUser) socket.emit("userJoined", myUser);
    });

    socket.on("receiveMessage", (data) => {
        handleIncomingMessage(data);
    });

    socket.on("updateUserCount", (count) => {
        document.getElementById("online-count").innerText = count;
    });
}

// --- CORE LOGIC ---
function handleIncomingMessage(msg) {
    // 1. Storage Logic
    const chatKey = msg.receiver === "world" ? "history_world" : `history_${msg.username === myUser ? msg.receiver : msg.username}`;
    let history = JSON.parse(localStorage.getItem(chatKey) || "[]");
    history.push(msg);
    localStorage.setItem(chatKey, JSON.stringify(history));

    // 2. Inbox Tracking (For Private)
    if (msg.receiver !== "world") {
        let partner = msg.username === myUser ? msg.receiver : msg.username;
        let inboxes = JSON.parse(localStorage.getItem("my_inboxes") || "[]");
        if (!inboxes.includes(partner)) {
            inboxes.push(partner);
            localStorage.setItem("my_inboxes", JSON.stringify(inboxes));
        }
    }

    // 3. UI Update Logic
    if (view === "world" && msg.receiver === "world") {
        appendUI(msg);
    } else if (view === "private") {
        if (activeChat === (msg.username === myUser ? msg.receiver : msg.username)) {
            appendUI(msg);
        } else {
            renderInboxList(); // Update the list to show new message alert
        }
    }
}

window.switchView = (v) => {
    view = v;
    activeChat = null;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${v}`).classList.add('active');

    const msgList = document.getElementById("messages");
    const inboxView = document.getElementById("inbox-view");
    const fab = document.getElementById("fab-new");

    if (v === 'world') {
        msgList.style.display = "flex";
        inboxView.style.display = "none";
        fab.style.display = "none";
        document.getElementById("current-title").innerText = "World Chat";
        loadLocalHistory("history_world");
    } else {
        msgList.style.display = "none";
        inboxView.style.display = "block";
        fab.style.display = "flex";
        document.getElementById("current-title").innerText = "Inbox";
        renderInboxList();
    }
};

function renderInboxList() {
    const container = document.getElementById("inbox-view");
    container.innerHTML = "";
    let inboxes = JSON.parse(localStorage.getItem("my_inboxes") || "[]");

    if (inboxes.length === 0) {
        container.innerHTML = "<p style='text-align:center; margin-top:20px; color:#555;'>No private chats yet.</p>";
        return;
    }

    inboxes.forEach(user => {
        const item = document.createElement("div");
        item.className = "inbox-card";
        item.innerHTML = `<div><strong>@${user}</strong></div><div class="new-badge">Active</div>`;
        item.onclick = () => openChat(user);
        container.appendChild(item);
    });
}

function openChat(user) {
    activeChat = user;
    document.getElementById("messages").style.display = "flex";
    document.getElementById("inbox-view").style.display = "none";
    document.getElementById("current-title").innerText = "@" + user;
    loadLocalHistory(`history_${user}`);
}

window.createNewChat = () => {
    const user = prompt("Enter @username to start chat:");
    if (user) openChat(user.replace("@","").trim());
};

function loadLocalHistory(key) {
    const ul = document.getElementById("messages");
    ul.innerHTML = "";
    let history = JSON.parse(localStorage.getItem(key) || "[]");
    history.forEach(m => appendUI(m));
    ul.scrollTop = ul.scrollHeight;
}

window.sendMessage = () => {
    const input = document.getElementById("msg-input");
    const text = input.value.trim();
    if (!text || !socket) return;

    if (view === "private" && !activeChat) return alert("Select a user from Inbox!");

    const payload = {
        username: myUser,
        text: text,
        receiver: (view === "world") ? "world" : activeChat,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    };

    socket.emit("sendMessage", payload);
    input.value = "";
};

function appendUI(data) {
    const ul = document.getElementById("messages");
    const li = document.createElement("li");
    li.className = `msg-bubble ${data.username === myUser ? 'my-msg' : 'other-msg'}`;
    li.innerHTML = `<div style="font-size:0.6rem; color:var(--accent-gold); font-weight:bold;">${data.username}</div>
                    <div>${data.text}</div>
                    <div style="font-size:0.5rem; text-align:right; color:#888;">${data.time}</div>`;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
}

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };
                                 
