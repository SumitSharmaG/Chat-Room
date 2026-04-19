const BACKEND = "https://YOUR_BACKEND_URL";

// REGISTER
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  await fetch(BACKEND + "/api/register", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  alert("Registered!");
  window.location.href = "login.html";
});

// LOGIN
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(BACKEND + "/api/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    localStorage.setItem("username", username);
    window.location.href = "chat.html";
  } else {
    alert("Login failed");
  }
});

// SOCKET
const socket = typeof io !== "undefined" ? io(BACKEND) : null;

function sendMsg() {
  const msg = document.getElementById("msg").value;
  const username = localStorage.getItem("username");

  socket.emit("sendMessage", { username, text: msg });
}

if (socket) {
  socket.on("receiveMessage", (data) => {
    const li = document.createElement("li");
    li.innerText = data.username + ": " + data.text;

    document.getElementById("messages").appendChild(li);
  });
}