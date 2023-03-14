const io=require("socket.io-client");

let socket=io.connect("http://localhost:3030/hello");

socket.on("message",(data)=>{
  console.log("Received: ",data);
})
