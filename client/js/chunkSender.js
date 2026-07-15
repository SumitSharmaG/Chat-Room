// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// chunkSender.js
// STEP 1 / 3
// ==========================================

"use strict";

const ChunkSender = {

    active:new Map(),



    // ==========================
    // Start Upload
    // ==========================

    async send(upload){

        if(!upload)

            return false;

        const valid=

            ChunkProtocol.validateFile(

                upload.file

            );

        if(!valid.ok){

            throw new Error(

                valid.message

            );

        }

        const chunks=

            ChunkProtocol.splitFile(

                upload.file

            );

        upload.chunks=chunks;

        upload.currentChunk=0;

        upload.totalChunks=

            chunks.length;

        upload.status=

            ChunkProtocol.STATUS.UPLOADING;

        this.active.set(

            upload.id,

            upload

        );

        return this.sendNext(upload);

    },



    // ==========================
    // Next Chunk
    // ==========================

    async sendNext(upload){

        if(

            upload.cancelled ||

            upload.completed

        ){

            return;

        }

        if(

            upload.currentChunk>=

            upload.totalChunks

        ){

            upload.completed=true;

            upload.status=

                ChunkProtocol.STATUS.COMPLETED;

            this.active.delete(

                upload.id

            );

            return;

        }

        const chunk=

            upload.chunks[

                upload.currentChunk

            ];

        return this.sendChunk(

            upload,

            chunk

        );

    },

    // ==========================
    // Send Chunk
    // ==========================

    async sendChunk(

        upload,

        chunk

    ){

        const buffer=

            await this.readChunk(

                chunk.blob

            );

        const packet=

            ChunkProtocol.createPacket(

                upload.meta,

                chunk

            );

        packet.chunkData=

            buffer;

        return this.emitChunk(

            upload,

            packet

        );

    },



    // ==========================
    // Read Chunk
    // ==========================

    readChunk(blob){

        return new Promise(

            (resolve,reject)=>{

                const reader=

                    new FileReader();

                reader.onload=

                    ()=>resolve(

                        reader.result

                    );

                reader.onerror=

                    reject;

                reader.readAsArrayBuffer(

                    blob

                );

            }

        );

    },



    // ==========================
    // Emit Chunk
    // ==========================

    emitChunk(

        upload,

        packet

    ){

        return new Promise(

            (resolve,reject)=>{

                if(

                    !window.socket

                ){

                    reject(

                        new Error(

                            "Socket Offline"

                        )

                    );

                    return;

                }

                socket.emit(

                    "uploadChunk",

                    packet,

                    (ack)=>{

                        if(

                            !ChunkProtocol

                            .validateAck(

                                ack

                            )

                        ){

                            reject(

                                new Error(

                                    "Invalid ACK"

                                )

                            );

                            return;

                        }

                        if(

                            ack.success

                        ){

                            upload.currentChunk++;

                            resolve(

                                this.sendNext(

                                    upload

                                )

                            );

                        }

                        else{

                            reject(

                                new Error(

                                    ack.message

                                )

                            );

                        }

                    }

                );

            }

        );

    },

    // ==========================
    // Retry
    // ==========================

    async retry(upload){

        if(

            !upload ||

            upload.retry>=

            ChunkProtocol.MAX_RETRY

        ){

            throw new Error(

                "Retry Limit Reached"

            );

        }

        upload.retry++;

        return this.sendNext(

            upload

        );

    },



    // ==========================
    // Pause
    // ==========================

    pause(id){

        const upload=

            this.active.get(id);

        if(!upload)

            return;

        upload.paused=true;

        upload.status=

            ChunkProtocol.STATUS.PAUSED;

    },



    // ==========================
    // Resume
    // ==========================

    resume(id){

        const upload=

            this.active.get(id);

        if(!upload)

            return;

        upload.paused=false;

        upload.status=

            ChunkProtocol.STATUS.UPLOADING;

        return this.sendNext(

            upload

        );

    },



    // ==========================
    // Cancel
    // ==========================

    cancel(id){

        const upload=

            this.active.get(id);

        if(!upload)

            return;

        upload.cancelled=true;

        upload.status=

            ChunkProtocol.STATUS.CANCELLED;

        this.active.delete(id);

    },



    // ==========================
    // Remove Upload
    // ==========================

    remove(id){

        this.active.delete(id);

    },



    // ==========================
    // Is Uploading
    // ==========================

    isUploading(id){

        return this.active.has(id);

    },



    // ==========================
    // Active Count
    // ==========================

    count(){

        return this.active.size;

    }

};

Object.freeze(

    ChunkSender

);

window.ChunkSender=

ChunkSender;
