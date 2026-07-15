// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// uploadState.js
// DO NOT MODIFY
// ==========================================

const UploadState = {

    uploads: new Map(),

    // ================= ADD =================

    add(upload){

        this.uploads.set(

            upload.id,

            upload

        );

        return upload;

    },



    // ================= GET =================

    get(id){

        return this.uploads.get(id)||null;

    },



    has(id){

        return this.uploads.has(id);

    },



    all(){

        return Array.from(

            this.uploads.values()

        );

    },



    // ================= REMOVE =================

    remove(id){

        this.uploads.delete(id);

    },



    clear(){

        this.uploads.clear();

    },



    // ================= UPDATE =================

    update(id,data){

        const upload=

            this.get(id);

        if(!upload)

            return;

        Object.assign(

            upload,

            data

        );

    },



    // ================= STATUS =================

    setStatus(id,status){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.status=status;

    },



    // ================= PROGRESS =================

    setProgress(

        id,

        uploadedChunks,

        totalChunks

    ){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.uploadedChunks=

            uploadedChunks;

        upload.totalChunks=

            totalChunks;

        upload.progress=

            ChunkProtocol.getPercent(

                uploadedChunks,

                totalChunks

            );

    },



    // ================= SPEED =================

    setSpeed(

        id,

        bytesPerSecond

    ){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.speed=

            bytesPerSecond;

    },



    // ================= ETA =================

    setETA(

        id,

        eta

    ){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.eta=eta;

    },



    // ================= RETRY =================

    increaseRetry(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.retry++;

    },



    resetRetry(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.retry=0;

    },



    // ================= FLAGS =================

    pause(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.paused=true;

        upload.status=

            ChunkProtocol.STATUS.PAUSED;

    },



    resume(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.paused=false;

        upload.status=

            ChunkProtocol.STATUS.UPLOADING;

    },



    cancel(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.cancelled=true;

        upload.status=

            ChunkProtocol.STATUS.CANCELLED;

    },



    complete(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.completed=true;

        upload.progress=100;

        upload.status=

            ChunkProtocol.STATUS.COMPLETED;

    },



    fail(id){

        const upload=

            this.get(id);

        if(!upload)

            return;

        upload.status=

            ChunkProtocol.STATUS.FAILED;

    }

};

Object.freeze(UploadState);

window.UploadState=UploadState;
