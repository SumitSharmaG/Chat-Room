// client/mediaManager.js

window.MediaManager = {
    CHUNK_SIZE: 1024 * 1024 * 1.5, // 1.5MB stable slices

    // 1. Browser Database Initialize 
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

    // 2. Browser Storage me file permanently save karna
    saveToLocalDB: async (fileId, name, type, blob) => {
        const db = await MediaManager.initDB();
        return new Promise((resolve) => {
            const transaction = db.transaction("saved_media", "readwrite");
            const store = transaction.objectStore("saved_media");
            store.put({ fileId, name, type, blob });
            transaction.oncomplete = () => resolve(true);
        });
    },

    // 3. UI Bubble Setup (Upload/Download progress tracking bubble)
    createBubble: (fileId, name, type, isMyMessage = true) => {
        const messages = document.getElementById("messages");
        if (!messages) return;

        const li = document.createElement("li");
        li.id = `media-${fileId}`;
        if (isMyMessage) li.classList.add("my-message");

        li.innerHTML = `
            <div style="padding: 5px; min-width: 180px;">
                <span style="font-size: 0.8rem; word-break: break-all; color: var(--accent-gold);">📁 ${name}</span>
                <div style="width: 100%; background: rgba(255,255,255,0.1); height: 5px; border-radius: 3px; margin: 8px 0; overflow: hidden;">
                    <div id="pb-${fileId}" style="width: 0%; background: var(--accent-gold); height: 100%; transition: width 0.1s;"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.65rem; color: #aaa;">
                    <span id="st-${fileId}">${isMyMessage ? 'Sending...' : 'Receiving...'}</span>
                    <span id="pt-${fileId}">0%</span>
                </div>
            </div>
        `;
        messages.appendChild(li);
        if (typeof window.scrollToBottom === "function") window.scrollToBottom();
        else messages.scrollTop = messages.scrollHeight;
    },

    // 4. File Core Sender Logic
    sendFile: async (file, socket) => {
        if (!socket) return;
        const fileId = "media-" + Math.random().toString(36).substr(2, 9);
        
        // Sender UI Create
        MediaManager.createBubble(fileId, file.name, file.type, true);

        const totalChunks = Math.ceil(file.size / MediaManager.CHUNK_SIZE);
        let offset = 0;
        let chunkIndex = 0;

        // Auto Save to Sender's own browser storage instantly
        await MediaManager.saveToLocalDB(fileId, file.name, file.type, file);

        // Check if page is world-chat or private-chat to target correctly
        const isPrivate = window.location.pathname.includes("private-chat.html");
        
        // Private chat ke liye url query parameter ya standard parsing variables ka backup
        const urlParams = new URLSearchParams(window.location.search);
        const receiverName = urlParams.get("user") || window.currentChatUser || "";

        const sendNext = () => {
            if (offset >= file.size) {
                document.getElementById(`st-${fileId}`).innerText = "Sent ✔️";
                MediaManager.renderFinalUI(fileId, file.name, file.type, file);
                return;
            }

            const blob = file.slice(offset, offset + MediaManager.CHUNK_SIZE);
            const reader = new FileReader();

            reader.onload = (e) => {
                const payload = {
                    isPrivate: isPrivate,
                    receiver: receiverName.replace("@", ""),
                    fileId: fileId,
                    fileName: file.name,
                    fileType: file.type,
                    totalChunks: totalChunks,
                    chunkIndex: chunkIndex,
                    chunkData: e.target.result // ArrayBuffer transmission
                };

                socket.emit("file-relay", payload);

                chunkIndex++;
                offset += MediaManager.CHUNK_SIZE;
                
                const percent = Math.min(100, Math.round((chunkIndex / totalChunks) * 100));
                const pb = document.getElementById(`pb-${fileId}`);
                const pt = document.getElementById(`pt-${fileId}`);
                if (pb) pb.style.width = percent + "%";
                if (pt) pt.innerText = percent + "%";

                setTimeout(sendNext, 5); // Smooth background relay execution
            };
            reader.readAsArrayBuffer(blob);
        };
        sendNext();
    },

    // 5. Final Download button + Image/Video Previewer
    renderFinalUI: (fileId, name, type, blob) => {
        const bubble = document.getElementById(`media-${fileId}`);
        if (!bubble) return;
        
        const url = URL.createObjectURL(blob);
        let preview = "";

        if (type.startsWith("image/")) preview = `<img src="${url}" style="max-width:100%; border-radius:8px; margin-top:5px; user-select: text !important; -webkit-user-select: text !important;"/>`;
        else if (type.startsWith("video/")) preview = `<video src="${url}" controls style="max-width:100%; border-radius:8px; margin-top:5px;"></video>`;
        else if (type.startsWith("audio/")) preview = `<audio src="${url}" controls style="width:100%; margin-top:5px;"></audio>`;

        bubble.innerHTML = `
            <div style="padding: 5px;">
                <span style="color: var(--accent-gold); font-size:0.8rem; font-weight:600;">📎 ${name}</span>
                <div style="margin: 4px 0;">${preview}</div>
                <a href="${url}" download="${name}" style="color:#00ffcc; text-decoration:none; font-size:0.75rem; font-weight:bold; display:inline-block; margin-top:4px;">📥 Download File</a>
            </div>
        `;
        
        const messages = document.getElementById("messages");
        if (messages) messages.scrollTop = messages.scrollHeight;
        
        // Chat history update logic compatible with script.js
        if(messages) localStorage.setItem("chat_history", messages.innerHTML);
    }
};

// 6. Global Receiver Setup
window.setupMediaReceiver = (socket) => {
    if (!socket) return;
    const activeTransfers = {};

    socket.on("receive-file-relay", async (data) => {
        const { fileId, fileName, fileType, totalChunks, chunkIndex, chunkData } = data;

        if (!activeTransfers[fileId]) {
            activeTransfers[fileId] = { received: 0, chunks: new Array(totalChunks) };
            MediaManager.createBubble(fileId, fileName, fileType, false);
        }

        activeTransfers[fileId].chunks[chunkIndex] = chunkData;
        activeTransfers[fileId].received++;

        const percent = Math.round((activeTransfers[fileId].received / totalChunks) * 100);
        const pb = document.getElementById(`pb-${fileId}`);
        const pt = document.getElementById(`pt-${fileId}`);
        if (pb) pb.style.width = percent + "%";
        if (pt) pt.innerText = percent + "%";

        if (activeTransfers[fileId].received === totalChunks) {
            const st = document.getElementById(`st-${fileId}`);
            if (st) st.innerText = "Assembling...";
            
            const finalBlob = new Blob(activeTransfers[fileId].chunks, { type: fileType });
            
            // Save locally inside recipient browser IndexedDB
            await MediaManager.saveToLocalDB(fileId, fileName, fileType, finalBlob);
            MediaManager.renderFinalUI(fileId, fileName, fileType, finalBlob);
            
            delete activeTransfers[fileId]; // Instantly free RAM memory leak protection
        }
    });
};
                                                         
