// ==========================================
// Secure Ultra Chat
// Upload ACK
// Version 2.0 FINAL
// ==========================================

const uploads = new Map();

module.exports = {

    create(uploadId,totalChunks){

        uploads.set(uploadId,{

            total:totalChunks,

            received:0,

            completed:false,

            createdAt:Date.now()

        });

    },



    receive(uploadId){

        const upload=

            uploads.get(uploadId);

        if(!upload) return false;

        upload.received++;

        return upload.received>=upload.total;

    },



    progress(uploadId){

        const upload=

            uploads.get(uploadId);

        if(!upload) return 0;

        return Math.floor(

            (upload.received/upload.total)

            *100

        );

    },



    complete(uploadId){

        const upload=

            uploads.get(uploadId);

        if(upload)

            upload.completed=true;

    },



    remove(uploadId){

        uploads.delete(uploadId);

    },



    exists(uploadId){

        return uploads.has(uploadId);

    },



    get(uploadId){

        return uploads.get(uploadId);

    },



    cleanup(){

        const now=Date.now();

        for(

            const [id,data]

            of uploads

        ){

            if(

                now-data.createdAt>

                1000*60*30

            ){

                uploads.delete(id);

            }

        }

    }

};

setInterval(()=>{

    module.exports.cleanup();

},1000*60*5);
