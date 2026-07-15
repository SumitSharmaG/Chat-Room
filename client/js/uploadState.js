// ==========================================
// Secure Ultra Chat
// Version 4.0
// uploadState.js
// STEP 1 / 3
// ==========================================

"use strict";

const UploadState={

    uploads:new Map(),



    // ==========================
    // Add Upload
    // ==========================

    add(upload){

        if(!upload)

            return false;

        this.uploads.set(

            upload.id,

            upload

        );

        return upload;

    },



    // ==========================
    // Get Upload
    // ==========================

    get(id){

        return this.uploads.get(id);

    },



    // ==========================
    // Has Upload
    // ==========================

    has(id){

        return this.uploads.has(id);

    },



    // ==========================
    // Remove Upload
    // ==========================

    remove(id){

        return this.uploads.delete(id);

    },



    // ==========================
    // Clear
    // ==========================

    clear(){

        this.uploads.clear();

    },



    // ==========================
    // Get All
    // ==========================

    all(){

        return Array.from(

            this.uploads.values()

        );

    },



    // ==========================
    // Total Uploads
    // ==========================

    count(){

        return this.uploads.size;

    },



    // ==========================
    // Waiting Uploads
    // ==========================

    waiting(){

        return this.all().filter(

            upload=>

                upload.status===

                ChunkProtocol.STATUS.WAITING

        );

    },



    // ==========================
    // Active Uploads
    // ==========================

    active(){

        return this.all().filter(

            upload=>

                upload.status===

                ChunkProtocol.STATUS.UPLOADING

        );

    },



    // ==========================
    // Completed Uploads
    // ==========================

    completed(){

        return this.all().filter(

            upload=>

                upload.status===

                ChunkProtocol.STATUS.COMPLETED

        );

    },

    // ==========================
    // Update Status
    // ==========================

    setStatus(

        id,

        status

    ){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.status=status;

        return true;

    },



    // ==========================
    // Update Progress
    // ==========================

    setProgress(

        id,

        uploadedChunks

    ){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.uploadedChunks=

            uploadedChunks;

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

    setUploadedBytes(

        id,

        bytes

    ){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.uploadedBytes=

            bytes;

        return upload.uploadedBytes;

    },



    // ==========================
    // Upload Speed
    // ==========================

    setSpeed(

        id,

        elapsedMs

    ){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.speed=

            ChunkProtocol.calculateSpeed(

                upload.uploadedBytes,

                elapsedMs

            );

        return upload.speed;

    },



    // ==========================
    // ETA
    // ==========================

    setETA(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

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

        return upload.eta;

    },



    // ==========================
    // Retry Count
    // ==========================

    increaseRetry(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.retry++;

        return upload.retry;

    },



    // ==========================
    // Reset Retry
    // ==========================

    resetRetry(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.retry=0;

        return true;

    },



    // ==========================
    // Pause
    // ==========================

    pause(id){

        return this.setStatus(

            id,

            ChunkProtocol.STATUS.PAUSED

        );

    },



    // ==========================
    // Resume
    // ==========================

    resume(id){

        return this.setStatus(

            id,

            ChunkProtocol.STATUS.UPLOADING

        );

    },



    // ==========================
    // Cancel
    // ==========================

    cancel(id){

        return this.setStatus(

            id,

            ChunkProtocol.STATUS.CANCELLED

        );

    },

    // ==========================
    // Complete Upload
    // ==========================

    complete(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.progress=100;

        upload.completed=true;

        upload.status=

            ChunkProtocol.STATUS.COMPLETED;

        return true;

    },



    // ==========================
    // Upload Failed
    // ==========================

    fail(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.status=

            ChunkProtocol.STATUS.FAILED;

        return true;

    },



    // ==========================
    // Reset Upload
    // ==========================

    reset(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        upload.progress=0;

        upload.uploadedChunks=0;

        upload.uploadedBytes=0;

        upload.retry=0;

        upload.speed=0;

        upload.eta=0;

        upload.completed=false;

        upload.cancelled=false;

        upload.paused=false;

        upload.status=

            ChunkProtocol.STATUS.WAITING;

        return upload;

    },



    // ==========================
    // Statistics
    // ==========================

    stats(){

        return{

            total:this.count(),

            waiting:this.waiting().length,

            active:this.active().length,

            completed:this.completed().length

        };

    },



    // ==========================
    // Finished
    // ==========================

    finished(){

        return this.all().filter(

            upload=>

                upload.completed ||

                upload.status===

                ChunkProtocol.STATUS.FAILED ||

                upload.status===

                ChunkProtocol.STATUS.CANCELLED

        );

    },



    // ==========================
    // Is Empty
    // ==========================

    isEmpty(){

        return this.uploads.size===0;

    }

};

Object.freeze(

    UploadState

);

window.UploadState=

UploadState;
