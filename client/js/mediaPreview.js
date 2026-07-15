// ==========================================
// Secure Ultra Chat
// Media Preview
// Version 2.0 FINAL
// ==========================================

const MediaPreview = {

    create(upload){

        switch(upload.type){

            case "image":
                return this.image(upload);

            case "video":
                return this.video(upload);

            case "audio":
                return this.audio(upload);

            default:
                return this.document(upload);

        }

    },



    image(upload){

        return `
        <img
            src="${URL.createObjectURL(upload.file)}"
            class="preview-image"
            loading="lazy"
        >
        `;
    },



    video(upload){

        return `
        <video
            class="preview-video"
            controls
            preload="metadata"
        >
            <source
                src="${URL.createObjectURL(upload.file)}"
                type="${upload.mime}">
        </video>
        `;
    },



    audio(upload){

        return `
        <audio
            controls
            preload="metadata"
            class="preview-audio"
        >
            <source
                src="${URL.createObjectURL(upload.file)}"
                type="${upload.mime}">
        </audio>
        `;
    },



    document(upload){

        return `
        <div class="preview-document">

            <div class="preview-doc-icon">

                ${MediaUtils.getIcon(upload.type)}

            </div>

            <div class="preview-doc-info">

                <div class="preview-doc-name">

                    ${upload.name}

                </div>

                <div class="preview-doc-size">

                    ${MediaUtils.formatSize(upload.size)}

                </div>

            </div>

        </div>
        `;
    }

};

window.MediaPreview = MediaPreview;
