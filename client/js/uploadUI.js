// ==========================================
// Upload UI Manager (FINAL)
// ==========================================

const UploadUI = {

    uploads: new Map(),

    create(file, transferId) {

        const messages = document.getElementById("messages");

        if (!messages) return;

        const li = document.createElement("li");

        li.className = "my-message";

        li.dataset.uploadId = transferId;

        li.innerHTML = `

<div style="
display:flex;
align-items:center;
gap:12px;
">

<div class="uploadSpinner"
style="
width:48px;
height:48px;
border-radius:50%;
border:3px solid #444;
border-top:3px solid #b59461;
display:flex;
align-items:center;
justify-content:center;
font-size:22px;
animation:uploadSpin 1s linear infinite;
">

${ChunkProtocol.getIcon(
ChunkProtocol.getCategory(file.type)
)}

</div>

<div style="flex:1;">

<div style="
font-weight:600;
font-size:14px;
word-break:break-word;
">

${file.name}

</div>

<div style="
font-size:12px;
opacity:.75;
margin-top:2px;
">

${ChunkProtocol.formatSize(file.size)}

</div>

<div class="uploadPercent"
style="
margin-top:6px;
font-size:12px;
color:#b59461;
">

0%

</div>

<div style="
margin-top:8px;
display:flex;
gap:6px;
">

<button
class="pauseBtn"
onclick="ChunkSender.pause('${transferId}')">

⏸

</button>

<button
class="resumeBtn"
onclick="ChunkSender.resume('${transferId}')">

▶

</button>

<button
class="cancelBtn"
onclick="ChunkSender.cancel('${transferId}')">

✖

</button>

</div>

</div>

</div>

`;

        messages.appendChild(li);

        messages.scrollTop = messages.scrollHeight;

        this.uploads.set(transferId, li);

        return transferId;

    },



    update(id, percent) {

        const li = this.uploads.get(id);

        if (!li) return;

        const text = li.querySelector(".uploadPercent");

        if (text) {

            text.innerText = percent + "%";

        }

    },



    finish(id) {

        const li = this.uploads.get(id);

        if (!li) return;

        li.remove();

        this.uploads.delete(id);

    },



    fail(id) {

        const li = this.uploads.get(id);

        if (!li) return;

        const spinner = li.querySelector(".uploadSpinner");

        if (spinner) {

            spinner.style.animation = "none";

        }

        const text = li.querySelector(".uploadPercent");

        if (text) {

            text.innerHTML =
            "<span style='color:red'>Upload Failed</span>";

        }

    }

};

window.UploadUI = UploadUI;
