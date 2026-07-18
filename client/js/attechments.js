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

    // --- AUTOMATIC FILE SELECTION HANDLING AND UPLOAD CORE ---
    const fileInputs = ['cameraInput', 'galleryInput', 'videoInput', 'audioInput', 'documentInput'];
    
    fileInputs.forEach(inputId => {
        const inputEl = document.getElementById(inputId);
        if (inputEl) {
            inputEl.addEventListener('change', async function(e) {
                const file = e.target.files[0];
                if (!file) return;

                // Check standard variables inside chat window context
                if (typeof selectedUser === 'undefined' || !selectedUser) {
                    alert("Please select a user first before sending media!");
                    return;
                }

                // Identify media type category accurately
                let mediaType = 'document';
                if (inputId.includes('camera') || inputId.includes('gallery')) mediaType = 'image';
                if (inputId.includes('video')) mediaType = 'video';
                if (inputId.includes('audio')) mediaType = 'audio';

                try {
                    // Generate structured standard transaction variables
                    const fileId = 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    
                    // Convert raw target streams directly into usable base64 formats
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const fileDataString = event.target.result;

                        // Secure buffer space directly inside the Media Manager IndexDB engine safely
                        if (window.MediaManager && window.MediaManager.saveIncomingMedia) {
                            window.MediaManager.saveIncomingMedia(fileId, fileDataString);
                        } else {
                            // Secondary fallback memory system using default localStorage buffers
                            localStorage.setItem(`media_blob_${fileId}`, fileDataString);
                        }

                        // Build matching unified network structural package parameters
                        const mediaMessage = {
                            sender: currentUser,
                            receiver: selectedUser,
                            text: `[Sent a ${mediaType}]`,
                            time: formatAMPM(new Date()),
                            id: Date.now(),
                            fileId: fileId,
                            fileType: mediaType,
                            fileName: file.name
                        };

                        // 1. Broadcast stream live through web-socket connection instantly
                        if (typeof socket !== 'undefined') {
                            socket.emit("private_message", mediaMessage);
                        }

                        // 2. Commit transaction metadata values into historical database
                        if (typeof saveAndRender === 'function') {
                            saveAndRender(mediaMessage);
                        }

                        // 3. Command interface framework layouts to refresh media views immediately
                        if (window.MediaManager && window.MediaManager.restoreHistoryPreviews) {
                            setTimeout(window.MediaManager.restoreHistoryPreviews, 300);
                        }
                    };
                    
                    reader.readAsDataURL(file);
                    
                } catch (error) {
                    console.error("Error processing attachment payload stream:", error);
                    alert("Failed to process media file. Please try again.");
                }

                // Clear element string context targets to accept replacement uploads seamlessly
                this.value = '';
            });
        }
    });
});
