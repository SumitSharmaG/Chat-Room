// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// chunkProtocol.js
// DO NOT MODIFY
// ==========================================

const ChunkProtocol = {

    VERSION: "3.0",

    // ================= SETTINGS =================

    CHUNK_SIZE: 256 * 1024,          // 256 KB

    MAX_RETRY: 5,

    ACK_TIMEOUT: 5000,

    PARALLEL_UPLOADS: 1,



    // ================= STATUS =================

    STATUS:{

        WAITING:"waiting",

        UPLOADING:"uploading",

        PAUSED:"paused",

        COMPLETED:"completed",

        FAILED:"failed",

        CANCELLED:"cancelled"

    },



    // ================= FILE VALIDATION =================

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

    },



    // ================= SPLIT =================

    split(file){

        const chunks=[];

        let start=0;

        while(start<file.size){

            const end=Math.min(

                start+this.CHUNK_SIZE,

                file.size

            );

            chunks.push(

                file.slice(start,end)

            );

            start=end;

        }

        return chunks;

    },



    // ================= TOTAL CHUNKS =================

    getChunkCount(size){

        return Math.ceil(

            size/

            this.CHUNK_SIZE

        );

    },



    // ================= RANGE =================

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



    // ================= FILE TYPE =================

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



    // ================= ICON =================

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



    // ================= SIZE =================

    formatSize(bytes){

        if(!bytes)

            return "0 B";

        const units=[

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

        units[i];

    },



    // ================= PERCENT =================

    getPercent(current,total){

        if(!total)

            return 0;

        return Math.min(

            100,

            Math.floor(

                current*100/total

            )

        );

    },



    // ================= SPEED =================

    getSpeed(bytes,seconds){

        if(seconds<=0)

            return "0 KB/s";

        return this.formatSize(

            bytes/seconds

        )+"/s";

    },



    // ================= ETA =================

    getETA(leftBytes,speedBytes){

        if(speedBytes<=0)

            return "--";

        const sec=

            Math.ceil(

                leftBytes/

                speedBytes

            );

        if(sec<60)

            return sec+" sec";

        if(sec<3600)

            return Math.ceil(sec/60)

            +" min";

        return Math.ceil(sec/3600)

            +" hr";

    },



    // ================= TRANSFER ID =================

    createTransferId(){

        if(

            window.crypto?.randomUUID

        ){

            return crypto.randomUUID();

        }

        return (

            Date.now().toString(36)+

            Math.random()

            .toString(36)

            .substring(2,12)

        );

    },



    // ================= META =================

    createMeta(upload,index,total){

        return{

            uploadId:upload.id,

            fileName:upload.name,

            fileSize:upload.size,

            fileType:upload.type,

            mimeType:upload.mime,

            chunkIndex:index,

            totalChunks:total

        };

    }

};

Object.freeze(ChunkProtocol);

window.ChunkProtocol=ChunkProtocol;
