// ==========================================
// Upload ACK
// ==========================================

module.exports = function(io, socket){

    socket.on("chunk-upload", (packet)=>{

        // Server confirms chunk received
        socket.emit("chunk-ack",{

            transferId:packet.transferId,

            chunkIndex:packet.chunkIndex

        });

    });

};
