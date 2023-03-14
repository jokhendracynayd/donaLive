const express = require('express');
const router = express.Router();
const TableModel = require('../../models/teen_pati/m_game_fruit');
const TableBalance=require('../../models/m_user_wallet_balance');
const rc = require('../../controllers/responseController');
const passport = require("passport");
const {uniqueUserCheck,response}=require('../../utilis/userCheck');
const nodeCache=require('node-cache');
const client =require('../../config/redis');
const  myCache=new nodeCache();
const {updateBalance,creditBalance}=require('../../controllers/transaction/update_balance');
const {createBulfeAmount}=require('../../utilis/bulfe_value');
const {boat_generate}=require('../../utilis/boat_generate');

//TODO Create a new game

router.get('/create',(req,res)=>{
  TableModel.getDataByFieldName("game_status","active",(err,docs)=>{
    if(err){
      res.json({
        success:false,
        msg:err.message
      })
    }else{
      if(docs.length==0){
        var dt;
        Today = new Date();
        dt = Today.getTime();
        dt = dt-1326416267200;
        var shortNumber = dt+"";
        game_id = shortNumber.substring(1, shortNumber.length-2);
        const newRow = new TableModel({
          game_id:game_id,
        });
        TableModel.addRow(newRow,(err,doc)=>{
          if(err){
            console.log(err.message);
          }else{
            res.json({
              success:true,
              msg:"Game created",
              data:doc
            })
          }
        })
      }else{
        res.json({
          success:true,
          msg:"found the data",
          data:docs
        })
      }
    }
  })
})



router.get('/',
    (req, res) => {
        TableModel.getData((err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
              // console.log(docs)
                return rc.setResponse(res, {
                    success: true,
                    msg: 'All Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.get('/byId/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const id = req.params.id;
        TableModel.getDataById(id, (err, doc) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
              if(doc==null){
                return res.json({
                  success:true,
                  msg:"No data found"
                })
              }
              let bulfe=[5240,63584,20324]
              doc.seat.A_total_amount=doc.seat.A_total_amount+bulfe[0];
              doc.seat.B_total_amount=doc.seat.B_total_amount+bulfe[1];
              doc.seat.C_total_amount=doc.seat.C_total_amount+bulfe[2];
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: doc
                });
            }
        })
    }
);

