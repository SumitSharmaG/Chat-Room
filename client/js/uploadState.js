// ==========================================
// Upload State Manager
// ==========================================

const UploadState = {

KEY:"active_uploads",

save(state){

let uploads=this.load();

uploads[state.transferId]=state;

localStorage.setItem(

this.KEY,

JSON.stringify(uploads)

);

},

update(id,data){

let uploads=this.load();

if(!uploads[id]) return;

Object.assign(

uploads[id],

data

);

localStorage.setItem(

this.KEY,

JSON.stringify(uploads)

);

},

remove(id){

let uploads=this.load();

delete uploads[id];

localStorage.setItem(

this.KEY,

JSON.stringify(uploads)

);

},

load(){

return JSON.parse(

localStorage.getItem(this.KEY)||"{}"

);

}

};

window.UploadState=UploadState;
