// ==========================================
// Secure Ultra Chat
// Chunk Receiver
// Version 2.0 FINAL
// ==========================================

const UploadAck = require("./uploadAck");

const activeUploads = new Map();

module.exports = function(io,socket){

    socket.on("uploadChunk",(data,callback)=>{

        try{

            let upload=
                activeUploads.get(
                    data.uploadId
                );

            if(!upload){

                upload={

                    id:data.uploadId,

                    username:data.username,

                    fileName:data.fileName,

                    fileType:data.fileType,

                    fileSize:data.fileSize,

                    totalChunks:data.totalChunks,

                    chunks:new Array(
                        data.totalChunks
                    ),

                    received:0,

                    time:data.time

                };

                activeUploads.set(
                    data.uploadId,
                    upload
                );

                UploadAck.create(
                    data.uploadId,
                    data.totalChunks
                );

            }

            if(

                !upload.chunks[
                    data.chunkIndex
                ]

            ){

                upload.chunks[
                    data.chunkIndex
                ]=

                Buffer.from(
                    data.chunkData
                );

                upload.received++;

            }

            const finished=

                UploadAck.receive(
                    data.uploadId
                );

            callback({

                success:true,

                progress:

                UploadAck.progress(
                    data.uploadId
                )

            });

            if(!finished){

                return;

            }

            const fileBuffer=

                Buffer.concat(
                    upload.chunks
                );

            const mime={

                image:"image/jpeg",

                video:"video/mp4",

                audio:"audio/mpeg",

                document:
                "application/octet-stream"

            };

            const dataUrl=

                `data:${mime[upload.fileType]||"application/octet-stream"};base64,${fileBuffer.toString("base64")}`;

            io.emit(

                "receiveAttachment",

                {

                    id:upload.id,

                    username:
                    upload.username,

                    fileName:
                    upload.fileName,

                    fileType:
                    upload.fileType,

                    fileSize:
                    upload.fileSize,

                    fileData:
                    dataUrl,

                    time:
                    upload.time

                }

            );

            UploadAck.complete(
                upload.id
            );

            UploadAck.remove(
                upload.id
            );

            activeUploads.delete(
                upload.id
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
