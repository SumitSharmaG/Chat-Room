// ==========================================
// Secure Ultra Chat
// Chunk Receiver
// Version 2.0 FINAL
// ==========================================

const uploads = new Map();

module.exports = function(io, socket){

    socket.on("uploadChunk", (data, callback)=>{

        try{

            let upload = uploads.get(data.uploadId);

            if(!upload){

                upload = {

                    username: data.username,

                    fileName: data.fileName,

                    fileType: data.fileType,

                    fileSize: data.fileSize,

                    totalChunks: data.totalChunks,

                    time: data.time,

                    chunks: new Array(data.totalChunks),

                    received: 0

                };

                uploads.set(
                    data.uploadId,
                    upload
                );

            }

            if(!upload.chunks[data.chunkIndex]){

                upload.chunks[data.chunkIndex] =
                    Buffer.from(data.chunkData);

                upload.received++;

            }

            callback({
                success:true
            });

            if(upload.received !== upload.totalChunks){

                return;

            }

            // Merge all chunks

            const fileBuffer =
                Buffer.concat(upload.chunks);

            // Convert Base64

            const base64 =
                fileBuffer.toString("base64");

            const mime = {

                image:"image/jpeg",

                video:"video/mp4",

                audio:"audio/mpeg",

                document:"application/octet-stream"

            };

            const dataUrl =

                `data:${mime[upload.fileType] || "application/octet-stream"};base64,${base64}`;

            io.emit("receiveAttachment",{

                id:data.uploadId,

                username:upload.username,

                fileName:upload.fileName,

                fileType:upload.fileType,

                fileSize:upload.fileSize,

                fileData:dataUrl,

                time:upload.time

            });

            uploads.delete(
                data.uploadId
            );

        }

        catch(err){

            console.log(err);

            callback({
                success:false
            });

        }

    });

};
