// ===========================================
// Secure Ultra Chat
// uploadUI.js
// Upload Progress UI
// ===========================================

const uploadItems = {};



// Create Upload Bubble

function createUploadBubble(file){

    const messages =

        document.getElementById("messages");

    if(!messages) return null;



    const id =

        MediaUtils.generateMediaId();



    const li =

        document.createElement("li");



    li.className = "my-message";



    li.dataset.uploadId = id;



    li.innerHTML = `

<div style="display:flex;align-items:center;gap:12px;">

<div style="font-size:34px;">

${MediaUtils.getFileIcon(file.fileType)}

</div>



<div style="flex:1;">

<div style="font-weight:bold;word-break:break-word;">

${file.fileName}

</div>



<div style="font-size:12px;opacity:.8;">

${MediaUtils.formatFileSize(file.fileSize)}

</div>



<progress

value="0"

max="100"

style="

width:100%;

height:8px;

margin-top:8px;

">

</progress>



<div

class="upload-percent"

style="

font-size:12px;

margin-top:4px;

">

0%

</div>

</div>

</div>

`;



    messages.appendChild(li);



    messages.scrollTop =

        messages.scrollHeight;



    uploadItems[id] = li;



    return id;

}





// Update Progress

function updateUploadProgress(

id,

percent

){

    const bubble =

        uploadItems[id];



    if(!bubble) return;



    const progress =

        bubble.querySelector("progress");



    const label =

        bubble.querySelector(

            ".upload-percent"

        );



    progress.value = percent;



    label.innerText =

        percent + "%";

}





// Finish Upload

function finishUpload(id){

    const bubble =

        uploadItems[id];



    if(!bubble) return;



    const label =

        bubble.querySelector(

            ".upload-percent"

        );



    const progress =

        bubble.querySelector(

            "progress"

        );



    progress.value = 100;



    label.innerHTML =

        "✅ Uploaded";

}





// Remove Upload Bubble

function removeUploadBubble(id){

    const bubble =

        uploadItems[id];



    if(!bubble) return;



    bubble.remove();



    delete uploadItems[id];

}





// Fail Upload

function failUpload(id){

    const bubble =

        uploadItems[id];



    if(!bubble) return;



    const label =

        bubble.querySelector(

            ".upload-percent"

        );



    label.innerHTML =

        "❌ Failed";

}





window.UploadUI={

createUploadBubble,

updateUploadProgress,

finishUpload,

removeUploadBubble,

failUpload

};
