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

// 🔥 CONNECT (only if socket exists)
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
return ${h}:${m}:${s} ${ampm};
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

localStorage.setItem("chat_history", messagesUl.innerHTML);

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

window.clearChat = function () {
if (confirm("Clear chat?")) {
socket?.emit("clearAllChat");
}
};

window.logout = function () {
localStorage.clear(); // Saara data aur login flag clear ho jayega
window.location.href = "login.html";
};

document.getElementById("msg")?.addEventListener("keydown", (e) => {
if (e.key === "Enter") {
e.preventDefault();
handleSend();
}
});

•3.auth.js code ---

const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const router = express.Router();

const SECRET_KEY = crypto
.createHash("sha256")
.update(process.env.ENCRYPTION_KEY)
.digest();

function encrypt(text) {
const iv = crypto.randomBytes(16);

const cipher = crypto.createCipheriv(
"aes-256-cbc",
SECRET_KEY,
iv
);

let encrypted = cipher.update(text, "utf8", "hex");
encrypted += cipher.final("hex");

return iv.toString("hex") + ":" + encrypted;
}

function decrypt(encryptedText) {
const parts = encryptedText.split(":");

const iv = Buffer.from(parts[0], "hex");
const encryptedData = parts[1];

const decipher = crypto.createDecipheriv(
"aes-256-cbc",
SECRET_KEY,
iv
);

let decrypted = decipher.update(
encryptedData,
"hex",
"utf8"
);

decrypted += decipher.final("utf8");

return decrypted;
}

// REGISTER
router.post("/register", async (req, res) => {
try {
const { username, password } = req.body;

const existingUser = await User.findOne({ username });  

if (existingUser) {  
  return res.json({  
    success: false,  
    message: "Username already exists"  
  });  
}  

const encryptedPassword = encrypt(password);  

await User.create({  
  username,  
  password: encryptedPassword  
});  

res.json({ success: true });

} catch (err) {
console.error(err);

res.status(500).json({  
  success: false  
});

}
});

// LOGIN
router.post("/login", async (req, res) => {
try {
const { username, password } = req.body;

const user = await User.findOne({ username });  

if (!user) {  
  return res.json({ success: false });  
}  

const originalPassword = decrypt(user.password);  

if (originalPassword === password) {

const token = jwt.sign(
{
userId: user._id,
username: user.username
},
process.env.JWT_SECRET,
{
expiresIn: "7d"
}
);

return res.json({
success: true,
token
});
}
res.json({
success: false
});

} catch (err) {
console.error(err);

res.status(500).json({  
  success: false  
});

}
});

module.exports = router;
