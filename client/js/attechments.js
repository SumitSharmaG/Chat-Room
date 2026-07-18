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

    // NAYA FIX: File Select hote hi MediaManager ko call karna
    const fileInputs = ['cameraInput', 'galleryInput', 'videoInput', 'audioInput', 'documentInput'];
    fileInputs.forEach(inputId => {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                // Check karo ki user select hai ya nahi
                if (typeof selectedUser === 'undefined' || !selectedUser) {
                    alert("Pehle user select karo!");
                    return;
                }

                // Global socket object ka use karke file send karo
                if (window.MediaManager && window.socket) {
                    window.MediaManager.sendFile(file, window.socket);
                    attachMenu.classList.remove("show");
                } else {
                    console.error("Socket ya MediaManager missing hai!");
                }
                
                // Input reset karo taaki dubara same file bhej sako
                e.target.value = '';
            });
        }
    });
});
                                     
