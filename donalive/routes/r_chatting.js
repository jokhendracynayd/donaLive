const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_chatting');
const rc = require('./../controllers/responseController');
const TableModel1=require('../models/m_user_login')
const passport = require("passport");
const Messages =require('../models/m_message');

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

/**
 * @description this router to create message and save in database @jokhendra
 */
router.post('/create',async(req,res,next)=>{
    try {
        const { from, to, message } = req.body;

        console.log(from,to,message);
        
        const data = await Messages.create({
          message: { text: message },
          users: [from, to],
          sender: from,
        });
    
        if (data) return res.json({ 
            success:true,
            msg: "Message added successfully.",
            data:data 
        });
        else return res.json({ msg: "Failed to add message to the database" });
      } catch (ex) {
        next(ex);
      }
})

router.get('/',
    // passport.authenticate("jwt", { session: false }),
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
    // passport.authenticate("jwt", { session: false }),
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
                let arr=new Array();
                for(let x in Object.keys(docs)) arr[x]=docs[x].to_user_id;
                let unique = arr.filter((item, i, ar) => ar.indexOf(item) === i);
                // console.log(unique);
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data:{"chatWiths":unique}
                });
            }
        })
    }
);

router.post('/byFields',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {

                /**
                 * @description this function for sorting the data based on date and time
                 */

                function compare( a, b ) {
                    if ( a.created_at< b.created_at ){
                      return -1;
                    }
                    if ( a.created_at > b.created_at ){
                      return 1;
                    }
                    return 0;
                  }
                  
                docs.sort( compare );
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

router.post('/chatwiths',(req,res)=>{
    const {primary_user}=req.body;
    Messages.findPrimaryUser(primary_user,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            if(doc.length==0){
                res.json({
                    success:false,
                    msg:"No chat found with anyone",
                })
            }else{
                function userName(userId,callback){
                    let sendToData=[]
                    let count=0;
                    userId.forEach(ele=>{
                        TableModel1.getDataByUserId(ele,(err,docss)=>{
                            if(err){
                                console.log(err.message);
                            }else{
                                sendToData.push(docss);
                                count++;
                                if(userId.length===count){
                                    callback(sendToData);
                                }
                            }
                        })
                    })
                }
                let users=[];
                let count=0;
                doc.forEach(e=>{
                    users.push(e.users[1]);
                    let temp=new Set(users);
                    users=[...temp];
                    count++;
                    if(doc.length==count){
                        userName(users,(response)=>{
                            res.json({
                                success:true,
                                msg:"Data fetched",
                                data:response,
                            });
                        })
                    }
                })
            }
        }
    })
})


// router.post('/chatwiths',async(req,res)=>{
//     let result=[]
//         const {primary_user}=req.body;
//         const users=await Messages.find({users:primary_user})
//         console.log(users)
//         function checks(user)
//         {
//             if(user.users[0]==primary_user){
//                 result.push(user.users[1])
//                 return;
//             }
//             result.push(user.users[0])
//             return
//         }
//         users.filter(checks)
//         let unique = result.filter((item, i, ar) => ar.indexOf(item) === i);
//         userName(unique,(newResponse)=>{
//             res.json({
//                 success:true,
//                 msg:"data fetch",
//                 data:newResponse
//             })
//         })
//         function userName(userId,callback){
//             let sendToData=[]
//             let count=0;
//             userId.forEach(ele=>{
//                 TableModel1.getDataByUserId(ele,(err,docss)=>{
//                     if(err){
//                         console.log(err.message);
//                     }else{
//                         sendToData.push(docss);
//                         count++;
//                         if(userId.length===count){
//                             callback(sendToData);
//                         }
//                     }
//                 })
//             })
//         }
// })



/**
 * @description this router get the message of specific to user to friend @jokhendra
 */


router.post('/getmsg',async(req,res,next)=>{
    try {
        const { from, to } = req.body;
        console.log("this get message")
        const messages = await Messages.find({
          users: {
            $all: [from, to],
          },
        }).sort({ updatedAt: 1 });
        // console.log(messages);
        const projectedMessages = messages.map((msg) => {
          return {
            fromSelf: msg.sender.toString() === from?"sender":"receiver",
            message: msg.message.text,
            time:msg.time
          };
        });
        res.json(projectedMessages);
      } catch (ex) {
        next(ex);
      }
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
    // passport.authenticate("jwt", { session: false }),
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

module.exports = router;