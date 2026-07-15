// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// uploadState.js
// PART 1 / 3
// ==========================================

"use strict";

const UploadState = {

    uploads:new Map(),



    // ==========================
    // Add Upload
    // ==========================

    add(upload){

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
    // Clear All
    // ==========================

    clear(){

        this.uploads.clear();

    },



    // ==========================
    // Count
    // ==========================

    count(){

        return this.uploads.size;

    },



    // ==========================
    // All Uploads
    // ==========================

    all(){

        return Array.from(

            this.uploads.values()

        );

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

        MediaUtils.updateProgress(

            upload

        );

        return true;

    },



    // ==========================
    // Update Uploaded Bytes
    // ==========================

    setUploadedBytes(

        id,

        bytes

    ){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.updateUploadedBytes(

            upload,

            bytes

        );

        return true;

    },



    // ==========================
    // Update Speed
    // ==========================

    setSpeed(

        id,

        elapsedMs

    ){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.updateSpeed(

            upload,

            elapsedMs

        );

        return true;

    },



    // ==========================
    // Update ETA
    // ==========================

    setETA(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.updateETA(

            upload

        );

        return true;

    },



    // ==========================
    // Increase Retry
    // ==========================

    retry(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.increaseRetry(

            upload

        );

        return true;

    },



    // ==========================
    // Reset Retry
    // ==========================

    resetRetry(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.resetRetry(

            upload

        );

        return true;

    },



    // ==========================
    // Pause Upload
    // ==========================

    pause(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.pause(

            upload

        );

        return true;

    },



    // ==========================
    // Resume Upload
    // ==========================

    resume(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.resume(

            upload

        );

        return true;

    },



    // ==========================
    // Cancel Upload
    // ==========================

    cancel(id){

        const upload=

            this.get(id);

        if(!upload)

            return false;

        MediaUtils.cancel(

            upload

        );

        return true;

    },

    // ==========================
    // Complete Upload
    // ==========================

    complete(id){

        const upload=this.get(id);

        if(!upload)
            return false;

        MediaUtils.complete(upload);

        return true;

    },



    // ==========================
    // Fail Upload
    // ==========================

    fail(id){

        const upload=this.get(id);

        if(!upload)
            return false;

        MediaUtils.fail(upload);

        return true;

    },



    // ==========================
    // Reset Upload
    // ==========================

    reset(id){

        const upload=this.get(id);

        if(!upload)
            return false;

        MediaUtils.reset(upload);

        return true;

    },



    // ==========================
    // Clone Upload
    // ==========================

    clone(id){

        const upload=this.get(id);

        if(!upload)
            return null;

        return MediaUtils.clone(upload);

    },



    // ==========================
    // Queue Statistics
    // ==========================

    stats(){

        const uploads=this.all();

        return{

            total:uploads.length,

            waiting:this.waiting().length,

            active:this.active().length,

            completed:this.completed().length,

            failed:uploads.filter(

                upload=>

                    upload.status===

                    ChunkProtocol.STATUS.FAILED

            ).length,

            paused:uploads.filter(

                upload=>

                    upload.status===

                    ChunkProtocol.STATUS.PAUSED

            ).length,

            cancelled:uploads.filter(

                upload=>

                    upload.status===

                    ChunkProtocol.STATUS.CANCELLED

            ).length

        };

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
