// ==========================================
// Secure Ultra Chat
// Chunk Protocol v2
// ==========================================

const ChunkProtocol = {

    VERSION: 1,

    // 256 KB per chunk
    CHUNK_SIZE: 256 * 1024,

    // Retry if ACK not received
    MAX_RETRY: 3,

    // ACK timeout
    ACK_TIMEOUT: 5000,

    // Upload queue
    uploads: new Map(),

    // Download queue
    downloads: new Map(),

    // Generate Unique Transfer ID
    generateTransferId() {

        if (window.crypto?.randomUUID) {

            return crypto.randomUUID();

        }

        return (

            Date.now().toString(36) +

            Math.random()
                .toString(36)
                .substring(2, 10)

        );

    },

    // Total Chunks
    getChunkCount(fileSize) {

        return Math.ceil(

            fileSize /

            this.CHUNK_SIZE

        );

    },

    // File Category
    getCategory(mime) {

        if (!mime)

            return "document";

        if (mime.startsWith("image/"))

            return "image";

        if (mime.startsWith("video/"))

            return "video";

        if (mime.startsWith("audio/"))

            return "audio";

        return "document";

    },

    // File Icon
    getIcon(type) {

        switch (type) {

            case "image":

                return "📷";

            case "video":

                return "🎥";

            case "audio":

                return "🎵";

            default:

                return "📄";

        }

    },

    // Format Size
    formatSize(bytes) {

        if (!bytes)

            return "0 B";

        const units = [

            "B",

            "KB",

            "MB",

            "GB",

            "TB"

        ];

        let index = 0;

        let size = bytes;

        while (

            size >= 1024 &&

            index < units.length - 1

        ) {

            size /= 1024;

            index++;

        }

        return size.toFixed(2) +

            " " +

            units[index];

    },

    // Upload %
    getProgress(current, total) {

        return Math.floor(

            (current / total) * 100

        );

    }

};

window.ChunkProtocol = ChunkProtocol;
