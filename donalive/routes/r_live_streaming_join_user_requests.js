const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_live_streaming_join_user_requests');
const TableLiveStreaming = require('../models/m_live_streaming');
const rc = require('./../controllers/responseController');
const passport = require("passport");
const user_authentication = require('../config/user_auth');
const TableModelUserGifting = require('../models/m_user_gifting');

// router.post('/create',
//     // passport.authenticate("jwt", { session: false }),
//     (req, res) => {
//         // const newRow = req.body;
//         const newRow = new TableModel(req.body);
//         // newRow.institute = req.user.institute;
//         if (!newRow) {
//             return rc.setResponse(res, {
//                 msg: 'No Data to insert'
//             });
//         }
//         TableModel.addRow(newRow, (err, doc) => {
//             if (err) {
//                 return rc.setResponse(res, {
//                     msg: err.message
//                 });
//             } else {
//                 return rc.setResponse(res, {
//                     success: true,
//                     msg: 'Data Inserted',
//                     data: doc
//                 });
//             }
//         })
//     }
// );





router.post(
  "/create",
  (req, res) => {
    const userId = req.body.request_to_user_id;
    const live_streaming_id = req.body.live_streaming_id;
    const byUserId=req.body.request_by_user_id;

    /**
     * dissabling the other live streaming if already running
     */
    const filter = { request_to_user_id: userId, live_streaming_id : live_streaming_id,request_by_user_id:byUserId };
    const update = { request_accept_status: "expired" };
    TableModel.find_OndAndUpdate(filter, update, (err, docs) => {
      if (err) {

        console.log("Error!! unable to modify the user request");
      } else {
        console.log(docs)
        const newRow = new TableModel(req.body);
    if (!newRow) {
      return rc.setResponse(res, {
        msg: "No Data to insert",
      });
    }
    TableModel.addRow(newRow, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Inserted",
          data: doc,
        });
      }
    });  
    }
    });
  }
);


router.get('/',
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.getData((err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
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
    (req, res) => {
        const id = req.params.id;
        TableModel.getDataById(id, (err, doc) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
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
    (req, res) => {    
        TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                    return rc.setResponse(res,{
                        msg:'No data found'
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
    // user_authentication,
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getUsernamePic(fieldNames, fieldValues, (err, docs) => {
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


function addCoinsToUser(live_streaming_id,data){
    return new Promise((resolve,reject)=>{
        // console.log("👍👍👍👍👍👍👍👍👍👍👍")
        let fieldNames=['gifting_to_user','livestreaming_id'];
        let fieldValues=[data.userDetails[0].username,live_streaming_id];
        TableModelUserGifting.getDataByFieldNames(fieldNames,fieldValues,(err,docs)=>{
            if(err){
                reject(err);
            }else{
                if(docs.length==0){
                    resolve(0);
                }else{
                    let coins=0;
                let count=0;
                docs.forEach((doc)=>{
                    coins+=parseInt(doc.gift_price);
                    count++;
                    if(docs.length==count){
                        resolve(coins);
                    }
                })
            }
            }
        })
    })
}

router.post('/byFieldsWithCoins',(req,res)=>{
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    let index=fieldNames.indexOf('live_streaming_id');
    let live_streaming_id=fieldValues[index];
    TableModel.getUsernamePic(fieldNames, fieldValues, (err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
            if(docs.length==0){
                res.json({
                    success:false,
                    msg:'No data found'
                })
            }
            else{
                TableLiveStreaming.getDataById(docs[0].live_streaming_id,async(err,doc)=>{
                    if(err){
                        res.json({
                            success:false,
                            msg:err.message
                        })
                    }else{
                        if(!doc){
                            res.json({
                                success:false,
                                msg:'No data found',
                                data:docs,
                            })
                        }else{
                            docs[0].coins=doc.coins
                            let count=0;
                            docs.forEach(async(item,index)=>{
                                await addCoinsToUser(live_streaming_id,item).then((data)=>{
                                   docs[index].coins=data;
                                    count++;
                                    if(docs.length==count){
                                        return rc.setResponse(res, {
                                            success: true,
                                            msg: 'Data Fetched',
                                            data: docs
                                        });
                                    }
                                }).catch((err)=>{
                                    docs[index].coins=0;
                                    count++;
                                    if(docs.length==count){
                                        return rc.setResponse(res, {
                                            success: true,
                                            msg: 'Data Fetched',
                                            data: docs
                                        });
                                    }
                                })
                            })
                           
                        }
                    }
                })
            }
        }
    })
})

router.put('/update/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.updateRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);

router.delete('/byId/:id',
    passport.authenticate("jwt", { session: false }),
    (req, res) => {
        TableModel.deleteTableById(req.params.id, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Deleted',
                    data: docs
                });
            }
        })
    }
);


/**
 * custom routes
 */


// router for dissabled the live streaming

router.put('/updateViaLiveStreamingID/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        console.log(req.body);
        TableModel.updateViaUser_idRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);


// removing user from the seat by userid

router.put('/removefromSeatbyUserId/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        console.log(req.body);
        TableModel.removefromSeatbyUserId(req.params.id, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs
                });
            }
        })
    }
);

module.exports = router;