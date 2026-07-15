// ==========================================
// Secure Ultra Chat
// Chunk Sender
// Version 2.0 FINAL
// ==========================================

window.sendChunk = function (

    upload,

    chunk,

    index,

    total

){

    return new Promise((resolve,reject)=>{

        if(!window.socket){

            reject("Socket Offline");

            return;

        }

        const reader = new FileReader();

        reader.onload = ()=>{

            socket.emit(

                "uploadChunk",

                {

                    uploadId: upload.id,

                    fileName: upload.name,

                    fileType: upload.type,

                    fileSize: upload.size,

                    chunkIndex: index,

                    totalChunks: total,

                    username: localStorage.getItem("username"),

                    chunkData: reader.result,

                    time: getCurrentTime()

                },

                (ack)=>{

                    if(!ack){

                        reject();

                        return;

                    }

                    if(ack.success){

                        resolve();

                    }else{

                        reject();

                    }

                }

            );

        };

        reader.onerror = reject;

        reader.readAsArrayBuffer(chunk);

    });

};
