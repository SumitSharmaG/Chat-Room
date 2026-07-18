// client/js/attachments.js

document.addEventListener("DOMContentLoaded", () => {
    const attachBtn = document.getElementById("attachBtn");
    const attachMenu = document.getElementById("attachMenu");

    if (attachBtn && attachMenu) {
        attachBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            attachMenu.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
                attachMenu.classList.remove("show");
            }
        });
    }

    // Har ek inputs par events trace karna
    const fileInputs = ['cameraInput', 'galleryInput', 'videoInput', 'audioInput', 'documentInput'];
    fileInputs.forEach(inputId => {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const activeUser = window.selectedUser || window.currentChatUser;
                if (!activeUser) {
                    alert("Pehle user select karo jise file bhejni hai!");
                    return;
                }

                if (window.MediaManager && window.socket) {
                    // Menu chhupao
                    if (attachMenu) attachMenu.classList.remove("show");
                    
                    // Core sender trigger
                    await window.MediaManager.sendFile(file, window.socket);
                } else {
                    console.error("Critical components missing! Socket or MediaManager not loaded.");
                }
                
                e.target.value = ''; // Reset pointer
            });
        }
    });
});
                    
