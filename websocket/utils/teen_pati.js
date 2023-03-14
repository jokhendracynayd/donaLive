const TableModel=require('../models/teen_patti/m_game_teen_pati');
const TableBalance=require('../models/m_user_wallet_balance');
const client=require('../config/redis');

function CreateGame(data){
  return new Promise(async(resolve,reject)=>{
   let activeGame=JSON.parse( await client.get("active_game"));
    if(activeGame){
      activeGame.ttl=await client.ttl("active_game");
      resolve(activeGame);
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
           await client.setEx("active_game",20,JSON.stringify(doc));
           doc.ttl=await client.ttl("active_game");
            resolve(doc);
          }
        })
    }
  })
}

function BiddingOnseat(data){
  return new Promise(async(resolve,reject)=>{
    let updateSeatAmount={}
    const {game_id,user_id,amount,seat}=data;
    TableModel.getDataById(game_id,(err,doc)=>{
      if(err){
        console.log(err.message);
      }else{
        if(doc.game_status=="ended" || doc.winnerAnnounced=="yes"){
          resolve({
            success:false,
            msg:"This game has ended pls wait"
          })
        }else{
          TableBalance.getDataByFieldName('user_id',user_id,(err,docss)=>{
            if(err){
              reject({
                success:false,
                msg:err.message,
              })
            }else{
              if(docss==null){
                reject({
                  success:false,
                  msg:'user not found',
                })
              }
              if(docss.user_diamond>=amount){
                TableModel.getDataById(game_id,(err,doc)=>{
                  if(err){
                    console.log(err.message);
                  }else{
                    if(seat=='A'){
                      updateSeatAmount.A_total_amount=doc.seat.A_total_amount+Number(amount);
                      updateSeatAmount.B_total_amount=doc.seat.B_total_amount;
                      updateSeatAmount.C_total_amount=doc.seat.C_total_amount;
                    }
                    else if(seat=='B'){
                      updateSeatAmount.A_total_amount=doc.seat.A_total_amount;
                      updateSeatAmount.B_total_amount=doc.seat.B_total_amount+Number(amount);
                      updateSeatAmount.C_total_amount=doc.seat.C_total_amount;
                    }
                    else if(seat=='C'){
                      updateSeatAmount.A_total_amount=doc.seat.A_total_amount;
                      updateSeatAmount.B_total_amount=doc.seat.B_total_amount;
                      updateSeatAmount.C_total_amount=doc.seat.C_total_amount+Number(amount);
                    }
                    const pushUser={user_id:user_id,seat:seat,amount:amount}
                    TableBalance.getDataByFieldName("user_id",user_id,(err,doc)=>{
                      if(err){
          
                      }else{
                        let updateBalance=String(Number(doc.user_diamond)-Number(amount))
                        TableBalance.updateRow(doc._id,{user_diamond:updateBalance},(err,docs)=>{
                          if(err){
          
                          }else{
                            // console.log(docs);
                          }
                        })
                      }
                    })
                    TableModel.updateRow(game_id,updateSeatAmount,pushUser,(err,docs)=>{
                      if(err){
                        console.log(err.message);
                      }else{
                        let bulfe=[52420,63584,20324]
                        docs.seat.A_total_amount=docs.seat.A_total_amount+bulfe[0];
                        docs.seat.B_total_amount=docs.seat.B_total_amount+bulfe[1];
                        docs.seat.C_total_amount=docs.seat.C_total_amount+bulfe[2];
                      resolve({
                        success:true,
                        msg:"Data update",
                        data:docs
                      });
                      }
                    })
                  }
                })
  
              }else{
                resolve({
                  success:false,
                  msg:"insufficient diamond",
                })
              }
            }
        })
        }
      }
    })
  })
}
module.exports={CreateGame,BiddingOnseat};

