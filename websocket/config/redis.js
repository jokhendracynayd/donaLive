const {createClient}=require("redis");
const client=createClient()
client.connect();
client.on('connect',()=>{
  console.log("redis connected successfull!");
})

module.exports=client;