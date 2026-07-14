// ===========================================
// Secure Ultra Chat
// chunkSender.js
// Chunk Upload Engine
// ===========================================

async function sendFileInChunks(file){

    if(!window.socket){

        alert("Socket not connected.");

        return;

    }

    const fileId =
        MediaUtils.generateMediaId();

    const totalChunks =
        MediaUtils.getChunkCount(file.size);

    const uploadId =
        UploadUI.createUploadBubble({

            fileName:file.name,

            fileSize:file.size,

            fileType:
                MediaUtils.getFileCategory(
                    file.type
                )

        });

    let chunkIndex = 0;

    while(chunkIndex < totalChunks){

        const start =
            chunkIndex *
            MediaUtils.CHUNK_SIZE;

        const end =
            Math.min(

                start +

                MediaUtils.CHUNK_SIZE,

                file.size

            );

        const blob =
            file.slice(start,end);

        const buffer =
            await blob.arrayBuffer();

        const base64 =
            MediaUtils.arrayBufferToBase64(
                buffer
            );

        socket.emit(

            "uploadChunk",

            {

                fileId,

                fileName:file.name,

                fileSize:file.size,

                mimeType:file.type,

                fileType:
                MediaUtils.getFileCategory(
                    file.type
                ),

                chunkIndex,

                totalChunks,

                chunkData:base64,

                username:
                localStorage.getItem(
                    "username"
                ),

                time:getCurrentTime()

            }

        );

        chunkIndex++;

        UploadUI.updateUploadProgress(

            uploadId,

            MediaUtils.getUploadPercent(

                chunkIndex,

                totalChunks

            )

        );

        await MediaUtils.wait(1);

    }

    socket.emit(

        "uploadComplete",

        {

            fileId,

            username:
            localStorage.getItem(
                "username"
            )

        }

    );

    UploadUI.finishUpload(
        uploadId
    );

    setTimeout(()=>{

        UploadUI.removeUploadBubble(
            uploadId
        );

    },700);

}

window.sendFileInChunks =
sendFileInChunks;
