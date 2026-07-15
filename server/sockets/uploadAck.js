// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// uploadAck.js
// ==========================================

"use strict";

// ==========================
// ACK Packet
// ==========================

function createAck(

    transferId,

    chunkIndex,

    success=true,

    message="OK",

    retry=false

){

    return{

        type:"ack",

        transferId,

        chunkIndex,

        success,

        retry,

        message,

        serverTime:Date.now()

    };

}



// ==========================
// Upload Complete Packet
// ==========================

function createComplete(

    transferId,

    totalChunks

){

    return{

        type:"complete",

        transferId,

        totalChunks,

        success:true,

        serverTime:Date.now()

    };

}



// ==========================
// Upload Error Packet
// ==========================

function createError(

    transferId,

    chunkIndex,

    message="Upload Failed"

){

    return{

        type:"error",

        transferId,

        chunkIndex,

        success:false,

        retry:true,

        message,

        serverTime:Date.now()

    };

}



// ==========================
// Packet Validator
// ==========================

function validateAck(packet){

    return(

        packet &&

        typeof packet==="object" &&

        typeof packet.transferId==="string" &&

        Number.isInteger(packet.chunkIndex) &&

        typeof packet.success==="boolean"

    );

}



// ==========================
// Export
// ==========================

module.exports=Object.freeze({

    createAck,

    createComplete,

    createError,

    validateAck

});
