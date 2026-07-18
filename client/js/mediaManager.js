// client/js/mediaManager.js

window.MediaManager = {
    CHUNK_SIZE: 1024 * 1024 * 1.5, // 1.5MB slices

    initDB: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open("SecureChatMediaDB", 1);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains("saved_media")) {
                    db.createObjectStore("saved_media", { keyPath: "fileId" });
                }
            };
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    saveToLocalDB: async (fileId, name, type, blob) => {
        const db = await MediaManager.initDB();
        return new Promise((resolve) => {
            const transaction = db.transaction("saved_media", "readwrite");
            const store = transaction.objectStore("saved_media");
            store.put({ fileId, name, type, blob });
            transaction.oncomplete = () => resolve(true);
        });
    },

    createBubble: (fileId, name, type, isMyMessage = true) => {
        const messages = document.getElementById("messages");
        if (!messages) return;

        // Agar bubble pehle se hai toh dobara mat banao
        if (document.getElementById(`media-${fileId}`)) return;

        const li = document.createElement("div");
        li.id = `media-${fileId}`;
        li.className = `msg ${isMyMessage ? 'my-msg' : 'received-msg'}`;
        li.style.cssText = "list-style:none; display:flex; flex-direction:column; min-width: 200px;";

        li.innerHTML = `
            <div style="padding: 5px; width: 100%;">
                <span style="font-size: 0.8rem; word-break: break-all; color: #d4af6a;">📁 ${name}</span>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 5px; border-radius: 3px; margin: 8px 0; overflow: hidden;">
                    <div id="pb-${fileId}" style="width: 0%; background: #d4af6a; height: 100%; transition: width 0.1s;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #aaa;">
                    <span id="st-${fileId}">${isMyMessage ? 'Sending...' : 'Receiving...'}</span>
                    <span id="pt-${fileId}">0%</span>
                </div>
            </div>
        `;
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
    },

    sendFile: async (file, socket) => {
        if (!socket) return;
        const fileId = "media-" + Math.random().toString(36).substr(2, 9);
        const activeUser = window.selectedUser || window.currentChatUser;
        const currentUser = localStorage.getItem("username") || "guest";
        
        // 1. UI Create karo
        MediaManager.createBubble(fileId, file.name, file.type, true);

        // 2. Local Storage Chat History me record save karo taaki refresh pe delete na ho
        if (window.saveAndRender) {
            const timeStr = typeof formatAMPM === "function" ? formatAMPM(new Date()) : new Date().toLocaleTimeString();
            window.saveAndRender({
                sender: currentUser,
                receiver: activeUser,
                fileId: fileId,
                fileName: file.name,
                fileType: file.type,
                time: timeStr
            });
        }

        const totalChunks = Math.ceil(file.size / MediaManager.CHUNK_SIZE);
        let offset = 0;
        let chunkIndex = 0;

        await MediaManager.saveToLocalDB(fileId, file.name, file.type, file);

        const sendNext = () => {
            if (offset >= file.size) {
                const st = document.getElementById(`st-${fileId}`);
                if (st) st.innerText = "Sent ✔️";
                MediaManager.renderFinalUI(fileId, file.name, file.type, file);
                return;
            }

            const blob = file.slice(offset, offset + MediaManager.CHUNK_SIZE);
            const reader = new FileReader();

            reader.onload = (e) => {
                const payload = {
                    sender: currentUser,
                    receiver: activeUser,
                    fileId: fileId,
                    fileName: file.name,
                    fileType: file.type,
                    totalChunks: totalChunks,
                    chunkIndex: chunkIndex,
                    chunkData: e.target.result
                };

                // Server relay pipeline trigger
                socket.emit("private_message", payload);

                chunkIndex++;
                offset += MediaManager.CHUNK_SIZE;
                
                const percent = Math.min(100, Math.round((chunkIndex / totalChunks) * 100));
                const pb = document.getElementById(`pb-${fileId}`);
                const pt = document.getElementById(`pt-${fileId}`);
                if (pb) pb.style.width = percent + "%";
                if (pt) pt.innerText = percent + "%";

                setTimeout(sendNext, 10);
            };
            reader.readAsArrayBuffer(blob);
        };
        sendNext();
    },

    renderFinalUI: (fileId, name, type, blob) => {
        const bubble = document.getElementById(`media-${fileId}`);
        if (!bubble) return;
        
        if(!window.LoadedBlobs) window.LoadedBlobs = {};
        window.LoadedBlobs[fileId] = blob;

        const url = URL.createObjectURL(blob);
        let preview = "";
        let clickHandler = "";

        const isPDF = type === "application/pdf" || name.toLowerCase().endsWith(".pdf");

        if (type.startsWith("image/")) {
            preview = `<img src="${url}" style="max-width:100%; border-radius:8px; margin-top:5px; cursor:zoom-in;" />`;
            clickHandler = `onclick="window.MediaManager.openPreview('${fileId}', 'image')"`;
        } else if (isPDF) {
            preview = `<div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:8px; margin-top:5px; border:1px solid rgba(181,148,97,0.3); text-align:center; color:#00ffcc; font-size:0.8rem; font-weight:600;">📖 Click to Preview PDF Inside Chat</div>`;
            clickHandler = `onclick="window.MediaManager.openPreview('${fileId}', 'pdf')"`;
        } else if (type.startsWith("video/")) {
            preview = `<video src="${url}" controls style="max-width:100%; border-radius:8px; margin-top:5px;"></video>`;
        } else if (type.startsWith("audio/")) {
            preview = `<audio src="${url}" controls style="width:100%; margin-top:5px;"></audio>`;
        } else {
            const extension = name.split('.').pop().toUpperCase();
            preview = `<div style="background:#222; padding:8px; border-radius:6px; margin-top:5px; font-size:0.75rem; color:#fff; border-left:3px solid #d4af6a;">⚙️ File Format: [${extension}]</div>`;
        }

        bubble.innerHTML = `
            <div style="padding: 5px; width:100%; cursor:pointer;" ${clickHandler}>
                <span style="color: #d4af6a; font-size:0.8rem; font-weight:600; display:block; word-break:break-all;">📎 ${name}</span>
                <div style="margin: 4px 0;">${preview}</div>
                <a href="${url}" download="${name}" onclick="event.stopPropagation();" style="color:#00ffcc; text-decoration:none; font-size:0.75rem; font-weight:bold; display:inline-block; margin-top:4px;">📥 Download File</a>
            </div>
        `;
        
        const messages = document.getElementById("messages");
        if (messages) messages.scrollTop = messages.scrollHeight;
    },

    openPreview: (fileId, mode) => {
        const blob = window.LoadedBlobs ? window.LoadedBlobs[fileId] : null;
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const overlay = document.getElementById("mediaOverlay");
        const container = document.getElementById("overlayContent");
        
        if (!overlay || !container) return;

        if (mode === 'image') {
            container.innerHTML = `<img src="${url}" alt="Preview" onclick="event.stopPropagation();" />`;
            overlay.classList.add("show");
        } else if (mode === 'pdf') {
            container.innerHTML = `<iframe src="https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(url)}" style="width:90%; height:85dvh; border:none; background:#fff; border-radius:12px;"></iframe>`;
            overlay.classList.add("show");
        }
    },

    restoreHistoryPreviews: async () => {
        const db = await MediaManager.initDB();
        const transaction = db.transaction("saved_media", "readonly");
        const store = transaction.objectStore("saved_media");
        
        const request = store.getAll();
        request.onsuccess = (e) => {
            const records = e.target.result;
            if(!window.LoadedBlobs) window.LoadedBlobs = {};
            
            records.forEach(item => {
                window.LoadedBlobs[item.fileId] = item.blob;
                const bubble = document.getElementById(`media-${item.fileId}`);
                if(bubble) {
                    MediaManager.renderFinalUI(item.fileId, item.name, item.type, item.blob);
                }
            });
        };
    }
};

// Global Setup Function Modification
window.setupMediaReceiver = (socket) => {
    // Ye code humne direct private_message event handler me wrap kar diya hai html ke andar.
};
            
