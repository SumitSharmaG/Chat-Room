// ===========================================
// Secure Ultra Chat
// mediaUtils.js
// Common helper functions
// ===========================================

// ---------- UUID ----------

function generateMediaId() {

    if (window.crypto && crypto.randomUUID) {

        return crypto.randomUUID();

    }

    return (

        Date.now().toString(36)

        +

        Math.random()

        .toString(36)

        .substring(2, 10)

    );

}



// ---------- Format Size ----------

function formatFileSize(bytes) {

    if (!bytes || bytes <= 0)

        return "0 B";

    const units = [

        "B",

        "KB",

        "MB",

        "GB",

        "TB"

    ];

    const index = Math.floor(

        Math.log(bytes)

        /

        Math.log(1024)

    );

    return (

        (

            bytes /

            Math.pow(1024, index)

        )

        .toFixed(2)

        +

        " "

        +

        units[index]

    );

}



// ---------- Chunk Size ----------

// 256 KB

const CHUNK_SIZE =

256 * 1024;



// ---------- Total Chunks ----------

function getChunkCount(fileSize) {

    return Math.ceil(

        fileSize /

        CHUNK_SIZE

    );

}



// ---------- Delay ----------

function wait(ms) {

    return new Promise(resolve => {

        setTimeout(

            resolve,

            ms

        );

    });

}



// ---------- Mime Category ----------

function getFileCategory(type) {

    if (

        type.startsWith("image/")

    )

        return "image";



    if (

        type.startsWith("video/")

    )

        return "video";



    if (

        type.startsWith("audio/")

    )

        return "audio";



    return "document";

}



// ---------- File Icon ----------

function getFileIcon(type) {

    switch (type) {

        case "image":

            return "📷";



        case "video":

            return "🎥";



        case "audio":

            return "🎵";



        default:

            return "📄";

    }

}



// ---------- Safe File Name ----------

function sanitizeFileName(name) {

    return name

    .replace(

        /[<>:"/\\|?*]+/g,

        "_"

    )

    .trim();

}



// ---------- Progress ----------

function getUploadPercent(

    current,

    total

) {

    return Math.floor(

        (

            current /

            total

        )

        * 100

    );

}



// ---------- ArrayBuffer -> Base64 ----------

function arrayBufferToBase64(buffer) {

    let binary = "";

    const bytes =

        new Uint8Array(buffer);

    const len =

        bytes.byteLength;

    for (

        let i = 0;

        i < len;

        i++

    ) {

        binary +=

        String.fromCharCode(

            bytes[i]

        );

    }

    return btoa(binary);

}



// ---------- Base64 -> Blob ----------

function base64ToBlob(

    base64,

    mime

) {

    const byteChars =

        atob(base64);

    const bytes =

        new Uint8Array(

            byteChars.length

        );

    for (

        let i = 0;

        i < byteChars.length;

        i++

    ) {

        bytes[i] =

        byteChars.charCodeAt(i);

    }

    return new Blob(

        [bytes],

        {

            type: mime

        }

    );

}



// ---------- Download Blob ----------

function downloadBlob(

    blob,

    fileName

) {

    const url =

        URL.createObjectURL(blob);

    const a =

        document.createElement("a");

    a.href = url;

    a.download = fileName;

    a.click();

    URL.revokeObjectURL(url);

}



// ---------- Global ----------

window.MediaUtils = {

    CHUNK_SIZE,

    generateMediaId,

    formatFileSize,

    getChunkCount,

    wait,

    getFileCategory,

    getFileIcon,

    sanitizeFileName,

    getUploadPercent,

    arrayBufferToBase64,

    base64ToBlob,

    downloadBlob

};
