// ==========================================
// Upload UI Manager
// ==========================================

const UploadUI = {

    uploads: new Map(),

    create(file) {

        const messages = document.getElementById("messages");

        if (!messages) return null;

        const id = ChunkProtocol.generateTransferId();

        const li = document.createElement("li");

        li.className = "my-message";

        li.dataset.uploadId = id;

        li.innerHTML = `

<div style="
display:flex;
align-items:center;
gap:12px;
">

<div style="
width:46px;
height:46px;
border-radius:50%;
border:3px solid #444;
border-top:3px solid #b59461;
animation:uploadSpin 1s linear infinite;
display:flex;
align-items:center;
justify-content:center;
font-size:22px;
">

${ChunkProtocol.getIcon(
ChunkProtocol.getCategory(file.type)
)}

</div>

<div style="
flex:1;
overflow:hidden;
">

<div style="
font-weight:600;
font-size:14px;
white-space:nowrap;
overflow:hidden;
text-overflow:ellipsis;
">

${file.name}

</div>

<div style="
font-size:12px;
opacity:.75;
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

</div>

</div>

`;

        messages.appendChild(li);

        messages.scrollTop = messages.scrollHeight;

        this.uploads.set(id, li);

        return id;

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

        const text = li.querySelector(".uploadPercent");

        if (text) {

            text.innerHTML =
            "<span style='color:red'>Failed</span>";

        }

    }

};

window.UploadUI = UploadUI;
