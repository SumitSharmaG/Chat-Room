// ==========================================
// Secure Ultra Chat
// Version 4.0
// uploadUI.js
// STEP 1 / 3
// ==========================================

"use strict";

const UploadUI={

    items:new Map(),

    container:null,



    // ==========================
    // Init
    // ==========================

    init(){

        this.container=

            document.getElementById(

                "messages"

            );

    },



    // ==========================
    // Create Upload Card
    // ==========================

    create(upload){

        if(!this.container)

            this.init();

        if(!this.container)

            return;

        const li=

            document.createElement("li");

        li.className=

            "my-message upload-message";

        li.dataset.uploadId=

            upload.id;

        li.innerHTML=`

<div class="upload-card">

<div class="upload-header">

<div class="upload-icon">

${upload.icon}

</div>

<div class="upload-details">

<div class="upload-name">

${upload.name}

</div>

<div class="upload-size">

${ChunkProtocol.formatSize(upload.size)}

</div>

</div>

</div>

<div class="upload-progress-text">

Waiting...

</div>

<div class="upload-progress">

<div class="upload-fill"></div>

</div>

<div class="upload-actions">

<button
class="upload-btn pause"
data-id="${upload.id}"
>

⏸

</button>

<button
class="upload-btn resume"
data-id="${upload.id}"
>

▶

</button>

<button
class="upload-btn cancel"
data-id="${upload.id}"
>

✖

</button>

</div>

</div>

`;

        this.container.appendChild(

            li

        );

        this.container.scrollTop=

            this.container.scrollHeight;

        this.items.set(

            upload.id,

            li

        );

    },



    // ==========================
    // Get Element
    // ==========================

    get(id){

        return this.items.get(id);

    },

    // ==========================
    // Update Progress
    // ==========================

    update(id,progress,text="Uploading..."){

        const item=this.get(id);

        if(!item)

            return;

        const fill=

            item.querySelector(

                ".upload-fill"

            );

        const label=

            item.querySelector(

                ".upload-progress-text"

            );

        if(fill){

            fill.style.width=

                progress+"%";

        }

        if(label){

            label.innerText=

                `${progress}% ${text}`;

        }

    },



    // ==========================
    // Pause UI
    // ==========================

    pause(id){

        const item=this.get(id);

        if(!item)

            return;

        const label=

            item.querySelector(

                ".upload-progress-text"

            );

        if(label){

            label.innerText=

                "Paused";

        }

    },



    // ==========================
    // Resume UI
    // ==========================

    resume(id){

        const item=this.get(id);

        if(!item)

            return;

        const label=

            item.querySelector(

                ".upload-progress-text"

            );

        if(label){

            label.innerText=

                "Uploading...";

        }

    },



    // ==========================
    // Complete UI
    // ==========================

    complete(id){

        const item=this.get(id);

        if(!item)

            return;

        this.update(

            id,

            100,

            "Completed"

        );

    },



    // ==========================
    // Failed UI
    // ==========================

    fail(id,message="Upload Failed"){

        const item=this.get(id);

        if(!item)

            return;

        const label=

            item.querySelector(

                ".upload-progress-text"

            );

        if(label){

            label.innerText=

                message;

        }

    },



    // ==========================
    // Cancel UI
    // ==========================

    cancel(id){

        const item=this.get(id);

        if(!item)

            return;

        const label=

            item.querySelector(

                ".upload-progress-text"

            );

        if(label){

            label.innerText=

                "Cancelled";

        }

    },

    // ==========================
    // Remove Upload Card
    // ==========================

    remove(id){

        const item=this.get(id);

        if(!item)

            return;

        item.remove();

        this.items.delete(id);

    },



    // ==========================
    // Clear All
    // ==========================

    clear(){

        this.items.forEach(

            item=>item.remove()

        );

        this.items.clear();

    },



    // ==========================
    // Button Events
    // ==========================

    bindEvents(){

        document.addEventListener(

            "click",

            (e)=>{

                const btn=

                    e.target.closest(

                        ".upload-btn"

                    );

                if(!btn)

                    return;

                const id=

                    btn.dataset.id;

                if(

                    btn.classList.contains(

                        "pause"

                    )

                ){

                    UploadQueue.pause(id);

                    return;

                }

                if(

                    btn.classList.contains(

                        "resume"

                    )

                ){

                    UploadQueue.resume(id);

                    return;

                }

                if(

                    btn.classList.contains(

                        "cancel"

                    )

                ){

                    UploadQueue.cancel(id);

                }

            }

        );

    },



    // ==========================
    // Initialize
    // ==========================

    start(){

        this.init();

        this.bindEvents();

    }

};

Object.freeze(

    UploadUI

);

window.UploadUI=

UploadUI;
