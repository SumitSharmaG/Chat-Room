const BACKEND = "https://chat-backend-gtg5.onrender.com";

// ✅ Connect socket on BOTH chat pages
const isChatPage =
    window.location.pathname.includes("world-chat.html")
    ||
    window.location.pathname.includes("private-chat.html");


// ✅ Create socket
const socket = isChatPage
    ? io(BACKEND, {
        transports: ["websocket"],
        auth: {
            token: localStorage.getItem("token")
        }
    })
    : null;


// 🔥 CONNECT
if (socket) {

    socket.on("connect", () => {

        console.log(
            "✅ Socket Connected:",
            socket.id
        );

        const username =
            localStorage.getItem("username");

        if (username) {

            socket.emit(
                "userJoined",
                username
            );
        }
    });

    socket.on("connect_error", (err) => {

        console.log(
            "❌ JWT Error:",
            err.message
        );

    });

}

// ================== SCREENSHOT LOGIC ==================
let gestureTimer = null;
let lastAlertTime = 0;

function sendScreenshotAlert(reason = "captured screen") {
    const now = Date.now();
    if (now - lastAlertTime < 2000) return;

    lastAlertTime = now;

    const username = localStorage.getItem("username") || "User";

    socket?.emit("sendMessage", {
        username: "SYSTEM",
        text: `📸 ${username} ${reason}`,
        isAlert: true,
        time: getCurrentTime()
    });
}

// 📱 Mobile
document.addEventListener("touchstart", (e) => {
    if (e.touches.length === 3) {
        gestureTimer = setTimeout(() => sendScreenshotAlert(), 800);
    }
});

document.addEventListener("touchend", () => {
    if (gestureTimer) clearTimeout(gestureTimer);
});

// 💻 PC
window.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen" || e.key === "PrtSc") {
        sendScreenshotAlert();
    }
});

// ======================================================

// --- LOGIN / REGISTER ---
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(BACKEND + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        alert("Registered!");
        window.location.href = "login.html";
    } else {
        alert("Error");
    }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const res = await fetch(BACKEND + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.success) {

    localStorage.setItem("isLoggedIn", "true");

    localStorage.setItem("username", username);

    localStorage.setItem("token", data.token);

   localStorage.setItem("savedUsername", username);
   localStorage.setItem("savedPassword", password);    

    window.location.href = "selection.html";
} else {
        alert("Login failed");
    }
});

