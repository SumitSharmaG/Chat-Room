// ==========================================
// Secure Ultra Chat
// Version 4.0
// attachments.js
// STEP 1 / 3
// ==========================================

"use strict";

const Attachments={

    elements:{},



    // ==========================
    // Initialize
    // ==========================

    init(){

        this.elements={

            button:

                document.getElementById(

                    "attachBtn"

                ),

            menu:

                document.getElementById(

                    "attachMenu"

                ),

            camera:

                document.getElementById(

                    "cameraInput"

                ),

            gallery:

                document.getElementById(

                    "galleryInput"

                ),

            video:

                document.getElementById(

                    "videoInput"

                ),

            audio:

                document.getElementById(

                    "audioInput"

                ),

            document:

                document.getElementById(

                    "documentInput"

                )

        };

    },



    // ==========================
    // Open / Close Menu
    // ==========================

    toggleMenu(){

        this.elements.menu

        ?.classList.toggle(

            "show"

        );

    },



    closeMenu(){

        this.elements.menu

        ?.classList.remove(

            "show"

        );

    },



    // ==========================
    // Handle File
    // ==========================

    handleFile(file){

        if(!file)

            return;

        const upload=

            MediaUtils.createUpload(

                file,

                window.username||

                "Unknown",

                "world"

            );

        UploadUI.create(

            upload

        );

        UploadQueue.add(

            upload

        );

    },

    // ==========================
    // Button Events
    // ==========================

    bindButtons(){

        const e=this.elements;

        if(e.button){

            e.button.onclick=()=>

                this.toggleMenu();

        }

        document.addEventListener(

            "click",

            (event)=>{

                if(

                    !e.menu ||

                    !e.button

                ){

                    return;

                }

                if(

                    !e.menu.contains(

                        event.target

                    ) &&

                    event.target!==

                    e.button

                ){

                    this.closeMenu();

                }

            }

        );

    },



    // ==========================
    // Menu Events
    // ==========================

    bindMenu(){

        document

        .querySelectorAll(

            ".attach-item"

        )

        .forEach(item=>{

            item.onclick=()=>{

                this.closeMenu();

                switch(

                    item.dataset.type

                ){

                    case "camera":

                        this.elements

                        .camera.value="";

                        this.elements

                        .camera.click();

                        break;

                    case "gallery":

                        this.elements

                        .gallery.value="";

                        this.elements

                        .gallery.click();

                        break;

                    case "video":

                        this.elements

                        .video.value="";

                        this.elements

                        .video.click();

                        break;

                    case "audio":

                        this.elements

                        .audio.value="";

                        this.elements

                        .audio.click();

                        break;

                    case "document":

                        this.elements

                        .document.value="";

                        this.elements

                        .document.click();

                        break;

                }

            };

        });

    },



    // ==========================
    // Input Events
    // ==========================

    bindInputs(){

        [

            this.elements.camera,

            this.elements.gallery,

            this.elements.video,

            this.elements.audio,

            this.elements.document

        ].forEach(input=>{

            if(!input)

                return;

            input.onchange=()=>{

                this.handleFile(

                    input.files[0]

                );

            };

        });

    },

    // ==========================
    // Drag & Drop
    // ==========================

    bindDragDrop(){

        window.addEventListener(

            "dragover",

            (e)=>{

                e.preventDefault();

            }

        );

        window.addEventListener(

            "drop",

            (e)=>{

                e.preventDefault();

                const file=

                    e.dataTransfer

                    ?.files?.[0];

                if(file){

                    this.handleFile(

                        file

                    );

                }

            }

        );

    },



    // ==========================
    // Start
    // ==========================

    start(){

        this.init();

        this.bindButtons();

        this.bindMenu();

        this.bindInputs();

        this.bindDragDrop();

    }

};

Object.freeze(

    Attachments

);

window.Attachments=

Attachments;



// ==========================
// Auto Start
// ==========================

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        if(

            document.getElementById(

                "attachBtn"

            )

        ){

            Attachments.start();

        }

    }

);
