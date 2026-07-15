// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// Version 4.0
// chunkReceiver.js
// PART 1 / 2
// ==========================================

"use strict";

const {

    createAck,

    createComplete,

    createError

}=require("./uploadAck");

module.exports=function(io,socket){

    socket.on(

        "uploadChunk",

        (packet,callback)=>{

            try{

                if(

                    !packet ||

                    typeof packet!=="object"

                ){

                    callback?.(

                        createError(

                            "",

                            -1,

                            "Invalid Packet"

                        )

                    );

                    return;

                }

                if(

                    !packet.transferId ||

                    !Number.isInteger(

                        packet.chunkIndex

                    ) ||

                    !Number.isInteger(

                        packet.totalChunks

                    )

                ){

                    callback?.(

                        createError(

                            packet.transferId||"",

                            packet.chunkIndex??-1,

                            "Packet Validation Failed"

                        )

                    );

                    return;

                }

                io.emit(

                    "receiveChunk",

                    packet

                );

                callback?.(

                    createAck(

                        packet.transferId,

                        packet.chunkIndex

                    )

                );

                if(

                    packet.chunkIndex===

                    packet.totalChunks-1

                ){

                    io.emit(

                        "uploadCompleted",

                        createComplete(

                            packet.transferId,

                            packet.totalChunks

                        )

                    );

                }

            }

            catch(err){

                console.error(

                    "[ChunkReceiver]",

                    err

                );

                callback?.(

                    createError(

                        packet?.transferId||"",

                        Number.isInteger(packet?.chunkIndex)

                            ? packet.chunkIndex

                            : -1,

                        err.message||

                        "Internal Server Error"

                    )

                );

            }

        }

    );

};
        
