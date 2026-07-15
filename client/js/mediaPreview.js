// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// mediaPreview.js
// PART 1 / 2
// ==========================================

"use strict";

const MediaPreview={

    // ==========================
    // Main Preview
    // ==========================

    create(upload){

        switch(upload.type){

            case ChunkProtocol.FILE.IMAGE:

                return this.image(upload);

            case ChunkProtocol.FILE.VIDEO:

                return this.video(upload);

            case ChunkProtocol.FILE.AUDIO:

                return this.audio(upload);

            default:

                return this.document(upload);

        }

    },



    // ==========================
    // Image Preview
    // ==========================

    image(upload){

        return`

<div class="media-preview image-preview">

<img
src="${MediaUtils.createPreviewURL(upload.file)}"
alt="${upload.name}"
class="preview-image"
loading="lazy"
draggable="false"
>

</div>

`;

    },



    // ==========================
    // Video Preview
    // ==========================

    video(upload){

        return`

<div class="media-preview video-preview">

<video
class="preview-video"
controls
preload="metadata"
>

<source
src="${MediaUtils.createPreviewURL(upload.file)}"
type="${upload.mime}"
>

</video>

</div>

`;

    },



    // ==========================
    // Audio Preview
    // ==========================

    audio(upload){

        return`

<div class="media-preview audio-preview">

<audio
controls
preload="metadata"
class="preview-audio"
>

<source
src="${MediaUtils.createPreviewURL(upload.file)}"
type="${upload.mime}"
>

</audio>

</div>

`;

    },

    // ==========================
    // Document Preview
    // ==========================

    document(upload){

        return`

<div class="media-preview document-preview">

<div class="preview-document-icon">

${upload.icon}

</div>

<div class="preview-document-info">

<div class="preview-document-name">

${upload.name}

</div>

<div class="preview-document-size">

${ChunkProtocol.formatSize(upload.size)}

</div>

</div>

</div>

`;

    },



    // ==========================
    // Preview Card
    // ==========================

    createCard(upload){

        return`

<div class="attachment-card">

${this.create(upload)}

<div class="attachment-footer">

<div class="attachment-name">

${upload.name}

</div>

<div class="attachment-meta">

${ChunkProtocol.formatSize(upload.size)}

&nbsp;•&nbsp;

${upload.type}

</div>

</div>

</div>

`;

    },



    // ==========================
    // Download Button
    // ==========================

    downloadButton(upload){

        return`

<button

class="attachment-download"

data-transfer-id="${upload.transferId}"

title="Download"

>

⬇

</button>

`;

    },



    // ==========================
    // Remove Preview URL
    // ==========================

    destroy(url){

        MediaUtils.revokePreviewURL(

            url

        );

    },



    // ==========================
    // Supported
    // ==========================

    supported(){

        return(

            typeof URL!=="undefined" &&

            typeof URL.createObjectURL==="function"

        );

    }

};

Object.freeze(

    MediaPreview

);

window.MediaPreview=

MediaPreview;
