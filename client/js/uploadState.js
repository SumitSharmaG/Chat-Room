// ==========================================
// Secure Ultra Chat
// Upload State
// Version 2.0 FINAL
// ==========================================

const UploadState = {

    uploads: new Map(),

    add(upload){

        this.uploads.set(
            upload.id,
            upload
        );

    },

    get(id){

        return this.uploads.get(id);

    },

    has(id){

        return this.uploads.has(id);

    },

    remove(id){

        this.uploads.delete(id);

    },

    clear(){

        this.uploads.clear();

    },

    update(id,data){

        const upload=this.uploads.get(id);

        if(!upload) return;

        Object.assign(upload,data);

    },

    setProgress(id,current,total){

        const upload=this.uploads.get(id);

        if(!upload) return;

        upload.current=current;
        upload.total=total;

        upload.progress=
            ChunkProtocol.getPercent(
                current,
                total
            );

    },

    setStatus(id,status){

        const upload=this.uploads.get(id);

        if(!upload) return;

        upload.status=status;

    },

    all(){

        return Array.from(
            this.uploads.values()
        );

    }

};

window.UploadState=UploadState;
