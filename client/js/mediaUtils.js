// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// mediaUtils.js
// PART 1 / 2
// ==========================================

"use strict";

const MediaUtils={

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
    // File Information
    // ==========================

    getName(upload){

        return upload.name;

    },



    getSize(upload){

        return ChunkProtocol.formatSize(

            upload.size

        );

    },



    getMime(upload){

        return upload.mime;

    },



    getType(upload){

        return upload.type;

    },



    getIcon(upload){

        return upload.icon;

    },



    // ==========================
    // Preview URL
    // ==========================

    createPreviewURL(file){

        return URL.createObjectURL(file);

    },



    revokePreviewURL(url){

        if(url){

            URL.revokeObjectURL(url);

        }

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



    updateUploadedBytes(

        upload,

        bytes

    ){

        upload.uploadedBytes+=bytes;

    },



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



    updateETA(upload){

        const remaining=

            Math.max(

                upload.size-

                upload.uploadedBytes,

                0

            );

        upload.eta=

            ChunkProtocol.calculateETA(

                remaining,

                upload.speed

            );

    },

    // ==========================
    // Next Chunk
    // ==========================

    nextChunk(upload){

        upload.uploadedChunks++;

        this.updateProgress(upload);

        return upload.uploadedChunks;

    },



    // ==========================
    // Retry
    // ==========================

    increaseRetry(upload){

        upload.retry++;

        return upload.retry;

    },



    resetRetry(upload){

        upload.retry=0;

    },



    // ==========================
    // Upload Status
    // ==========================

    pause(upload){

        upload.paused=true;

        upload.status=

            ChunkProtocol.STATUS.PAUSED;

    },



    resume(upload){

        upload.paused=false;

        upload.status=

            ChunkProtocol.STATUS.UPLOADING;

    },



    complete(upload){

        upload.completed=true;

        upload.progress=100;

        upload.status=

            ChunkProtocol.STATUS.COMPLETED;

    },



    fail(upload){

        upload.status=

            ChunkProtocol.STATUS.FAILED;

    },



    cancel(upload){

        upload.cancelled=true;

        upload.status=

            ChunkProtocol.STATUS.CANCELLED;

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
    // Validation
    // ==========================

    validate(upload){

        return(

            upload &&

            upload.file instanceof File &&

            upload.size>0

        );

    },



    canRetry(upload){

        return(

            upload.retry<

            ChunkProtocol.MAX_RETRY

        );

    },



    isFinished(upload){

        return(

            upload.completed||

            upload.cancelled

        );

    },



    isUploading(upload){

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
