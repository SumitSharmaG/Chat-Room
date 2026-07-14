// ===========================================
// Secure Ultra Chat
// chunkSocket.js
// Socket.IO Chunk Relay
// ===========================================

module.exports = function(io){

    io.on("connection",(socket)=>{

        // ===========================
        // Receive Chunk
        // ===========================

        socket.on("uploadChunk",(data)=>{

            if(!data) return;

            io.emit("receiveChunk",{

                fileId:data.fileId,

                fileName:data.fileName,

                fileSize:data.fileSize,

                mimeType:data.mimeType,

                fileType:data.fileType,

                chunkIndex:data.chunkIndex,

                totalChunks:data.totalChunks,

                chunkData:data.chunkData,

                username:data.username,

                time:data.time

            });

        });

        // ===========================
        // Upload Finished
        // ===========================

        socket.on("uploadComplete",(data)=>{

            io.emit("uploadCompleted",{

                fileId:data.fileId,

                username:data.username

            });

        });

    });

};
