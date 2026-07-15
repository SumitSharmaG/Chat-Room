// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// uploadAck.js
// ==========================================

"use strict";

const ChunkProtocol = Object.freeze({

    ACK: "ack",

    COMPLETE: "complete",

    ERROR: "error"

});

function uploadAck({

    transferId,

    chunkIndex,

    success = true,

    message = "OK",

    retry = false

}){

    return{

        type: ChunkProtocol.ACK,

        transferId,

        chunkIndex,

        success,

        retry,

        message,

        serverTime: Date.now()

    };

}

function uploadComplete({

    transferId,

    totalChunks

}){

    return{

        type: ChunkProtocol.COMPLETE,

        transferId,

        totalChunks,

        success: true,

        serverTime: Date.now()

    };

}

function uploadError({

    transferId,

    chunkIndex,

    message = "Upload Failed"

}){

    return{

        type: ChunkProtocol.ERROR,

        transferId,

        chunkIndex,

        success: false,

        retry: true,

        message,

        serverTime: Date.now()

    };

}

module.exports = Object.freeze({

    uploadAck,

    uploadComplete,

    uploadError

});
