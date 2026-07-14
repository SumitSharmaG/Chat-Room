// ================= ATTACHMENTS =================

if (!document.getElementById("attachBtn")) {

    console.log("Attachment UI skipped.");

} else {

const attachBtn = document.getElementById("attachBtn");
const attachMenu = document.getElementById("attachMenu");

const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const videoInput = document.getElementById("videoInput");
const audioInput = document.getElementById("audioInput");
const documentInput = document.getElementById("documentInput");

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

// ================= PICK =================

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

cameraInput.onchange=()=>prepare(cameraInput.files[0]);

galleryInput.onchange=()=>prepare(galleryInput.files[0]);

videoInput.onchange=()=>prepare(videoInput.files[0]);

audioInput.onchange=()=>prepare(audioInput.files[0]);

documentInput.onchange=()=>prepare(documentInput.files[0]);

// ================= SEND =================

function prepare(file){

if(!file) return;

// ChunkSender sab handle karega

ChunkSender.send(file);

}

}
