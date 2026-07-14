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
        socket.emit("chunk-upload-start", {

            transferId,

            fileName: file.name,

            fileSize: file.size,

            mimeType: file.type,

            fileType: category,

            totalChunks,

            username:
                localStorage.getItem("username"),

            time:
                getCurrentTime()

        });

        let chunkIndex = 0;

        while (
            chunkIndex <
            totalChunks
        ) {

            const start =
                chunkIndex *
                this.CHUNK_SIZE;

            const end =
                Math.min(
                    start +
                    this.CHUNK_SIZE,
                    file.size
                );

            const blob =
                file.slice(start, end);

            const buffer =
                await blob.arrayBuffer();

            const bytes =
                Array.from(
                    new Uint8Array(buffer)
                );

            socket.emit("chunk-upload", {

                transferId,

                chunkIndex,

                bytes

            });

            chunkIndex++;

            const percent =
                Math.floor(
                    (chunkIndex /
                    totalChunks) * 100
                );

            UploadUI.update(
                transferId,
                percent
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
