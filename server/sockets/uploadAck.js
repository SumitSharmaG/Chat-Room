// ==========================================
// Secure Ultra Chat
// FINAL VERSION
// uploadAck.js
// DO NOT MODIFY
// ==========================================

module.exports = function uploadAck(socket){

    return function(success=true,message="OK",extra={}){

        return{

            success,

            message,

            serverTime:Date.now(),

            ...extra

        };

    };

};
