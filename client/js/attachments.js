if (!document.getElementById("attachBtn")) {
    console.log("Attachment UI skipped.");
} else {

// ================= ATTACHMENTS =================

const attachBtn = document.getElementById("attachBtn");
const attachMenu = document.getElementById("attachMenu");

const cameraInput = document.getElementById("cameraInput");
const galleryInput = document.getElementById("galleryInput");
const videoInput = document.getElementById("videoInput");
const audioInput = document.getElementById("audioInput");
const documentInput = document.getElementById("documentInput");

// Open / Close Menu
attachBtn?.addEventListener("click", () => {
    attachMenu.classList.toggle("show");
});

document.addEventListener("click", (e) => {

    if (
        !attachMenu.contains(e.target) &&
        e.target !== attachBtn
    ) {

        attachMenu.classList.remove("show");

    }

});

// Menu Click
document.querySelectorAll(".attach-item").forEach(item => {

    item.onclick = () => {

        attachMenu.classList.remove("show");

        switch (item.dataset.type) {

            case "camera":
    cameraInput.value = "";
    cameraInput.click();
    break;

            case "gallery":
                galleryInput.click();
                break;

            case "video":
                videoInput.click();
                break;

            case "audio":
                audioInput.click();
                break;

            case "document":
                documentInput.click();
                break;

        }

    };

});

// ================= FILE PICK =================

cameraInput.onchange = () =>
    prepareFile(cameraInput.files[0], "image");

galleryInput.onchange = () =>
    prepareFile(galleryInput.files[0], "image");

videoInput.onchange = () =>
    prepareFile(videoInput.files[0], "video");

audioInput.onchange = () =>
    prepareFile(audioInput.files[0], "audio");

documentInput.onchange = () =>
    prepareFile(documentInput.files[0], "document");

// ================= SEND =================

function prepareFile(file, type){

    if(!file) return;

    let limit = 0;

    if(type==="image")
        limit = 25 * 1024 * 1024;

    else
        limit = 50 * 1024 * 1024;

    if(file.size > limit){

        alert("File is too large.");

        return;

    }

    const reader = new FileReader();

    ChunkSender.send(file);

    reader.readAsDataURL(file);

}
}
