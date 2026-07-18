// client/js/attachments.js

document.addEventListener("DOMContentLoaded", () => {
    const attachBtn = document.getElementById("attachBtn");
    const attachMenu = document.getElementById("attachMenu");

    if (attachBtn && attachMenu) {
        // Toggle menu when clicking button
        attachBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            attachMenu.classList.toggle("show");
        });

        // Close menu on outside click
        document.addEventListener("click", (e) => {
            if (!attachMenu.contains(e.target) && e.target !== attachBtn) {
                attachMenu.classList.remove("show");
            }
        });
    }

    // --- DIRECT ROUTING TO MEDIAMANAGER CHUNK SENDER ---
    const fileInputs = ['cameraInput', 'galleryInput', 'videoInput', 'audioInput', 'documentInput'];
    
    fileInputs.forEach(inputId => {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // Validation check for user selection
                if (typeof selectedUser === 'undefined' || !selectedUser) {
                    alert("Please select a user first before sending media!");
                    this.value = '';
                    return;
                }

                // Validation check for active connection framework
                if (typeof socket === 'undefined' || !socket) {
                    alert("Chat server connection is not active!");
                    this.value = '';
                    return;
                }

                try {
                    // Hide menu immediately
                    if (attachMenu) attachMenu.classList.remove("show");

                    // MAGIC FIX: Base64 ka jhanjhat khatam! Direct mediaManager ke chunking engine ko file pass karo
                    if (window.MediaManager && typeof window.MediaManager.sendFile === 'function') {
                        console.log("Routing file to MediaManager chunk engine:", file.name);
                        await window.MediaManager.sendFile(file, socket);
                    } else {
                        console.error("MediaManager.sendFile function not found!");
                        alert("Media sending system is initializing. Please try again.");
                    }
                    
                } catch (error) {
                    console.error("Error routing file to sender engine:", error);
                }

                // Reset field to allow consecutive identical uploads
                this.value = '';
            });
        }
    });
});
