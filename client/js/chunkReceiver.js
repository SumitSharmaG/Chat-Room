// ==========================================
// Chunk Receiver
// ==========================================

const uploads = new Map();

module.exports = function(io, socket){

// Upload Start
socket.on("chunk-upload-start",(meta)=>{

    uploads.set(meta.transferId,{

        meta,

        chunks:new Array(meta.totalChunks)

    });

});

// Receive Chunk
socket.on("chunk-upload",(packet)=>{

    const upload =
        uploads.get(packet.transferId);

    if(!upload) return;

    upload.chunks[packet.chunkIndex] =
        Buffer.from(packet.bytes);

});

// Upload Complete
socket.on("chunk-upload-complete",(packet)=>{

    const upload =
        uploads.get(packet.transferId);

    if(!upload) return;

    const buffer =
        Buffer.concat(upload.chunks);

    const base64 =
        buffer.toString("base64");

    const dataUrl =
        `data:${upload.meta.mimeType};base64,${base64}`;

    io.emit("receiveAttachment",{

        id:upload.meta.transferId,

        username:upload.meta.username,

        fileName:upload.meta.fileName,

        fileSize:upload.meta.fileSize,

        fileType:upload.meta.fileType,

        mimeType:upload.meta.mimeType,

        fileData:dataUrl,

        time:upload.meta.time

    });

    uploads.delete(packet.transferId);

});

};
