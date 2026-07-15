// ==========================================
// Secure Ultra Chat
// Attachments
// Part 1 / 3
// ==========================================

if (!document.getElementById("attachBtn")) {

    console.log("Attachment UI skipped.");

} else {

const attachBtn =
document.getElementById("attachBtn");

const attachMenu =
document.getElementById("attachMenu");

const cameraInput =
document.getElementById("cameraInput");

const galleryInput =
document.getElementById("galleryInput");

const videoInput =
document.getElementById("videoInput");

const audioInput =
document.getElementById("audioInput");

const documentInput =
document.getElementById("documentInput");

// ================= MENU =================

attachBtn.onclick = () => {

    attachMenu.classList.toggle("show");

};

document.addEventListener("click",(e)=>{

    if(

        !attachMenu.contains(e.target)

        &&

        e.target!==attachBtn

    ){

        attachMenu.classList.remove("show");

    }

});

// ================= MENU EVENTS =================

document.querySelectorAll(".attach-item")

.forEach(item=>{

    item.onclick=()=>{

        attachMenu.classList.remove("show");

        switch(item.dataset.type){

            case "camera":

                cameraInput.value="";

                cameraInput.click();

                break;

            case "gallery":

                galleryInput.value="";

                galleryInput.click();

                break;

            case "video":

                videoInput.value="";

                videoInput.click();

                break;

            case "audio":

                audioInput.value="";

                audioInput.click();

                break;

            case "document":

                documentInput.value="";

                documentInput.click();

                break;

        }

    };

});

// ================= FILE EVENTS =================

cameraInput.onchange=()=>{

    handleFile(

        cameraInput.files[0]

    );

};

galleryInput.onchange=()=>{

    handleFile(

        galleryInput.files[0]

    );

};

videoInput.onchange=()=>{

    handleFile(

        videoInput.files[0]

    );

};

audioInput.onchange=()=>{

    handleFile(

        audioInput.files[0]

    );

};

documentInput.onchange=()=>{

    handleFile(

        documentInput.files[0]

    );

};

// ================= FILE HANDLER =================

function handleFile(file){

    if(!file) return;

    const upload =

        MediaUtils.createUpload(

            file

        );

    UploadQueue.add(

        upload

    );

        }

// ==========================================
// Part 2 / 3
// Upload Process
// ==========================================

async function startUpload(upload){

    try{

        UploadState.setStatus(

            upload.id,

            "uploading"

        );

        const chunks =

            ChunkProtocol.split(

                upload.file

            );

        const total =

            chunks.length;

        for(

            let i=0;

            i<total;

            i++

        ){

            while(upload.paused){

                await new Promise(r=>

                    setTimeout(r,200)

                );

            }

            if(upload.cancelled){

                UploadState.remove(

                    upload.id

                );

                return;

            }

            await sendChunk(

                upload,

                chunks[i],

                i,

                total

            );

            UploadState.setProgress(

                upload.id,

                i+1,

                total

            );

            UploadUI.update(

                upload.id,

                UploadState.get(

                    upload.id

                ).progress

            );

        }

        UploadState.setStatus(

            upload.id,

            "completed"

        );

        UploadUI.complete(

            upload.id

        );

    }

    catch(err){

        console.error(

            "Upload Error:",

            err

        );

        UploadState.setStatus(

            upload.id,

            "failed"

        );

        UploadUI.fail(

            upload.id

        );

    }

}

// ==========================================
// Queue Integration
// ==========================================

const oldAdd = UploadQueue.add.bind(UploadQueue);

UploadQueue.add = function(upload){

    oldAdd(upload);

    startUpload(upload);

};

// ==========================================
// Part 3 / 3
// Controls + Export
// ==========================================

// Pause Upload
window.pauseUpload = function(id){

    UploadQueue.pause(id);

};

// Resume Upload
window.resumeUpload = function(id){

    UploadQueue.resume(id);

};

// Cancel Upload
window.cancelUpload = function(id){

    UploadQueue.cancel(id);

};

// Retry Upload
window.retryUpload = function(id){

    const upload = UploadState.get(id);

    if(!upload) return;

    upload.paused = false;

    upload.cancelled = false;

    upload.progress = 0;

    UploadUI.update(id,0);

    startUpload(upload);

};

// Handle drag & drop (future ready)

window.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

window.addEventListener("drop",(e)=>{

    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if(file){

        handleFile(file);

    }

});

// Export

window.handleAttachmentFile = handleFile;

} // ===== End of Attachment Module =====
