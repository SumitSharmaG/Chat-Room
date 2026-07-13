const DB_NAME = "SecureUltraChat";
const DB_VERSION = 1;
const STORE_NAME = "attachments";

let mediaDB = null;

// Open Database
function openMediaDB() {

    return new Promise((resolve, reject) => {

        if (mediaDB) {
            resolve(mediaDB);
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {

            const db = event.target.result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {

                db.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });

            }

        };

        request.onsuccess = (event) => {

            mediaDB = event.target.result;
            resolve(mediaDB);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}



// Save Media
async function saveMedia(media) {

    const db = await openMediaDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        const store =
            tx.objectStore(STORE_NAME);

        store.put(media);

        tx.oncomplete = () => resolve();

        tx.onerror = () => reject(tx.error);

    });

}



// Get All Media
async function getAllMedia() {

    const db = await openMediaDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const store =
            tx.objectStore(STORE_NAME);

        const request =
            store.getAll();

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}



// Delete One Media
async function deleteMedia(id) {

    const db = await openMediaDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        tx.objectStore(STORE_NAME)
            .delete(id);

        tx.oncomplete = () => resolve();

        tx.onerror = () => reject(tx.error);

    });

}



// Clear All Media
async function clearAllMedia() {

    const db = await openMediaDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_NAME,
                "readwrite"
            );

        tx.objectStore(STORE_NAME)
            .clear();

        tx.oncomplete = () => resolve();

        tx.onerror = () => reject(tx.error);

    });

}



// Get Single Media
async function getMedia(id) {

    const db = await openMediaDB();

    return new Promise((resolve, reject) => {

        const tx =
            db.transaction(
                STORE_NAME,
                "readonly"
            );

        const request =
            tx.objectStore(STORE_NAME)
            .get(id);

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

    }

// ================= EXTRA HELPERS =================

// Save attachment with auto id

async function saveAttachment(data) {

    data.id =
        data.id ||
        crypto.randomUUID();

    await saveMedia(data);

    return data.id;

}

// Restore all attachments

async function restoreAttachments() {

    const media =
        await getAllMedia();

    media.forEach(item => {

        if (
            typeof displayAttachment ===
            "function"
        ) {

            displayAttachment(item);

        }

    });

            }
