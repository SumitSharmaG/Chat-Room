// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// chunkProtocol.js
// PART 1 / 3
// ==========================================

"use strict";

const ChunkProtocol = {

    // ==========================
    // Protocol
    // ==========================

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

        MERGING: "merging",

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

        CANCEL: "cancel"

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
    // Icons
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
    // Size
    // ==========================

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

        const index=Math.floor(

            Math.log(bytes)/

            Math.log(1024)

        );

        return (

            bytes/

            Math.pow(1024,index)

        ).toFixed(2)

        +" "+

        units[index];

    },



    // ==========================
    // Progress
    // ==========================

    calculateProgress(current,total){

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

                offset+this.CHUNK_SIZE,

                file.size

            );

            chunks.push({

                index,

                start:offset,

                end,

                blob:file.slice(offset,end)

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

        success=true

    ){

        return{

            type:this.PACKET.ACK,

            transferId,

            chunkIndex,

            success,

            receivedAt:Date.now()

        };

    },



    // ==========================
    // File Validation
    // ==========================

    validateFile(file){

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



    // ==========================
    // Packet Validation
    // ==========================

    validatePacket(packet){

        if(!packet)

            return false;

        if(!packet.transferId)

            return false;

        if(packet.chunkIndex===undefined)

            return false;

        if(!packet.totalChunks)

            return false;

        if(packet.chunkData===undefined)

            return false;

        return true;

    },



    // ==========================
    // ACK Validation
    // ==========================

    validateAck(ack){

        if(!ack)

            return false;

        if(!ack.transferId)

            return false;

        if(ack.chunkIndex===undefined)

            return false;

        if(typeof ack.success!=="boolean")

            return false;

        return true;

    },

    // ==========================
    // Speed
    // ==========================

    calculateSpeed(bytes,timeMs){

        if(timeMs<=0)

            return 0;

        return Math.floor(

            bytes/

            (timeMs/1000)

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
    // Format Seconds
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
    // Is Last Chunk
    // ==========================

    isLastChunk(

        index,

        total

    ){

        return index===total-1;

    },



    // ==========================
    // Remaining Chunks
    // ==========================

    remainingChunks(

        current,

        total

    ){

        return Math.max(

            total-current,

            0

        );

    },



    // ==========================
    // Remaining Bytes
    // ==========================

    remainingBytes(

        currentChunk,

        totalChunks,

        fileSize

    ){

        const uploaded=

            currentChunk*

            this.CHUNK_SIZE;

        return Math.max(

            fileSize-uploaded,

            0

        );

    },



    // ==========================
    // Browser Support
    // ==========================

    supported(){

        return (

            !!window.File &&

            !!window.Blob &&

            !!window.FileReader &&

            !!window.indexedDB &&

            !!window.crypto

        );

    },



    // ==========================
    // Reset Helper
    // ==========================

    createEmptyProgress(){

        return{

            progress:0,

            uploadedChunks:0,

            totalChunks:0,

            uploadedBytes:0,

            speed:0,

            eta:0,

            retry:0

        };

    }

};

Object.freeze(

    ChunkProtocol.STATUS

);

Object.freeze(

    ChunkProtocol.PACKET

);

Object.freeze(

    ChunkProtocol.FILE

);

Object.freeze(

    ChunkProtocol

);

window.ChunkProtocol=

ChunkProtocol;
