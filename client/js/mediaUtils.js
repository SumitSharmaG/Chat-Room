// ==========================================
// Secure Ultra Chat
// Media Utils
// Version 2.0 FINAL
// ==========================================

const MediaUtils = {

    generateId(){

        if(window.crypto?.randomUUID){

            return crypto.randomUUID();

        }

        return Date.now().toString(36)
            + Math.random().toString(36).substring(2);

    },



    formatSize(bytes){

        if(bytes < 1024)
            return bytes + " B";

        if(bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + " KB";

        if(bytes < 1024 * 1024 * 1024)
            return (bytes / 1024 / 1024).toFixed(1) + " MB";

        return (bytes / 1024 / 1024 / 1024).toFixed(2) + " GB";

    },



    getType(file){

        if(file.type.startsWith("image/"))
            return "image";

        if(file.type.startsWith("video/"))
            return "video";

        if(file.type.startsWith("audio/"))
            return "audio";

        return "document";

    },



    getIcon(type){

        switch(type){

            case "image":
                return "🖼️";

            case "video":
                return "🎥";

            case "audio":
                return "🎵";

            default:
                return "📄";

        }

    },



    readableTime(){

        const d = new Date();

        let h = d.getHours();

        const m = d.getMinutes()
            .toString()
            .padStart(2,"0");

        const ampm =
            h >= 12 ? "PM" : "AM";

        h = h % 12 || 12;

        return `${h}:${m} ${ampm}`;

    },



    createUpload(file){

        return {

            id: this.generateId(),

            file,

            name: file.name,

            size: file.size,

            mime: file.type,

            type: this.getType(file),

            progress:0,

            uploaded:0,

            paused:false,

            cancelled:false,

            completed:false,

            time:this.readableTime()

        };

    }

};

window.MediaUtils = MediaUtils;
