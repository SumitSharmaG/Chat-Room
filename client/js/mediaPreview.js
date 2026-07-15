// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// mediaPreview.js
// DO NOT MODIFY
// ==========================================

const MediaPreview = {

    // ================= CREATE =================

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



    // ================= IMAGE =================

    image(upload){

        return `

<img
src="${upload.previewURL}"
class="preview-image"
loading="lazy"
draggable="false"
>

`;

    },



    // ================= VIDEO =================

    video(upload){

        return `

<video
class="preview-video"
controls
preload="metadata"
>

<source
src="${upload.previewURL}"
type="${upload.mime}">

</video>

`;

    },



    // ================= AUDIO =================

    audio(upload){

        return `

<audio
controls
preload="metadata"
class="preview-audio"
>

<source
src="${upload.previewURL}"
type="${upload.mime}">

</audio>

`;

    },



    // ================= DOCUMENT =================

    document(upload){

        return `

<div class="preview-document">

<div class="preview-doc-icon">

${upload.icon}

</div>

<div class="preview-doc-body">

<div class="preview-doc-name">

${upload.name}

</div>

<div class="preview-doc-size">

${MediaUtils.formatSize(upload.size)}

</div>

</div>

</div>

`;

    },



    // ================= CLEANUP =================

    destroy(upload){

        if(

            upload &&

            upload.previewURL

        ){

            URL.revokeObjectURL(

                upload.previewURL

            );

        }

    }

};

Object.freeze(MediaPreview);

window.MediaPreview=MediaPreview;
