const BACKEND = "https://chat-backend-gtg5.onrender.com";
const isChatPage = window.location.pathname.includes("chat.html");
const isLoginPage = window.location.pathname.includes("login.html") || window.location.pathname.endsWith("/");

const myUser = localStorage.getItem("username");

// ================= 1. LOGIN LOGIC (No Refresh Fix) =================
if (isLoginPage) {
    document.addEventListener("DOMContentLoaded", () => {
        const loginBtn = document.querySelector("#loginForm button");
        if (loginBtn) {
            loginBtn.type = "button"; // Form submit hone se rokta hai
            loginBtn.onclick = async () => {
                const u = document.getElementById("username").value.trim();
                const p = document.getElementById("password").value.trim();
                if (!u || !p) return alert("Enter details");

                loginBtn.innerText = "Checking...";
                try {
                    const res = await fetch(`${BACKEND}/api/login`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: u, password: p })
                    });
                    const data = await res.json();
                    if (data.success) {
                        localStorage.setItem("username", u);
                        window.location.href = "chat.html";
                    } else {
                        alert("Invalid Login");
                        loginBtn.innerText = "Login";
                    }
                } catch (e) { alert("Server Error"); loginBtn.innerText = "Login"; }
            };
        }
    });
}

// ================= 2. CHAT LOGIC =================
const socket = isChatPage ? io(BACKEND, { transports: ["websocket"] }) : null;
let currentTab = "world";
let activePartner = null;

if (isChatPage && !myUser) window.location.href = "login.html";

if (socket) {
    socket.on("connect", () => { if (myUser) socket.emit("userJoined", myUser); });

    socket.on("receiveMessage", (data) => {
        saveLocally(data);

        // UI Refresh logic
        if (currentTab === "world" && data.receiver === "world") {
            appendUI(data);
        } else if (currentTab === "private") {
            const partner = data.username === myUser ? data.receiver : data.username;
            if (activePartner === partner) {
                appendUI(data);
            } else {
                renderInbox(); // Naya message aaya, list update karo
            }
        }
    });

    socket.on("updateUserCount", (c) => {
        const countEl = document.getElementById("online-count");
        if (countEl) countEl.innerText = c;
    });
}

// --- STORAGE & INBOX ---
function saveLocally(msg) {
    const key = msg.receiver === "world" ? "store_world" : `store_${msg.username === myUser ? msg.receiver : msg.username}`;
    let history = JSON.parse(localStorage.getItem(key) || "[]");
    history.push(msg);
    localStorage.setItem(key, JSON.stringify(history));

    if (msg.receiver !== "world") {
        let partner = msg.username === myUser ? msg.receiver : msg.username;
        let inboxes = JSON.parse(localStorage.getItem("active_inboxes") || "[]");
        if (!inboxes.includes(partner)) {
            inboxes.push(partner);
            localStorage.setItem("active_inboxes", JSON.stringify(inboxes));
        }
    }
}

window.switchTab = (tab) => {
    currentTab = tab; activePartner = null;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');

    const msgList = document.getElementById("messages");
    const inboxList = document.getElementById("inbox-list");
    const fab = document.getElementById("new-chat-btn");

    if (tab === 'world') {
        msgList.style.display = "flex";
        inboxList.style.display = "none";
        fab.style.display = "none";
        document.getElementById("chat-title").innerText = "World Chat";
        loadFromStore("store_world");
    } else {
        msgList.style.display = "none";
        inboxList.style.display = "block";
        fab.style.display = "flex";
        document.getElementById("chat-title").innerText = "Private Inbox";
        renderInbox();
    }
};

function renderInbox() {
    const listDiv = document.getElementById("inbox-list");
    listDiv.innerHTML = "";
    let inboxes = JSON.parse(localStorage.getItem("active_inboxes") || "[]");
    inboxes.forEach(u => {
        const item = document.createElement("div");
        item.className = "inbox-item";
        item.innerHTML = `<strong>@${u}</strong> <span style="font-size:0.6rem; color:gold;">Message 📩</span>`;
        item.onclick = () => { activePartner = u; openPrivateRoom(u); };
        listDiv.appendChild(item);
    });
}

function openPrivateRoom(u) {
    document.getElementById("messages").style.display = "flex";
    document.getElementById("inbox-list").style.display = "none";
    document.getElementById("chat-title").innerText = "@" + u;
    loadFromStore(`store_${u}`);
}

window.startNewChat = () => {
    const u = prompt("Enter @username:");
    if (u) { activePartner = u.replace("@", "").trim(); openPrivateRoom(activePartner); }
};

function loadFromStore(key) {
    const ul = document.getElementById("messages");
    ul.innerHTML = "";
    let data = JSON.parse(localStorage.getItem(key) || "[]");
    data.forEach(m => appendUI(m));
}

window.handleSend = () => {
    const input = document.getElementById("msg-input");
    const val = input.value.trim();
    if (!val || !socket) return;

    socket.emit("sendMessage", {
        username: myUser,
        text: val,
        receiver: currentTab === "world" ? "world" : activePartner,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    input.value = "";
};

function appendUI(data) {
    const ul = document.getElementById("messages");
    if (!ul) return;
    const li = document.createElement("li");
    li.className = `msg-bubble ${data.username === myUser ? 'my-msg' : 'other-msg'}`;
    li.innerHTML = `<small style="color:var(--accent-gold); font-weight:bold; display:block;">${data.username}</small>
                    <span>${data.text}</span>`;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
}

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };
                                 
