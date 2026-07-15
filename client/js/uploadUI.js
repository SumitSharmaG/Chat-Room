// ==========================================
// Secure Ultra Chat
// Upload UI
// Version 2.0 FINAL
// ==========================================

const UploadUI = {

    items: new Map(),

    create(upload){

        const messages =
            document.getElementById("messages");

        if(!messages) return;

        const li =
            document.createElement("li");

        li.className = "my-message";

        li.dataset.uploadId =
            upload.id;

        li.innerHTML = `

<div class="upload-card">

<div class="upload-icon">

${ChunkProtocol.getIcon(upload.type)}

</div>

<div class="upload-info">

<div class="upload-name">

${upload.name}

</div>

<div class="upload-size">

${ChunkProtocol.formatSize(upload.size)}

</div>

<div class="upload-progress-text">

Waiting...

</div>

<div class="upload-bar">

<div class="upload-fill"></div>

</div>

<div class="upload-actions">

<button class="upload-btn pause">

⏸

</button>

<button class="upload-btn resume">

▶

</button>

<button class="upload-btn cancel">

✖

</button>

</div>

</div>

</div>

`;

        messages.appendChild(li);

        messages.scrollTop =
            messages.scrollHeight;

        this.items.set(upload.id,li);

    },



    update(id,percent){

        const li=this.items.get(id);

        if(!li) return;

        li.querySelector(".upload-fill")
        .style.width=
        percent+"%";

        li.querySelector(".upload-progress-text")
        .innerText=
        percent+"% Uploading...";

    },



    pause(id){

        const li=this.items.get(id);

        if(!li) return;

        li.querySelector(".upload-progress-text")
        .innerText=
        "Paused";

    },



    resume(id){

        const li=this.items.get(id);

        if(!li) return;

        li.querySelector(".upload-progress-text")
        .innerText=
        "Uploading...";

    },



    fail(id){

        const li=this.items.get(id);

        if(!li) return;

        li.querySelector(".upload-progress-text")
        .innerText=
        "Upload Failed";

    },



    complete(id){

        const li=this.items.get(id);

        if(!li) return;

        li.remove();

        this.items.delete(id);

    }

};

window.UploadUI=UploadUI;
