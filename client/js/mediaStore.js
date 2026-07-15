// ==========================================
// Secure Ultra Chat
// Media Store
// IndexedDB Final
// Version 2.0
// ==========================================

const DB_NAME = "SecureUltraChat";
const DB_VERSION = 2;
const STORE_NAME = "attachments";

let mediaDB = null;

// ---------------- OPEN DB ----------------

async function openMediaDB(){

    if(mediaDB) return mediaDB;

    return new Promise((resolve,reject)=>{

        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

        request.onupgradeneeded = e=>{

            const db=e.target.result;

            if(
                !db.objectStoreNames.contains(
                    STORE_NAME
                )
            ){

                const store =
                    db.createObjectStore(
                        STORE_NAME,
                        {
                            keyPath:"id"
                        }
                    );

                store.createIndex(
                    "time",
                    "time"
                );

            }

        };

        request.onsuccess=e=>{

            mediaDB=e.target.result;

            resolve(mediaDB);

        };

        request.onerror=()=>{

            reject(request.error);

        };

    });

}



// ---------------- SAVE ----------------

async function saveAttachment(item){

    const db =
        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const tx =
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



// ---------------- GET ----------------

async function getAttachment(id){

    const db =
        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const req =
        db.transaction(
            STORE_NAME,
            "readonly"
        )
        .objectStore(STORE_NAME)
        .get(id);

        req.onsuccess=
        ()=>resolve(req.result);

        req.onerror=
        ()=>reject();

    });

}



// ---------------- GET ALL ----------------

async function getAllAttachments(){

    const db =
        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const req =
        db.transaction(
            STORE_NAME,
            "readonly"
        )
        .objectStore(STORE_NAME)
        .getAll();

        req.onsuccess=
        ()=>resolve(req.result);

        req.onerror=
        ()=>reject();

    });

}



// ---------------- EXISTS ----------------

async function attachmentExists(id){

    const data =
        await getAttachment(id);

    return !!data;

}



// ---------------- DELETE ----------------

async function deleteAttachment(id){

    const db =
        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const tx =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );

        tx.objectStore(STORE_NAME)
        .delete(id);

        tx.oncomplete=
        ()=>resolve();

        tx.onerror=
        ()=>reject();

    });

}



// ---------------- CLEAR ----------------

async function clearAllMedia(){

    const db =
        await openMediaDB();

    return new Promise((resolve,reject)=>{

        const tx =
        db.transaction(
            STORE_NAME,
            "readwrite"
        );

        tx.objectStore(STORE_NAME)
        .clear();

        tx.oncomplete=
        ()=>resolve();

        tx.onerror=
        ()=>reject();

    });

}



// ---------------- RESTORE ----------------

async function restoreAttachments(){

    if(
        typeof displayAttachment!=="function"
    ) return;

    const items =
        await getAllAttachments();

    const rendered =
        new Set();

    items.forEach(item=>{

        if(
            rendered.has(item.id)
        ) return;

        rendered.add(item.id);

        displayAttachment(
            item,
            true
        );

    });

}



// ---------------- EXPORT ----------------

window.saveAttachment =
    saveAttachment;

window.getAttachment =
    getAttachment;

window.getAllAttachments =
    getAllAttachments;

window.deleteAttachment =
    deleteAttachment;

window.clearAllMedia =
    clearAllMedia;

window.restoreAttachments =
    restoreAttachments;

window.attachmentExists =
    attachmentExists;
