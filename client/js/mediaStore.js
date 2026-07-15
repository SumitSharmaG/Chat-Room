// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// mediaStore.js
// DO NOT MODIFY
// ==========================================

const DB_NAME = "SecureUltraChat";
const DB_VERSION = 3;
const STORE_NAME = "attachments";

let mediaDB = null;

// Prevent duplicate rendering
const renderedAttachments = new Set();



// ================= OPEN =================

async function openMediaDB(){

    if(mediaDB) return mediaDB;

    return new Promise((resolve,reject)=>{

        const request = indexedDB.open(

            DB_NAME,

            DB_VERSION

        );

        request.onupgradeneeded=(e)=>{

            const db=e.target.result;

            let store;

            if(

                !db.objectStoreNames.contains(

                    STORE_NAME

                )

            ){

                store=db.createObjectStore(

                    STORE_NAME,

                    {

                        keyPath:"id"

                    }

                );

            }else{

                store=e.target.transaction.objectStore(

                    STORE_NAME

                );

            }

            if(

                !store.indexNames.contains(

                    "time"

                )

            ){

                store.createIndex(

                    "time",

                    "time"

                );

            }

        };

        request.onsuccess=(e)=>{

            mediaDB=e.target.result;

            resolve(mediaDB);

        };

        request.onerror=()=>{

            reject(request.error);

        };

    });

}



// ================= EXISTS =================

async function attachmentExists(id){

    const db=await openMediaDB();

    return new Promise((resolve)=>{

        const req=

        db.transaction(

            STORE_NAME,

            "readonly"

        )

        .objectStore(STORE_NAME)

        .get(id);

        req.onsuccess=()=>{

            resolve(

                !!req.result

            );

        };

        req.onerror=()=>{

            resolve(false);

        };

    });

}



// ================= SAVE =================

async function saveAttachment(item){

    if(

        await attachmentExists(

            item.id

        )

    ){

        return;

    }

    const db=

        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const tx=

        db.transaction(

            STORE_NAME,

            "readwrite"

        );

        tx.objectStore(STORE_NAME)

        .put(item);

        tx.oncomplete=()=>resolve();

        tx.onerror=()=>reject();

    });

}



// ================= GET =================

async function getAttachment(id){

    const db=

        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const req=

        db.transaction(

            STORE_NAME,

            "readonly"

        )

        .objectStore(STORE_NAME)

        .get(id);

        req.onsuccess=()=>

            resolve(req.result);

        req.onerror=()=>

            reject();

    });

}



// ================= GET ALL =================

async function getAllAttachments(){

    const db=

        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const req=

        db.transaction(

            STORE_NAME,

            "readonly"

        )

        .objectStore(STORE_NAME)

        .getAll();

        req.onsuccess=()=>

            resolve(req.result);

        req.onerror=()=>

            reject();

    });

}



// ================= DELETE =================

async function deleteAttachment(id){

    renderedAttachments.delete(id);

    const db=

        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const tx=

        db.transaction(

            STORE_NAME,

            "readwrite"

        );

        tx.objectStore(STORE_NAME)

        .delete(id);

        tx.oncomplete=()=>resolve();

        tx.onerror=()=>reject();

    });

}



// ================= CLEAR =================

async function clearAllMedia(){

    renderedAttachments.clear();

    const db=

        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const tx=

        db.transaction(

            STORE_NAME,

            "readwrite"

        );

        tx.objectStore(STORE_NAME)

        .clear();

        tx.oncomplete=()=>resolve();

        tx.onerror=()=>reject();

    });

}



// ================= RESTORE =================

async function restoreAttachments(){

    if(

        typeof displayAttachment!

        =="function"

    ) return;

    const items=

        await getAllAttachments();

    for(

        const item of items

    ){

        if(

            renderedAttachments.has(

                item.id

            )

        ){

            continue;

        }

        if(

            document.querySelector(

                `[data-attachment-id="${item.id}"]`

            )

        ){

            renderedAttachments.add(

                item.id

            );

            continue;

        }

        renderedAttachments.add(

            item.id

        );

        displayAttachment(

            item,

            true

        );

    }

}



// ================= EXPORT =================

window.openMediaDB=openMediaDB;

window.saveAttachment=saveAttachment;

window.getAttachment=getAttachment;

window.getAllAttachments=getAllAttachments;

window.deleteAttachment=deleteAttachment;

window.clearAllMedia=clearAllMedia;

window.restoreAttachments=restoreAttachments;

window.attachmentExists=attachmentExists;
