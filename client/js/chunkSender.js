// =======================================
// Chunk Sender
// =======================================

const ChunkSender = {

    CHUNK_SIZE: 256 * 1024,

    paused: {},

    cancelled: {},

    async send(file){

        if(!socket) return;

        const transferId =
    ChunkProtocol.generateTransferId();

UploadUI.create(
    file,
    transferId
);

        const category =
            ChunkProtocol.getCategory(file.type);

        const totalChunks =
            Math.ceil(file.size / this.CHUNK_SIZE);

        this.paused[transferId]=false;
        this.cancelled[transferId]=false;

        socket.emit("chunk-upload-start",{

            transferId,

            fileName:file.name,

            fileSize:file.size,

            mimeType:file.type,

            fileType:category,

            totalChunks,

            username:localStorage.getItem("username"),

            time:getCurrentTime()

        });

        let chunkIndex=0;

        while(chunkIndex<totalChunks){

            // Cancel
            if(this.cancelled[transferId]){

                UploadUI.fail(transferId);

                socket.emit("chunk-upload-cancel",{

                    transferId

                });

                delete this.paused[transferId];
                delete this.cancelled[transferId];

                return;

            }

            // Pause
            while(this.paused[transferId]){

                await new Promise(r=>setTimeout(r,200));

            }

            const start=
                chunkIndex*this.CHUNK_SIZE;

            const end=
                Math.min(
                    start+this.CHUNK_SIZE,
                    file.size
                );

            const blob=file.slice(start,end);

            const buffer=
                await blob.arrayBuffer();

            const bytes=
                Array.from(
                    new Uint8Array(buffer)
                );

            await new Promise(resolve=>{

                socket.emit("chunk-upload",{

                    transferId,

                    chunkIndex,

                    bytes

                });

                socket.once("chunk-ack",(ack)=>{

                    if(
                        ack.transferId===transferId &&
                        ack.chunkIndex===chunkIndex
                    ){

                        resolve();

                    }

                });

            });

            chunkIndex++;

            UploadUI.update(

                transferId,

                Math.floor(
                    chunkIndex/totalChunks*100
                )

            );

        }

        socket.emit("chunk-upload-complete",{

            transferId

        });

        UploadUI.finish(transferId);

        delete this.paused[transferId];
        delete this.cancelled[transferId];

    },



    pause(id){

        this.paused[id]=true;

    },



    resume(id){

        this.paused[id]=false;

    },



    cancel(id){

        this.cancelled[id]=true;

    }

};

window.ChunkSender=ChunkSender;
