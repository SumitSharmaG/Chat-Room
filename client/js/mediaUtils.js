// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// mediaUtils.js
// DO NOT MODIFY
// ==========================================

const MediaUtils = {

    // ================= ID =================

    generateId(){

        return ChunkProtocol.createTransferId();

    },



    // ================= FILE TYPE =================

    getType(file){

        return ChunkProtocol.getFileType(

            file.type

        );

    },



    // ================= ICON =================

    getIcon(type){

        return ChunkProtocol.getIcon(type);

    },



    // ================= SIZE =================

    formatSize(bytes){

        return ChunkProtocol.formatSize(bytes);

    },



    // ================= TIME =================

    readableTime(){

        const now=new Date();

        let h=now.getHours();

        const m=now.getMinutes()

            .toString()

            .padStart(2,"0");

        const s=now.getSeconds()

            .toString()

            .padStart(2,"0");

        const ampm=

            h>=12

            ?"PM"

            :"AM";

        h=h%12||12;

        return `${h}:${m}:${s} ${ampm}`;

    },



    // ================= VALIDATE =================

    validate(file){

        return ChunkProtocol.validate(file);

    },



    // ================= MIME =================

    getMime(file){

        return file.type ||

            "application/octet-stream";

    },



    // ================= EXTENSION =================

    getExtension(fileName){

        const dot=

            fileName.lastIndexOf(".");

        if(dot===-1)

            return "";

        return fileName

            .substring(dot+1)

            .toLowerCase();

    },



    // ================= PREVIEW =================

    createPreviewURL(file){

        return URL.createObjectURL(file);

    },



    revokePreviewURL(url){

        if(url){

            URL.revokeObjectURL(url);

        }

    },



    // ================= CREATE UPLOAD =================

    createUpload(file){

        const validation=

            this.validate(file);

        if(!validation.ok){

            throw new Error(

                validation.message

            );

        }

        const upload={

            id:

                this.generateId(),

            file:

                file,

            name:

                file.name,

            size:

                file.size,

            mime:

                this.getMime(file),

            extension:

                this.getExtension(

                    file.name

                ),

            type:

                this.getType(file),

            icon:

                this.getIcon(

                    this.getType(file)

                ),

            progress:0,

            uploadedChunks:0,

            totalChunks:

                ChunkProtocol.getChunkCount(

                    file.size

                ),

            retry:0,

            speed:0,

            eta:"--",

            paused:false,

            cancelled:false,

            completed:false,

            status:

                ChunkProtocol.STATUS.WAITING,

            createdAt:

                Date.now(),

            time:

                this.readableTime()

        };

        return upload;

    }

};

Object.freeze(MediaUtils);

window.MediaUtils=MediaUtils;