router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
              if(docs.length==0){
                return res.json({
                  success:false,
                  msg:"No data found"
                })
              }
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);
router.post('/byFields',
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.get('/ended/:id',(req,res)=>{
    const id=req.params.id;
    console.log(id);
    TableModel.updateOneField(id,{game_status:'ended'},(err,doc)=>{
      if(err){
        console.log(err.message);
      }else{
        if(doc==null){
          res.json({
            success:true,
            msg:"No data found"
          })
        }
        res.json({
          success:true,
          msg:"Data update",
          data:doc,
        })
      }
    })
})

router.get('/winner-announcement/:id',(req,res)=>{
  const id=req.params.id;
  TableModel.getDataById(id,async(err,doc)=>{
    if(err){
      res.json({
        success:false,
        msg:err.message
      })
    }else{
      if(doc.winnerAnnounced=="yes"){
        res.json({
          success:true,
          msg:"Winner already decleared",
          data:doc.winnedSeat,
          wining:doc.WiningAmount,
          TopUserWinner:doc.TopUserWinner
        })
      }else if(doc.winnerAnnounced=="no"){
        let winnerUser=[];
        let a=doc.seat.A_total_amount;
        let b=doc.seat.B_total_amount;
        let c=doc.seat.C_total_amount;
        let winner;
        if(uniqueUserCheck(doc)){
          let luck=['A','B','C'];
          winner=luck[Math.floor(Math.random() * 3)];
        }else{
          if(a<=b&&a<=c ){
            winner='A';
          }
          else if(b<=a&&b<=c){
            winner='B';
          }
          else{
            winner='C';
          }
        }
        if(doc.users.length==0){
          await boat_generate(winner).then(result=>{
            TableModel.updateOneField(id,result,(err,doc)=>{
              if(err){
                res.json({
                  success:false,
                  msg:err.message
                })
              }else{
                res.json({
                  success:true,
                  msg:"Winner decleared",
                  data:doc.winnedSeat,
                  wining:doc.WiningAmount,
                  TopUserWinner:doc.TopUserWinner
                })
              }
            })
          })
        }else{
          let count=0;
          doc.users.forEach(async(ele)=>{
            count++;
            if(ele.seat==winner){
              winnerUser.push(ele);
            }if(doc.users.length==count){
              await creditBalance(winnerUser,winner,id).then(result=>{
                TableModel.updateOneField(id,result,(err,docs)=>{
                  if(err){
                    res.json({
                      success:false,
                      msg:err.message
                    })
                  }else{
                    res.json({
                      success:true,
                      msg:`Winner decleared`,
                      winnerSeat:winner,
                      TopUserWinner:docs.TopUserWinner,
                      WiningAmount:docs.WiningAmount,
                      data:docs
                    })
                  }
                })
              }).catch(err=>{
                res.json(err)
              })
            }
          })
        }
      }
    }
  })
})

// router.get('/winner-announcement/:id',(req,res)=>{
//   const id=req.params.id;
//   TableModel.getDataById(id,(err,doc)=>{
//     if(err){
//       res.json({
//         success:false,
//         msg:err.message
//       })
//     }else{
//       if(doc.winnerAnnounced=="yes"){
//         res.json({
//           success:true,
//           msg:"Winner already decleared",
//           data:doc.winnedSeat,
//           wining:doc.WiningAmount,
//           TopUserWinner:doc.TopUserWinner
//         })
//       }else if(doc.winnerAnnounced=="no"){
//         TableModel.getDataById(id,(err,doc)=>{
//           if(err){
//             console.log(err.message)
//           }else{
//             let winnerUser=[];
//             let a=doc.seat.A_total_amount;
//             let b=doc.seat.B_total_amount;
//             let c=doc.seat.C_total_amount;
//             let winner;
//             if(uniqueUserCheck(doc)){
//               let luck=['A','B','C'];
//               winner=luck[Math.floor(Math.random() * 3)];
//             }
//             else{
//               if(a<=b&&a<=c ){
//                 winner='A';
//               }
//               else if(b<=a&&b<=c){
//                 winner='B';
//               }
//               else{
//                 winner='C';
//               }
//             }
//             function winnerUserBalanceIncrease(data,callback){
//               if(data.length==0){
//                 TableModel.updateOneField(id,{WiningAmount:{"555555": {"WinAmount": 580,"BetAmount": 200}},TopUserWinner:[{"555555":456}],winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"},(err,doc)=>{
//                         if(err){
//                           console.log(err.message)
//                         }else{
//                           // console.log(doc);
//                         }
//                       })
//                       return res.json({
//                         success:true,
//                         msg:`No user bid on winner seat ${winner}`,
//                         data:winner,
//                         wining: {"555555": {"WinAmount": 580,"BetAmount": 200}},
//                         TopUserWinner:[{"555555":456}]

//                       })
//               }else{   
//               TableModel.updateOneField(id,{winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"},(err,doc)=>{
//                 if(err){
//                   console.log(err.message)
//                 }else{
//                   // console.log(doc);
//                 }
//               })
//              let count=0;
//              let sendToData={};
//              data.forEach(ele=>{
//             if(`${ele.user_id}` in sendToData){
//             sendToData[`${ele.user_id}`].BetAmount+=Number(ele.amount);
//             sendToData[`${ele.user_id}`].WinAmount+=Number(ele.amount)*2.9;
//             }else{
//               sendToData[`${ele.user_id}`]={BetAmount:Number(ele.amount),WinAmount:Number(ele.amount)*2.9};
//              }
//           TableBalance.findAndUpdateBalance({user_id:ele.user_id},ele.amount*2.9,(err,doc)=>{
//             if(err){
//               console.log(err.message);
//             }else{
//               count++;
//               if(data.length==count){
//                 callback(sendToData)
//               }
//             }
//           })
//         })
//               }
//          }
//             let count=0;
//             if(doc.users.length==0){
//               TableModel.updateOneField(id,{WiningAmount:{"555555": {"WinAmount": 580,"BetAmount": 200}},TopUserWinner:[{"555555":456}],winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"},(err,doc)=>{
//                 if(err){
//                   console.log(err.message)
//                 }else{
//                   res.json({
//                     success:true,
//                     msg:"this is first Winner Result",
//                     wining:{"555555": {"WinAmount": 580,"BetAmount": 200}},
//                     TopUserWinner:[{"555555":456}],
//                     data:winner
//                   })
//                 }
//               })
//             }
//             doc.users.forEach(ele=>{
//               count++;
//               if(ele.seat==winner){
//                 winnerUser.push(ele);
//               }
//               if(doc.users.length==count){
//                   winnerUserBalanceIncrease(winnerUser,(WiningAmount)=>{
//                     let TopUserWinner=[];
//                     for(let prop in WiningAmount){
//                       let temp={};
//                       temp[prop]=WiningAmount[prop].WinAmount;
//                       TopUserWinner.push(temp);
//                     }
//                     TopUserWinner.sort((a,b)=>{
//                       return b[Object.keys(b)[0]]-a[Object.keys(a)[0]];
//                     })
//                     TopUserWinner=TopUserWinner.slice(0,3);
//                     TableModel.updateOneField(id,{WiningAmount:WiningAmount.length!=0?WiningAmount: {"555555": {"WinAmount": 580,"BetAmount": 200}},TopUserWinner:TopUserWinner.length!=0?TopUserWinner:[{"555555":456}]},(err,doc)=>{
//                       if(err){
//                         console.log(err.message);
//                       }
//                       else{
//                         res.json({
//                           success:true,
//                           msg:"Winner result",
//                           data:winner,
//                           wining:WiningAmount.length!=0?WiningAmount: {"555555": {"WinAmount": 580,"BetAmount": 200}},
//                           TopUserWinner:TopUserWinner.length!=0?TopUserWinner:[{"555555":456}]
//                         })
//                       }
//                     })
                    
//                   })
//               }
//             })
//           }
//         })
//       }
//     }
//   })
// })

router.get('/last7result',(req,res)=>{
  console.log("hit the api")
  TableModel.lastGameResult((err,doc)=>{
    if(err){
      console.log(err.message)
    }else{
      res.json({
        success:true,
        msg:"Data fetch",
        data:doc
      })
    }
  })
})

router.get('/staticAnnouncement',(req,res)=>{
  res.json({
    success:true,
    msg:"Winner result",
    data:"A",
    wining: {"555555": {"WinAmount": 580,"BetAmount": 200}},
    TopUserWinner:[{"555555":456}]
  })
})


//TODO: update seat amount

router.put('/updateSeatAmount/:id',(req,res)=>{
  const id=req.params.id;
  const {user_id,amount,seat}=req.body;
  let updateSeatAmount={}
  TableModel.getDataById(id, async(err,doc)=>{
    if(err){
      res.json({
        success:false,
        msg:err.message
      })
    }else{
      if(doc.game_status=="ended" || doc.winnerAnnounced=="yes"){
        res.json({
          success:false,
          msg:"This game has ended pls wait"
        })
      }else{
        var dt;
        Today = new Date();
        dt = Today.getTime();
        dt = dt-1326416267200;
        var shortNumber = dt+"";
        transaction_id = shortNumber.substring(1, shortNumber.length-2);
        let data={
          transaction_id:transaction_id,
          transaction_type:"debited",
          transaction_amount:amount,
          transaction_status:"pending",
          transaction_date:new Date(),
          sender_type:"user",
          receiver_type:"user",
          sender_id:user_id,
          receiver_id:id,
          user_wallet_type_from:"diamonds",
          user_wallet_type_to:"diamonds",
          entity_type:{
            type:"game",
            game_id:id,
            game_name:"fruit"
          }
      }
        await updateBalance(data).then(data=>{
          if(data.success){
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
            TableModel.updateRow(id,updateSeatAmount,pushUser,async (err,docs)=>{
              if(err){
                console.log(err.message);
              }else{
                await  createBulfeAmount().then(bulfe=>{
                  docs.seat.A_total_amount=docs.seat.A_total_amount+bulfe[0];
                  docs.seat.B_total_amount=docs.seat.B_total_amount+bulfe[1];
                  docs.seat.C_total_amount=docs.seat.C_total_amount+bulfe[2];
                res.json({
                  success:true,
                  msg:"Data update",
                  data:docs
                });
                });
              }
            })
          }else{
            res.json(data)
          }
        }).catch(err=>{
          res.json(err)
        })
      }
    }
  })
})

// router.put('/update/:id',
//     (req, res) => {
//       const id=req.params.id;
//       let updateSeatAmount={}
//       const {user_id,amount,seat}=req.body;
//       TableModel.getDataById(id,(err,doc)=>{
//         if(err){
//           console.log(err.message);
//         }else{
//           if(doc.game_status=="ended" || doc.winnerAnnounced=="yes"){
//             res.json({
//               success:false,
//               msg:"This game has ended pls wait"
//             })
//           }else{
//             TableBalance.getDataByFieldName('user_id',user_id,(err,docss)=>{
//               if(err){
//                 return res.json({
//                   success:false,
//                   msg:err.message,
//                 })
//               }else{
//                 if(docss==null){
//                   return res.json({
//                     success:false,
//                     msg:'user not found',
//                   })
//                 }
//                 if(docss.user_diamond>=amount){
//                   TableModel.getDataById(id,(err,doc)=>{
//                     if(err){
//                       console.log(err.message);
//                     }else{
//                       if(seat=='A'){
//                         updateSeatAmount.A_total_amount=doc.seat.A_total_amount+Number(amount);
//                         updateSeatAmount.B_total_amount=doc.seat.B_total_amount;
//                         updateSeatAmount.C_total_amount=doc.seat.C_total_amount;
//                       }
//                       else if(seat=='B'){
//                         updateSeatAmount.A_total_amount=doc.seat.A_total_amount;
//                         updateSeatAmount.B_total_amount=doc.seat.B_total_amount+Number(amount);
//                         updateSeatAmount.C_total_amount=doc.seat.C_total_amount;
//                       }
//                       else if(seat=='C'){
//                         updateSeatAmount.A_total_amount=doc.seat.A_total_amount;
//                         updateSeatAmount.B_total_amount=doc.seat.B_total_amount;
//                         updateSeatAmount.C_total_amount=doc.seat.C_total_amount+Number(amount);
//                       }
//                       const pushUser={user_id:user_id,seat:seat,amount:amount}
//                       TableBalance.getDataByFieldName("user_id",user_id,(err,doc)=>{
//                         if(err){
            
//                         }else{
//                           let updateBalance=String(Number(doc.user_diamond)-Number(amount))
//                           TableBalance.updateRow(doc._id,{user_diamond:updateBalance},(err,docs)=>{
//                             if(err){
            
//                             }else{
//                               // console.log(docs);
//                             }
//                           })
//                         }
//                       })
//                       TableModel.updateRow(id,updateSeatAmount,pushUser,(err,docs)=>{
//                         if(err){
//                           res.json({
//                             success:false,
//                             msg:err.message,
//                             })
//                         }else{
//                           let bulfe=[5240,63584,20324]
//                           docs.seat.A_total_amount=docs.seat.A_total_amount+bulfe[0];
//                           docs.seat.B_total_amount=docs.seat.B_total_amount+bulfe[1];
//                           docs.seat.C_total_amount=docs.seat.C_total_amount+bulfe[2];
//                           res.json({
//                           success:true,
//                           msg:"Data update",
//                           data:docs
//                         });
//                         }
//                       })
//                     }
//                   })
    
//                 }else{
//                   return res.json({
//                     success:false,
//                     msg:"insufficient diamond",
//                   })
//                 }
//               }
//           })
//           }
//         }
//       })
     
//     }
// );

router.post('/userBid',(req,res)=>{
  const {game_id,user_id}=req.body;
  TableModel.getDataById(game_id,(err,docs)=>{
    if(err){
      console.log(err.message);
    }else{
      if(docs==null){
        return res.json({
          success:true,
          msg:"No data found"
        })
      }
      let sendToData={}
      let count=0;
      docs.users.forEach(ele=>{
        count++;
        if(ele.user_id==user_id){
          if(ele.seat in sendToData){
          sendToData[ele.seat]=Number(sendToData[ele.seat])+Number(ele.amount);
        }
        else{
          sendToData[ele.seat]=ele.amount;
        }
        }
        if(docs.users.length==count){
          res.json(sendToData);
        }
      })
    }
  })
})

module.exports = router;