// --- TIME ---
function getCurrentTime() {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m}:${s} ${ampm}`;
}

// ================== CHAT ==================
const messagesUl = document.getElementById("messages");

function scrollToBottom() {
    if (messagesUl) messagesUl.scrollTop = messagesUl.scrollHeight;
}

// PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("username");

    const userDisplayEl = document.getElementById("display-username");
    if (userDisplayEl && user) {
        userDisplayEl.innerText = `@${user}`;
    }

    const savedChat = localStorage.getItem("chat_history");
    if (savedChat && messagesUl) {
        messagesUl.innerHTML = savedChat;
        scrollToBottom();
    }
if (typeof restoreAttachments === "function") {

    setTimeout(() => {

    restoreAttachments();

},300);

}
});

// ================== TYPING ==================
if (socket) {
    let typingTimeout;

    document.getElementById("msg")?.addEventListener("input", () => {
        const username = localStorage.getItem("username");

        socket.emit("typing", username);

        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            socket.emit("stopTyping", username);
        }, 1000);
    });

    let typingEl = null;

    socket.on("userTyping", (username) => {
        if (!messagesUl) return;

        if (!typingEl) {
            typingEl = document.createElement("li");
            typingEl.style.cssText = `
                align-self: center;
                color: #b59461;
                font-size: 0.7rem;
            `;
            messagesUl.appendChild(typingEl);
        }

        typingEl.innerHTML = `${username} typing...`;
        scrollToBottom();
    });

    socket.on("userStopTyping", () => {
        if (typingEl) {
            typingEl.remove();
            typingEl = null;
        }
    });
}

// ================== SEEN ==================
const seenMap = {};

if (socket) {
    socket.on("updateSeen", ({ messageId, seenBy }) => {
        seenMap[messageId] = seenBy;
    });
}

// SOCKET EVENTS
if (socket) {
    socket.on("receiveMessage", (data) => {
        displayMessage(data);

        const myUser = localStorage.getItem("username");

        if (data._id && data.username !== myUser) {
            socket.emit("messageSeen", {
                messageId: data._id,
                username: myUser
            });
        }
    });

    socket.on("updateUserCount", (count) => {
        document.getElementById("online-count").innerText = count;
    });

    socket.on("chatCleared", () => {
        if (messagesUl) messagesUl.innerHTML = "";
        localStorage.removeItem("chat_history");
    });


// ================= ATTACHMENTS =================

socket.on("receiveAttachment", async (data) => {

    if (!data.id) {

        data.id = crypto.randomUUID();

    }

    if (typeof saveAttachment === "function") {

        await saveAttachment(data);

    }

    displayAttachment(data);

});
}

// DISPLAY MESSAGE
function displayMessage(data) {
    if (!messagesUl) return;

    const li = document.createElement("li");
    const myUser = localStorage.getItem("username");

    if (data.isAlert || data.username === "SYSTEM") {
        li.style.cssText = `
            align-self: center;
            background: transparent;
            border: none;
            color: yellow;
            font-size: 0.6rem;
            padding: 2px;
            margin: 2px 0;
            text-align: center;
        `;
        li.innerHTML = `<span>${data.text} • ${data.time}</span>`;
    } else {
        if (data.username === myUser) {
            li.classList.add("my-message");
        }

        const messageId = data._id || Math.random();

        li.innerHTML = `
            <span><strong>${data.username}:</strong> ${data.text}</span>
            <span style="font-size: 0.6rem;">
                ${data.time || getCurrentTime()}
                <button class="info-btn" onclick="showSeen('${messageId}')">ⓘ</button>
            </span>
        `;
    }

    messagesUl.appendChild(li);
    scrollToBottom();
            }
  

// ================= ATTACHMENT PREVIEW =================

function displayAttachment(data) {

    if (!messagesUl) return;

    const li = document.createElement("li");

    const myUser = localStorage.getItem("username");

    if (data.username === myUser) {
        li.classList.add("my-message");
    }

    let preview = "";

    switch (data.fileType) {

        case "image":

            preview = `
                <img
                    src="${data.fileData}"
                    style="
                        max-width:220px;
                        border-radius:10px;
                        cursor:pointer;
                    "
                >
            `;
            break;

        case "video":

            preview = `
                <video
                    controls
                    style="
                        max-width:240px;
                        border-radius:10px;
                    ">
                    <source src="${data.fileData}">
                </video>
            `;
            break;

        case "audio":

            preview = `
                <audio controls>
                    <source src="${data.fileData}">
                </audio>
            `;
            break;

        default:

            preview = `
                <a
                    href="${data.fileData}"
                    download="${data.fileName}"
                    style="
                        color:#b59461;
                        text-decoration:none;
                        font-weight:bold;
                    ">
                    📄 ${data.fileName}
                </a>
            `;
    }

    li.innerHTML = `

        <strong>${data.username}</strong>

        <div style="margin-top:8px;">
            ${preview}
        </div>

        <span
            style="
                font-size:11px;
                opacity:.7;
                margin-top:6px;
            ">
            ${data.time}
        </span>

    `;

    messagesUl.appendChild(li);

    scrollToBottom();

    localStorage.setItem(
        "chat_history",
        messagesUl.innerHTML
    );

}

// Seen popup
window.showSeen = function(id) {
    const users = seenMap[id] || [];
    alert("Seen by:\n" + users.join("\n"));
};

// ACTIONS
window.handleSend = function () {
    const input = document.getElementById("msg");
    const text = input.value.trim();

    if (text && socket) {
        socket.emit("sendMessage", {
            username: localStorage.getItem("username"),
            text,
            time: getCurrentTime()
        });

        input.value = "";
        input.focus(); // 🔥 keyboard fix
    }
};

window.clearChat = async function () {

    if (confirm("Clear chat?")) {

        socket?.emit("clearAllChat");

        if (typeof clearAllMedia === "function") {

            await clearAllMedia();

        }

    }

};

window.logout = async function () {

    if (typeof clearAllMedia === "function") {

        await clearAllMedia();

    }

    localStorage.clear();

    window.location.href = "login.html";

};

document.getElementById("msg")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
    }
});

// ================= ATTACHMENT SEND =================

window.sendAttachment = function(fileData){

    if(!socket) return;

    socket.emit("sendAttachment",{

        id: crypto.randomUUID(),

        username:localStorage.getItem("username"),

        fileType:fileData.fileType,

        fileName:fileData.fileName,

        fileData:fileData.fileData,

        time:getCurrentTime()

    });

};
};                                                 }                              
