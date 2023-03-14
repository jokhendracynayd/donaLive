const { json } = require('express');
const client=require('../../config/redis');
const TableModel=require('../../models/teen_patti/m_game_teen_pati');


function getName(){
  return new Promise(async(resolve,reject)=>{
    if(await client.exists("active_game")){
      let data=await client.get("active_game");
      data=await JSON.parse(data);
      data.ttl=await client.ttl("active_game");
      resolve(data);
    }else{
          var dt;
          Today = new Date();
          dt = Today.getTime();
          dt = dt-1326416267200;
          var shortNumber = dt+"";
          game_id = shortNumber.substring(1, shortNumber.length-2);
          const newRow = new TableModel({
            game_id:game_id,
          });
          TableModel.addRow(newRow,async(err,doc)=>{
            if(err){
              console.log(err.message);
            }else{
              await client.setEx("active_game",25,JSON.stringify(doc));
              doc.ttl=await client.ttl("active_game");
              resolve({
                success:true,
                msg:"Game created",
                data:doc
              })
            }
          })    
        }
    // TableModel.getDataByFieldName("game_status","active",(err,docs)=>{
    //   if(err){
    //     console.log(err);
      // }else{
        // if(docs.length==0){
          // var dt;
          // Today = new Date();
          // dt = Today.getTime();
          // dt = dt-1326416267200;
          // var shortNumber = dt+"";
          // game_id = shortNumber.substring(1, shortNumber.length-2);
          // const newRow = new TableModel({
          //   game_id:game_id,
          // });
          // TableModel.addRow(newRow,async(err,doc)=>{
          //   if(err){
          //     console.log(err.message);
          //   }else{
          //     await client.set("active_game",JSON.stringify(doc));
          //     resolve({
          //       success:true,
          //       msg:"Game created",
          //       data:doc
          //     })
          //   }
          // })
      //   }else{
      //     resolve({
      //       success:true,
      //       msg:"found the data",
      //       data:docs
      //     })
      //   }
      // }
    // })
  })
}

module.exports={getName};