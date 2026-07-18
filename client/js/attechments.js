// js/attachments.js

document.addEventListener("DOMContentLoaded", () => {
    const attachBtn = document.getElementById("attachBtn");
    const attachMenu = document.getElementById("attachMenu");

    // 1. Menu Toggle Logic
    if (attachBtn && attachMenu) {
        attachBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            attachMenu.classList.toggle("show");
        });

        // Click outside to close menu
        document.addEventListener("click", (e) => {
            if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
                attachMenu.classList.remove("show");
            }
        });
    }

    // 2. Click Handler for Menu Items
    const menuItems = document.querySelectorAll(".attach-item");
    menuItems.forEach(item => {
        item.addEventListener("click", () => {
            const type = item.getAttribute("data-type");
            handleAttachmentSelection(type);
            attachMenu.classList.remove("show"); // Close menu after selection
        });
    });
});

// 3. Logic to Trigger Hidden Inputs
function handleAttachmentSelection(type) {
    let inputId = "";
    
    switch (type) {
        case "camera": inputId = "cameraInput"; break;
        case "gallery": inputId = "galleryInput"; break;
        case "video": inputId = "videoInput"; break;
        case "audio": inputId = "audioInput"; break;
        case "document": inputId = "documentInput"; break;
    }

    if (inputId) {
        document.getElementById(inputId).click();
    }
}

// 4. Handle File Selection (Processing the file)
// Aap is function ko apne main script.js mein bhi call kar sakte hain
const fileInputs = ["cameraInput", "galleryInput", "videoInput", "audioInput", "documentInput"];

fileInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                console.log("File selected:", file.name, "Type:", file.type);
                // YAHA PAR APNA UPLOAD LOGIC LIKHEIN
                // Jaise: sendFileToServer(file);
                alert("File selected: " + file.name);
            }
        });
    }
});
          
