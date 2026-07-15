// ==========================================
// Secure Ultra Chat
// Upload Queue
// Version 2.0 FINAL
// ==========================================

const UploadQueue = {

    queue: [],

    working: false,



    add(upload){

        UploadState.add(upload);

        UploadUI.create(upload);

        this.queue.push(upload);

        this.run();

    },



    async run(){

        if(this.working) return;

        this.working = true;

        while(this.queue.length){

            const upload = this.queue[0];

            if(upload.cancelled){

                this.queue.shift();

                continue;

            }

            UploadState.setStatus(
                upload.id,
                "uploading"
            );

            await this.process(upload);

            this.queue.shift();

        }

        this.working = false;

    },



    async process(upload){

        const chunks =
            ChunkProtocol.split(
                upload.file
            );

        for(

            let i=0;

            i<chunks.length;

            i++

        ){

            while(upload.paused){

                await new Promise(r=>
                    setTimeout(r,200)
                );
            }

            if(upload.cancelled){

                return;
            }

            await window.sendChunk(

                upload,

                chunks[i],

                i,

                chunks.length

            );

            UploadState.setProgress(

                upload.id,

                i+1,

                chunks.length

            );

            UploadUI.update(

                upload.id,

                UploadState.get(upload.id)
                .progress

            );

        }

        UploadState.setStatus(

            upload.id,

            "completed"

        );

        UploadUI.complete(

            upload.id

        );

    },



    pause(id){

        const upload =
            UploadState.get(id);

        if(!upload) return;

        upload.paused = true;

        UploadUI.pause(id);

    },



    resume(id){

        const upload =
            UploadState.get(id);

        if(!upload) return;

        upload.paused = false;

        UploadUI.resume(id);

    },



    cancel(id){

        const upload =
            UploadState.get(id);

        if(!upload) return;

        upload.cancelled = true;

        UploadState.remove(id);

        UploadUI.complete(id);

    }

};

window.UploadQueue = UploadQueue;
