// =======================================
// Chunk Sender
// =======================================

const ChunkSender = {

    CHUNK_SIZE: 256 * 1024, // 256 KB

    async send(file) {

        if (!socket) return;

        // Upload bubble create
        const transferId =
            UploadUI.create(file);

        const category =
            ChunkProtocol.getCategory(file.type);

        const totalChunks =
            Math.ceil(
                file.size /
                this.CHUNK_SIZE
            );

        // Upload Start
        await new Promise((resolve)=>{

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

        chunkIndex/

        totalChunks*100

    )

);

        }

        socket.emit(
            "chunk-upload-complete",
            {
                transferId
            }
        );

    }

};

window.ChunkSender = ChunkSender;
