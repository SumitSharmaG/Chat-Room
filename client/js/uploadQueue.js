// ==========================================
// Upload Queue
// ==========================================

const UploadQueue = {

    queue: [],

    uploading: false,

    add(file){

        this.queue.push(file);

        this.next();

    },

    async next(){

        if(this.uploading) return;

        if(this.queue.length===0) return;

        this.uploading=true;

        const file=this.queue.shift();

        try{

            await ChunkSender.send(file);

        }catch(err){

            console.error(err);

        }

        this.uploading=false;

        this.next();

    }

};

window.UploadQueue=UploadQueue;
