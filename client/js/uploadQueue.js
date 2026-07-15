// ==========================================
// Secure Ultra Chat
// Version 4.0
// uploadQueue.js
// STEP 1 / 3
// ==========================================

"use strict";

const UploadQueue={

    queue:[],

    working:false,



    // ==========================
    // Add Upload
    // ==========================

    add(upload){

        if(!upload)

            return false;

        UploadState.add(

            upload

        );

        this.queue.push(

            upload.id

        );

        this.run();

        return true;

    },



    // ==========================
    // Run Queue
    // ==========================

    async run(){

        if(this.working)

            return;

        this.working=true;

        while(

            this.queue.length>0

        ){

            const id=

                this.queue[0];

            const upload=

                UploadState.get(id);

            if(!upload){

                this.queue.shift();

                continue;

            }

            await this.process(

                upload

            );

            this.queue.shift();

        }

        this.working=false;

    },



    // ==========================
    // Process Upload
    // ==========================

    async process(upload){

        if(

            upload.completed ||

            upload.cancelled

        ){

            return;

        }

        UploadState.setStatus(

            upload.id,

            ChunkProtocol.STATUS.UPLOADING

        );

        await ChunkSender.send(

            upload

        );

    },

    // ==========================
    // Remove Upload
    // ==========================

    remove(id){

        this.queue=

            this.queue.filter(

                item=>item!==id

            );

        UploadState.remove(id);

    },



    // ==========================
    // Clear Queue
    // ==========================

    clear(){

        this.queue.length=0;

        this.working=false;

        UploadState.clear();

    },



    // ==========================
    // Queue Size
    // ==========================

    size(){

        return this.queue.length;

    },



    // ==========================
    // Is Empty
    // ==========================

    isEmpty(){

        return this.queue.length===0;

    },



    // ==========================
    // Current Upload
    // ==========================

    current(){

        if(

            this.queue.length===0

        ){

            return null;

        }

        return UploadState.get(

            this.queue[0]

        );

    },



    // ==========================
    // Has Upload
    // ==========================

    has(id){

        return this.queue.includes(id);

    },



    // ==========================
    // Queue List
    // ==========================

    list(){

        return this.queue.map(

            id=>

                UploadState.get(id)

        ).filter(Boolean);

    },



    // ==========================
    // Waiting Uploads
    // ==========================

    waiting(){

        return this.list().filter(

            upload=>

                upload.status===

                ChunkProtocol.STATUS.WAITING

        );

    },



    // ==========================
    // Active Upload
    // ==========================

    active(){

        return this.list().find(

            upload=>

                upload.status===

                ChunkProtocol.STATUS.UPLOADING

        )||null;

    },

    // ==========================
    // Pause Upload
    // ==========================

    pause(id){

        UploadState.pause(id);

        ChunkSender.pause(id);

    },



    // ==========================
    // Resume Upload
    // ==========================

    resume(id){

        UploadState.resume(id);

        return ChunkSender.resume(id);

    },



    // ==========================
    // Cancel Upload
    // ==========================

    cancel(id){

        UploadState.cancel(id);

        ChunkSender.cancel(id);

        this.remove(id);

    },



    // ==========================
    // Retry Upload
    // ==========================

    async retry(id){

        const upload=

            UploadState.get(id);

        if(!upload)

            return false;

        UploadState.reset(id);

        if(!this.has(id)){

            this.queue.push(id);

        }

        this.run();

        return true;

    },



    // ==========================
    // Queue Statistics
    // ==========================

    stats(){

        return{

            total:this.size(),

            waiting:this.waiting().length,

            active:this.active()?1:0,

            completed:

                UploadState.completed()

                .length

        };

    },



    // ==========================
    // Is Working
    // ==========================

    isWorking(){

        return this.working;

    }

};

Object.freeze(

    UploadQueue

);

window.UploadQueue=

UploadQueue;
