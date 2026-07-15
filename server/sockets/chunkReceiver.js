// ==========================================
// Secure Ultra Chat
// Version 4.0
// chunkReceiver.js
// STEP 1 / 3
// ==========================================

"use strict";

const ChunkProtocol = require("./chunkProtocol");

module.exports = (io, socket) => {

    // ==========================
    // Upload Chunk
    // ==========================

    socket.on(

        "uploadChunk",

        async (

            packet,

            callback

        )=>{

            try{

                if(

                    !ChunkProtocol

                    .validatePacket(

                        packet

                    )

                ){

                    callback(

                        ChunkProtocol

                        .createAck(

                            packet

                            ?.transferId,

                            packet

                            ?.chunkIndex,

                            false

                        )

                    );

                    return;

                }

                relayChunk(

                    io,

                    socket,

                    packet

                );

                callback(

                    ChunkProtocol

                    .createAck(

                        packet.transferId,

                        packet.chunkIndex,

                        true

                    )

                );

            }

            catch(err){

                console.error(

                    "Chunk Error:",

                    err

                );

                callback(

                    ChunkProtocol

                    .createAck(

                        packet

                        ?.transferId,

                        packet

                        ?.chunkIndex,

                        false

                    )

                );

            }

        }

    );

    // ==========================
    // Relay Chunk
    // ==========================

    function relayChunk(

        io,

        socket,

        packet

    ){

        // ======================
        // Private Chat
        // ======================

        if(

            packet.receiver

        ){

            for(

                const [

                    username,

                    sockets

                ]

                of global.onlineUsers

            ){

                if(

                    username===

                    packet.receiver ||

                    username===

                    packet.sender

                ){

                    sockets.forEach(

                        socketId=>{

                            io.to(

                                socketId

                            ).emit(

                                "receiveChunk",

                                packet

                            );

                        }

                    );

                }

            }

            return;

        }



        // ======================
        // World Chat
        // ======================

        socket.broadcast.emit(

            "receiveChunk",

            packet

        );

    }



    // ==========================
    // Upload Complete
    // ==========================

    socket.on(

        "uploadComplete",

        (data)=>{

            if(

                data.receiver

            ){

                for(

                    const [

                        username,

                        sockets

                    ]

                    of global.onlineUsers

                ){

                    if(

                        username===

                        data.receiver ||

                        username===

                        data.sender

                    ){

                        sockets.forEach(

                            socketId=>{

                                io.to(

                                    socketId

                                ).emit(

                                    "uploadCompleted",

                                    data

                                );

                            }

                        );

                    }

                }

                return;

            }



            socket.broadcast.emit(

                "uploadCompleted",

                data

            );

        }

    );

    // ==========================
    // Upload Cancel
    // ==========================

    socket.on(

        "uploadCancel",

        (data)=>{

            if(

                data.receiver

            ){

                for(

                    const [

                        username,

                        sockets

                    ]

                    of global.onlineUsers

                ){

                    if(

                        username===

                        data.receiver ||

                        username===

                        data.sender

                    ){

                        sockets.forEach(

                            socketId=>{

                                io.to(

                                    socketId

                                ).emit(

                                    "uploadCancelled",

                                    data

                                );

                            }

                        );

                    }

                }

                return;

            }

            socket.broadcast.emit(

                "uploadCancelled",

                data

            );

        }

    );



    // ==========================
    // Disconnect
    // ==========================

    socket.on(

        "disconnect",

        ()=>{

            console.log(

                "Chunk Receiver Closed:",

                socket.id

            );

        }

    );

};
