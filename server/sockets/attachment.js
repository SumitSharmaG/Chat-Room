module.exports = function attachmentSocket(io, socket) {

    socket.on("sendAttachment", (data) => {

        if (!data) return;

        io.emit("receiveAttachment", {
            id: Date.now().toString() +
                Math.random().toString(36).substring(2, 8),

            username: data.username,

            fileName: data.fileName,

            fileType: data.fileType,

            fileSize: data.fileSize,

            mimeType: data.mimeType,

            fileData: data.fileData,

            time: data.time
        });

    });

};
