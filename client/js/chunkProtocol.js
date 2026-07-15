// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// chunkProtocol.js
// PART 1 / 2
// ==========================================

"use strict";

const ChunkProtocol = {

    VERSION: "4.0",

    CHUNK_SIZE: 256 * 1024,

    MAX_RETRY: 5,

    ACK_TIMEOUT: 5000,

    PARALLEL_UPLOADS: 1,



    // ==========================
    // Upload Status
    // ==========================

    STATUS: Object.freeze({

        WAITING: "waiting",

        PREPARING: "preparing",

        UPLOADING: "uploading",

        PAUSED: "paused",

        COMPLETED: "completed",

        FAILED: "failed",

        CANCELLED: "cancelled"

    }),



    // ==========================
    // Packet Types
    // ==========================

    PACKET: Object.freeze({

        CHUNK: "chunk",

        ACK: "ack",

        COMPLETE: "complete",

        ERROR: "error"

    }),



    // ==========================
    // File Types
    // ==========================

    FILE: Object.freeze({

        IMAGE: "image",

        VIDEO: "video",

        AUDIO: "audio",

        DOCUMENT: "document"

    }),



    // ==========================
    // Transfer ID
    // ==========================

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



    // ==========================
    // File Type
    // ==========================

    getFileType(mime){

        if(!mime)

            return this.FILE.DOCUMENT;

        if(mime.startsWith("image/"))

            return this.FILE.IMAGE;

        if(mime.startsWith("video/"))

            return this.FILE.VIDEO;

        if(mime.startsWith("audio/"))

            return this.FILE.AUDIO;

        return this.FILE.DOCUMENT;

    },



    // ==========================
    // File Icon
    // ==========================

    getFileIcon(type){

        switch(type){

            case this.FILE.IMAGE:

                return "🖼️";

            case this.FILE.VIDEO:

                return "🎥";

            case this.FILE.AUDIO:

                return "🎵";

            default:

                return "📄";

        }

    },



    // ==========================
    // Format Size
    // ==========================

    formatSize(bytes){

        if(!Number.isFinite(bytes) || bytes<=0){

            return "0 B";

        }

        const units=[

            "B",

            "KB",

            "MB",

            "GB",

            "TB"

        ];

        const index=Math.min(

            Math.floor(

                Math.log(bytes)/

                Math.log(1024)

            ),

            units.length-1

        );

        return(

            bytes/

            Math.pow(1024,index)

        ).toFixed(2)

        +" "+

        units[index];

    },



    // ==========================
    // Progress
    // ==========================

    calculateProgress(

        current,

        total

    ){

        if(total<=0)

            return 0;

        return Math.min(

            100,

            Math.floor(

                (current*100)/total

            )

        );

    },



    // ==========================
    // Total Chunks
    // ==========================

    getTotalChunks(fileSize){

        return Math.ceil(

            fileSize/

            this.CHUNK_SIZE

        );

    },



    // ==========================
    // Split File
    // ==========================

    splitFile(file){

        const chunks=[];

        let offset=0;

        let index=0;

        while(offset<file.size){

            const end=Math.min(

                offset+

                this.CHUNK_SIZE,

                file.size

            );

            chunks.push({

                index,

                blob:file.slice(

                    offset,

                    end

                )

            });

            offset=end;

            index++;

        }

        return chunks;

    },

    // ==========================
    // Transfer Metadata
    // ==========================

    createTransferMeta(file,sender,room){

        return{

            transferId:this.createTransferId(),

            fileName:file.name,

            fileSize:file.size,

            mimeType:file.type,

            fileType:this.getFileType(file.type),

            totalChunks:this.getTotalChunks(file.size),

            sender,

            room,

            createdAt:Date.now()

        };

    },



    // ==========================
    // Chunk Packet
    // ==========================

    createPacket(meta,chunk){

        return{

            type:this.PACKET.CHUNK,

            transferId:meta.transferId,

            fileName:meta.fileName,

            fileSize:meta.fileSize,

            mimeType:meta.mimeType,

            fileType:meta.fileType,

            totalChunks:meta.totalChunks,

            sender:meta.sender,

            room:meta.room,

            createdAt:meta.createdAt,

            chunkIndex:chunk.index,

            chunkSize:chunk.blob.size,

            chunkData:chunk.blob

        };

    },



    // ==========================
    // ACK Packet
    // ==========================

    createAck(

        transferId,

        chunkIndex,

        success=true,

        message="OK"

    ){

        return{

            type:this.PACKET.ACK,

            transferId,

            chunkIndex,

            success,

            message,

            serverTime:Date.now()

        };

    },



    // ==========================
    // Validate File
    // ==========================

    validateFile(file){

        if(!(file instanceof File)){

            return{

                ok:false,

                message:"Invalid file."

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



    // ==========================
    // Validate Packet
    // ==========================

    validatePacket(packet){

        return(

            packet &&

            packet.transferId &&

            Number.isInteger(packet.chunkIndex) &&

            Number.isInteger(packet.totalChunks) &&

            packet.chunkData!==undefined

        );

    },



    // ==========================
    // Validate ACK
    // ==========================

    validateAck(ack){

        return(

            ack &&

            ack.transferId &&

            Number.isInteger(ack.chunkIndex) &&

            typeof ack.success==="boolean"

        );

    },



    // ==========================
    // Speed
    // ==========================

    calculateSpeed(

        bytes,

        elapsedMs

    ){

        if(elapsedMs<=0)

            return 0;

        return Math.floor(

            bytes/

            (elapsedMs/1000)

        );

    },



    // ==========================
    // ETA
    // ==========================

    calculateETA(

        remainingBytes,

        speed

    ){

        if(speed<=0)

            return 0;

        return Math.ceil(

            remainingBytes/

            speed

        );

    },



    // ==========================
    // Format Time
    // ==========================

    formatTime(seconds){

        if(seconds<=0)

            return "0s";

        const h=Math.floor(

            seconds/3600

        );

        const m=Math.floor(

            (seconds%3600)/60

        );

        const s=seconds%60;

        if(h>0)

            return `${h}h ${m}m`;

        if(m>0)

            return `${m}m ${s}s`;

        return `${s}s`;

    },



    // ==========================
    // Browser Support
    // ==========================

    supported(){

        return(

            !!window.File &&

            !!window.Blob &&

            !!window.FileReader &&

            !!window.indexedDB &&

            !!window.crypto?.randomUUID

        );

    }

};

Object.freeze(ChunkProtocol);

window.ChunkProtocol=ChunkProtocol;
