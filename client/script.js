const BACKEND = "https://chat-backend-gtg5.onrender.com";
const isChatPage = window.location.pathname.includes("chat.html");
const isLoginPage = window.location.pathname.includes("login.html") || window.location.pathname.endsWith("/");
const isRegisterPage = window.location.pathname.includes("register.html");

const myUser = localStorage.getItem("username");

// ================= 1. LOGIN & REGISTER FIX (Refresh Roka Gaya Hai) =================
if (isLoginPage || isRegisterPage) {
    document.addEventListener("DOMContentLoaded", () => {
        const loginForm = document.getElementById("loginForm");
        const registerForm = document.getElementById("registerForm");

        if (loginForm) {
            // Hum form submit event ko hi pakad lete hain taki refresh na ho
            loginForm.addEventListener("submit", (e) => e.preventDefault()); 
            
            const loginBtn = loginForm.querySelector("button");
            loginBtn.onclick = async (e) => {
                e.preventDefault(); // Double protection
                e.stopPropagation();

                const u = document.getElementById("username").value.trim();
                const p = document.getElementById("password").value.trim();

                if(!u || !p) return alert("Please enter details");

                loginBtn.innerText = "Authenticating...";
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
                        alert("Galt Username ya Password!");
                        loginBtn.innerText = "Login";
                    }
                } catch (err) {
                    alert("Server Error! Baad mein koshish karein.");
                    loginBtn.innerText = "Login";
                }
            };
        }

        if (registerForm) {
            registerForm.addEventListener("submit", (e) => e.preventDefault());
            const regBtn = registerForm.querySelector("button");
            regBtn.onclick = async (e) => {
                e.preventDefault();
                const u = document.getElementById("username").value.trim();
                const p = document.getElementById("password").value.trim();

                try {
                    const res = await fetch(`${BACKEND}/api/register`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ username: u, password: p })
                    });
                    const data = await res.json();
                    if (data.success) {
                        alert("Account ban gaya! Ab login karein.");
                        window.location.href = "login.html";
                    } else {
                        alert("Username pehle se maujood hai.");
                    }
                } catch (err) { alert("Error!"); }
            };
        }
    });
}

// ================= 2. CHAT LOGIC (Socket & Storage) =================
const socket = isChatPage ? io(BACKEND, { transports: ["websocket"] }) : null;
let view = "world"; 
let activeChat = null;

if (isChatPage && !myUser) window.location.href = "login.html";

if (socket) {
    socket.on("connect", () => {
        if (myUser) socket.emit("userJoined", myUser);
    });

    socket.on("receiveMessage", (data) => {
        // Message Save Karein
        const key = data.receiver === "world" ? "h_world" : `h_${data.username === myUser ? data.receiver : data.username}`;
        let history = JSON.parse(localStorage.getItem(key) || "[]");
        history.push(data);
        localStorage.setItem(key, JSON.stringify(history));

        // Inbox List Update
        if (data.receiver !== "world") {
            let partner = data.username === myUser ? data.receiver : data.username;
            let list = JSON.parse(localStorage.getItem("my_inboxes") || "[]");
            if (!list.includes(partner)) {
                list.push(partner);
                localStorage.setItem("my_inboxes", JSON.stringify(list));
            }
        }

        // UI Update
        if (view === "world" && data.receiver === "world") {
            appendUI(data);
        } else if (view === "private") {
            const partner = data.username === myUser ? data.receiver : data.username;
            if (activeChat === partner) {
                appendUI(data);
            } else {
                renderInbox(); 
            }
        }
    });

    socket.on("updateUserCount", (c) => {
        if(document.getElementById("online-count")) document.getElementById("online-count").innerText = c;
    });
}

// ================= 3. UI FUNCTIONS =================
window.switchView = (v) => {
    view = v; activeChat = null;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(`tab-${v}`).classList.add('active');

    if (v === 'world') {
        document.getElementById("messages").style.display = "flex";
        document.getElementById("inbox-view").style.display = "none";
        document.getElementById("fab-new").style.display = "none";
        loadHistory("h_world");
    } else {
        document.getElementById("messages").style.display = "none";
        document.getElementById("inbox-view").style.display = "block";
        document.getElementById("fab-new").style.display = "flex";
        renderInbox();
    }
};

function renderInbox() {
    const box = document.getElementById("inbox-view");
    box.innerHTML = "";
    let list = JSON.parse(localStorage.getItem("my_inboxes") || "[]");
    list.forEach(u => {
        const d = document.createElement("div");
        d.className = "inbox-card";
        d.innerHTML = `<strong>@${u}</strong> <span class="new-badge">Message</span>`;
        d.onclick = () => { activeChat = u; openRoom(u); };
        box.appendChild(d);
    });
}

function openRoom(u) {
    document.getElementById("messages").style.display = "flex";
    document.getElementById("inbox-view").style.display = "none";
    loadHistory(`h_${u}`);
}

window.createNewChat = () => {
    const u = prompt("Kisko message bhejna hai? (@username)");
    if(u) { activeChat = u.replace("@","").trim(); openRoom(activeChat); }
};

function loadHistory(key) {
    const ul = document.getElementById("messages");
    ul.innerHTML = "";
    let h = JSON.parse(localStorage.getItem(key) || "[]");
    h.forEach(m => appendUI(m));
}

window.sendMessage = () => {
    const input = document.getElementById("msg-input");
    if (!input.value.trim() || !socket) return;

    socket.emit("sendMessage", {
        username: myUser,
        text: input.value.trim(),
        receiver: (view === "world") ? "world" : activeChat,
        time: new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
    });
    input.value = "";
};

function appendUI(d) {
    const ul = document.getElementById("messages");
    if(!ul) return;
    const li = document.createElement("li");
    li.className = `msg-bubble ${d.username === myUser ? 'my-msg' : 'other-msg'}`;
    li.innerHTML = `<small style="color:gold;">${d.username}</small><div>${d.text}</div>`;
    ul.appendChild(li);
    ul.scrollTop = ul.scrollHeight;
}

window.logout = () => { localStorage.clear(); window.location.href = "login.html"; };
