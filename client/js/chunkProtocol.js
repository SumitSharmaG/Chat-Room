// ==========================================
// Secure Ultra Chat
// Chunk Protocol
// Version 2.0 (FINAL)
// ==========================================

const ChunkProtocol = {

    VERSION: "2.0",

    // ---------- Chunk Settings ----------

    CHUNK_SIZE: 256 * 1024,      // 256 KB

    MAX_RETRY: 5,

    ACK_TIMEOUT: 5000,

    PARALLEL_UPLOADS: 1,



    // ---------- Upload Status ----------

    STATUS: {

        WAITING: "waiting",

        UPLOADING: "uploading",

        PAUSED: "paused",

        COMPLETED: "completed",

        FAILED: "failed",

        CANCELLED: "cancelled"

    },



    // ---------- File Type ----------

    getFileType(mime){

        if(!mime)
            return "document";

        if(mime.startsWith("image/"))
            return "image";

        if(mime.startsWith("video/"))
            return "video";

        if(mime.startsWith("audio/"))
            return "audio";

        return "document";

    },



    // ---------- Icons ----------

    getIcon(type){

        switch(type){

            case "image":

                return "🖼️";

            case "video":

                return "🎥";

            case "audio":

                return "🎵";

            default:

                return "📄";

        }

    },



    // ---------- File Size ----------

    formatSize(bytes){

        if(bytes===0)
            return "0 B";

        if(!bytes)
            return "0 B";

        const sizes=[

            "B",

            "KB",

            "MB",

            "GB",

            "TB"

        ];

        const i=Math.floor(

            Math.log(bytes)/

            Math.log(1024)

        );

        return (

            bytes/

            Math.pow(1024,i)

        ).toFixed(2)

        +" "+

        sizes[i];

    },



    // ---------- Progress ----------

    getPercent(current,total){

        if(total===0)
            return 0;

        return Math.floor(

            (current/total)*100

        );

    },



    // ---------- Transfer ID ----------

    createTransferId(){

        if(window.crypto?.randomUUID){

            return crypto.randomUUID();

        }

        return (

            Date.now().toString(36)+

            Math.random()

            .toString(36)

            .substring(2,12)

        );

    },



    // ---------- Total Chunks ----------

    getChunkCount(size){

        return Math.ceil(

            size/

            this.CHUNK_SIZE

        );

    },



    // ---------- Chunk Range ----------

    getChunkRange(index){

        const start=

            index*

            this.CHUNK_SIZE;

        const end=

            start+

            this.CHUNK_SIZE;

        return{

            start,

            end

        };

    },



    // ---------- File Validation ----------

    validate(file){

        if(!file){

            return{

                ok:false,

                message:"No file selected."

            };

        }

        if(file.size<=0){

            return{

                ok:false,

                message:"Empty file."

            };

        }

        return{

            ok:true,

            message:"OK"

        };

    }

};

window.ChunkProtocol=ChunkProtocol;
