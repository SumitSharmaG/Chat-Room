// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// uploadUI.js
// DO NOT MODIFY
// ==========================================

const UploadUI = {

    items:new Map(),

    // ================= CREATE =================

    create(upload){

        const messages=

            document.getElementById("messages");

        if(!messages) return;

        const li=

            document.createElement("li");

        li.className="my-message";

        li.dataset.uploadId=upload.id;

        li.innerHTML=`

<div class="upload-card">

<div class="upload-header">

<div class="upload-icon">

${upload.icon}

</div>

<div class="upload-title">

${upload.name}

</div>

</div>

<div class="upload-meta">

${MediaUtils.formatSize(upload.size)}

</div>

<div class="upload-status">

Waiting...

</div>

<div class="upload-progress">

<div class="upload-progress-fill"></div>

</div>

<div class="upload-footer">

<div class="upload-percent">

0%

</div>

<div class="upload-speed">

0 KB/s

</div>

<div class="upload-eta">

--

</div>

</div>

<div class="upload-buttons">

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

`;

        messages.appendChild(li);

        messages.scrollTop=

            messages.scrollHeight;

        this.items.set(upload.id,li);



        // Pause

        li.querySelector(".pause")

        .onclick=()=>{

            UploadQueue.pause(upload.id);

        };



        // Resume

        li.querySelector(".resume")

        .onclick=()=>{

            UploadQueue.resume(upload.id);

        };



        // Cancel

        li.querySelector(".cancel")

        .onclick=()=>{

            UploadQueue.cancel(upload.id);

        };

    },



    // ================= UPDATE =================

    update(id){

        const upload=

            UploadState.get(id);

        if(!upload) return;

        const li=

            this.items.get(id);

        if(!li) return;

        li.querySelector(

            ".upload-progress-fill"

        ).style.width=

        upload.progress+"%";



        li.querySelector(

            ".upload-percent"

        ).innerText=

        upload.progress+"%";



        li.querySelector(

            ".upload-status"

        ).innerText=

        "Uploading...";



        li.querySelector(

            ".upload-speed"

        ).innerText=

        ChunkProtocol.formatSize(

            upload.speed

        )+"/s";



        li.querySelector(

            ".upload-eta"

        ).innerText=

        upload.eta;

    },



    // ================= STATUS =================

    waiting(id){

        this.setText(

            id,

            "Waiting..."

        );

    },



    pause(id){

        this.setText(

            id,

            "Paused"

        );

    },



    resume(id){

        this.setText(

            id,

            "Uploading..."

        );

    },



    fail(id){

        this.setText(

            id,

            "Upload Failed"

        );

    },



    cancel(id){

        this.setText(

            id,

            "Cancelled"

        );

    },



    // ================= COMPLETE =================

    complete(id){

        const li=

            this.items.get(id);

        if(!li) return;

        li.remove();

        this.items.delete(id);

    },



    // ================= HELPERS =================

    setText(id,text){

        const li=

            this.items.get(id);

        if(!li) return;

        li.querySelector(

            ".upload-status"

        ).innerText=text;

    }

};

Object.freeze(UploadUI);

window.UploadUI=UploadUI;
