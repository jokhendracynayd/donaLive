const io=require("socket.io-client");

let btn=document.getElementById('btn');
btn.addEventListener('click',callback);
function callback(){
 let value=document.getElementById('text-input');
 console.log(value.value);
}

