// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// mediaUtils.js
// PART 1 / 3
// ==========================================

"use strict";

const MediaUtils = {

    // ==========================
    // Create Upload Object
    // ==========================

    createUpload(file,sender,room){

        const meta=

            ChunkProtocol.createTransferMeta(

                file,

                sender,

                room

            );

        return{

            id:meta.transferId,

            transferId:meta.transferId,

            file,

            meta,

            name:file.name,

            size:file.size,

            mime:file.type,

            type:meta.fileType,

            icon:

                ChunkProtocol.getFileIcon(

                    meta.fileType

                ),

            totalChunks:

                meta.totalChunks,

            uploadedChunks:0,

            uploadedBytes:0,

            progress:0,

            speed:0,

            eta:0,

            retry:0,

            status:

                ChunkProtocol.STATUS.WAITING,

            paused:false,

            cancelled:false,

            completed:false,

            createdAt:meta.createdAt

        };

    },



    // ==========================
    // File Name
    // ==========================

    getName(upload){

        return upload.name;

    },



    // ==========================
    // File Size
    // ==========================

    getSize(upload){

        return ChunkProtocol.formatSize(

            upload.size

        );

    },



    // ==========================
    // MIME
    // ==========================

    getMime(upload){

        return upload.mime;

    },



    // ==========================
    // File Type
    // ==========================

    getType(upload){

        return upload.type;

    },



    // ==========================
    // File Icon
    // ==========================

    getIcon(upload){

        return upload.icon;

    },



    // ==========================
    // Object URL
    // ==========================

    createObjectURL(file){

        return URL.createObjectURL(file);

    },



    // ==========================
    // Revoke Object URL
    // ==========================

    revokeObjectURL(url){

        if(url){

            URL.revokeObjectURL(url);

        }

    },



    // ==========================
    // Readable Time
    // ==========================

    readableTime(){

        const d=new Date();

        let h=d.getHours();

        const m=d.getMinutes()

            .toString()

            .padStart(2,"0");

        const ampm=

            h>=12

            ?"PM"

            :"AM";

        h=h%12||12;

        return`${h}:${m} ${ampm}`;

    },

    // ==========================
    // Progress
    // ==========================

    updateProgress(upload){

        upload.progress=

            ChunkProtocol.calculateProgress(

                upload.uploadedChunks,

                upload.totalChunks

            );

        return upload.progress;

    },



    // ==========================
    // Uploaded Bytes
    // ==========================

    updateUploadedBytes(

        upload,

        bytes

    ){

        upload.uploadedBytes+=bytes;

    },



    // ==========================
    // Upload Speed
    // ==========================

    updateSpeed(

        upload,

        elapsedMs

    ){

        upload.speed=

            ChunkProtocol.calculateSpeed(

                upload.uploadedBytes,

                elapsedMs

            );

    },



    // ==========================
    // ETA
    // ==========================

    updateETA(upload){

        const remain=

            ChunkProtocol.remainingBytes(

                upload.uploadedChunks,

                upload.totalChunks,

                upload.size

            );

        upload.eta=

            ChunkProtocol.calculateETA(

                remain,

                upload.speed

            );

    },



    // ==========================
    // Next Chunk
    // ==========================

    nextChunk(upload){

        upload.uploadedChunks++;

        this.updateProgress(upload);

    },



    // ==========================
    // Retry
    // ==========================

    increaseRetry(upload){

        upload.retry++;

    },



    // ==========================
    // Reset Retry
    // ==========================

    resetRetry(upload){

        upload.retry=0;

    },



    // ==========================
    // Pause
    // ==========================

    pause(upload){

        upload.paused=true;

        upload.status=

            ChunkProtocol.STATUS.PAUSED;

    },



    // ==========================
    // Resume
    // ==========================

    resume(upload){

        upload.paused=false;

        upload.status=

            ChunkProtocol.STATUS.UPLOADING;

    },



    // ==========================
    // Cancel
    // ==========================

    cancel(upload){

        upload.cancelled=true;

        upload.status=

            ChunkProtocol.STATUS.CANCELLED;

    },



    // ==========================
    // Complete
    // ==========================

    complete(upload){

        upload.completed=true;

        upload.progress=100;

        upload.status=

            ChunkProtocol.STATUS.COMPLETED;

    },



    // ==========================
    // Fail
    // ==========================

    fail(upload){

        upload.status=

            ChunkProtocol.STATUS.FAILED;

    },

    // ==========================
    // Reset Upload
    // ==========================

    reset(upload){

        upload.uploadedChunks=0;

        upload.uploadedBytes=0;

        upload.progress=0;

        upload.speed=0;

        upload.eta=0;

        upload.retry=0;

        upload.paused=false;

        upload.cancelled=false;

        upload.completed=false;

        upload.status=

            ChunkProtocol.STATUS.WAITING;

        return upload;

    },



    // ==========================
    // Clone Upload
    // ==========================

    clone(upload){

        return{

            ...upload

        };

    },



    // ==========================
    // File Validation
    // ==========================

    validate(upload){

        if(!upload)

            return false;

        if(!upload.file)

            return false;

        if(upload.size<=0)

            return false;

        return true;

    },



    // ==========================
    // Can Retry
    // ==========================

    canRetry(upload){

        return(

            upload.retry<

            ChunkProtocol.MAX_RETRY

        );

    },



    // ==========================
    // Is Finished
    // ==========================

    isFinished(upload){

        return(

            upload.completed||

            upload.cancelled||

            upload.status===

            ChunkProtocol.STATUS.COMPLETED

        );

    },



    // ==========================
    // Is Active
    // ==========================

    isActive(upload){

        return(

            upload.status===

            ChunkProtocol.STATUS.UPLOADING

        );

    },



    // ==========================
    // Browser Support
    // ==========================

    supported(){

        return(

            ChunkProtocol.supported()

        );

    }

};

Object.freeze(

    MediaUtils

);

window.MediaUtils=

MediaUtils;
