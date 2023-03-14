const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_follower');
const TableModelLogin=require('../models/m_user_login')
const rc = require('../controllers/responseController');
const passport = require("passport");
const TableBlock=require('../models/m_user_block');
router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    async (req, res) => {

            await TableModel.getDataByFieldName("follower_userID", req.body.follower_userID, (err, doc) => {
            if (err) {
                console.log(err.message);
            } else {
                if (Object.keys(doc).length === 0) {

                    const newRow = new TableModel(req.body);
                    // newRow.institute = req.user.institute;
                    if (!newRow) {
                        return rc.setResponse(res, {
                            msg: 'No Data to insert'
                        });
                    }
                    TableModel.addRow(newRow, (err, doc) => {
                        if (err) {
                            return rc.setResponse(res, {
                                msg: err.message
                            });
                        } else {
                            return rc.setResponse(res, {
                                success: true,
                                msg: 'Data Inserted',
                                data: doc
                            });
                        }
                    })
                } else {
                    var flag = true;
                    for (var i = 0; i < Object.keys(doc).length; i++) {
                        if (doc[i].primary_userId === req.body.primary_userId) {
                            flag = false;
                        }
                    }
                    if (flag) {
                        const newRow = new TableModel(req.body);
                        // newRow.institute = req.user.institute;
                        if (!newRow) {
                            return rc.setResponse(res, {
                                msg: 'No Data to insert'
                            });
                        }
                        TableModel.addRow(newRow, (err, doc) => {
                            if (err) {
                                return rc.setResponse(res, {
                                    msg: err.message
                                });
                            } else {
                                return rc.setResponse(res, {
                                    success: true,
                                    msg: 'Data Inserted',
                                    data: doc
                                });
                            }
                        })

                    } else {
                        const query={"follower_userID":req.body.follower_userID,"primary_userId":req.body.primary_userId};
                        TableModel.removeByFieldName(res,query);

                        // res.send("unfollow")
                    }
                }
            }
        })
    }
);


router.post('/block&unblock',(req,res)=>{
    // console.log(req.body);
    const {from_user_id,to_user_id}=req.body;
    TableBlock.checkUser(from_user_id,to_user_id,(err,doc)=>{
        if(err){
            return res.json({
                success:false,
                msg:err.message
            })
        }else{
            // console.log(doc)
            if(doc.length==0){
                const newRow=new TableBlock(req.body);
                if(newRow){
                    TableBlock.addRow(newRow,(err,docs)=>{
                        if(err){
                            // console.log(err.message)
                            return res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            return res.json({
                                success:true,
                                msg:"data insterted",
                                data:docs
                            })
                        }
                    })
                }
                else{
                    return res.json({
                        success:false,
                        msg:"something is wrong",
                    })
                }
            }else{
                if(doc[0].status=='block'){
                    TableBlock.updateRow(doc[0]._id,{status:'unblock'},(err,docss)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:err.message,
                            })
                        }
                        else{
                            return res.json({
                                success:true,
                                msg:"data updated",
                                data:docss,
                            })
                        }
                    })
                }
                else if(doc[0].status=='unblock'){
                    TableBlock.updateRow(doc[0]._id,{status:'block'},(err,docss)=>{
                        if(err){
                            return res.json({
                                success:false,
                                msg:err.message,
                            })
                        }
                        else{
                            return res.json({
                                success:true,
                                msg:"data updated",
                                data:docss,
                            })
                        }
                    })
                }
            }
        }
    })
})


router.post('/userblocklist',(req,res)=>{
    console.log(req.body);
    const {user_id,status}=req.body;
    TableBlock.blockList(user_id,status,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            res.json(doc);
        }
    })
  
})

router.post('/blockOrunblock',(req,res)=>{
    console.log(req.body);
    const {from_user_id,to_user_id}=req.body;
    TableBlock.checkUser(from_user_id,to_user_id,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            res.json(doc);
        }
    })
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
    passport.authenticate("jwt", { session: false }),
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


/**
 * @description this code is writen for find the friend of primary_user @jokhendra
 */
router.post('/friends',async(req,res)=>{
    const {fieldName,fieldValue}=req.body;
    TableModel.getDataByFieldName(fieldName,fieldValue,(err,doc)=>{
        if(err){
            return rc.setResponse(res,{
                msg:err.message
            })
        }else{
            if(doc.length==0){
                return rc.setResponse(res,{
                    success:true,
                    msg:"No friends"
                })
            }
            let array1=new Array();
            let array2=new Array();
            for(var i=0;i<Object.keys(doc).length;i++){
                array1[i]=doc[i].follower_userID
            }
            TableModel.getDataByFieldName("follower_userID",fieldValue,(err,docs)=>{
                if(err){
                    return rc.setResponse(res,{
                        msg:err.message
                    })
                }else{
                    if(docs==null){
                        return rc.setResponse(res,{
                            msg:"no friends",
                            data:docs
                        })
                    }
                    for(var i=0;i<Object.keys(docs).length;i++){
                        array2[i]=docs[i].primary_userId
                    }
                }
                let result = array1.filter(x => array2.includes(x));
               
                friendName(result,(response)=>{
                    return rc.setResponse(res,{
                        success:true,
                        msg:"Data fetched",
                        data:response,
                    })
                })
               function friendName(data,callback){
                let sendToData=[];
                let count=0;
                data.forEach(ele=>{
                    TableModelLogin.getDataByFieldName("username",ele,(err,doc)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            sendToData.push(doc);
                            count++;
                            if(data.length==count){
                                console.log(sendToData)
                                callback(sendToData)
                            }
                        }
                    })
                })
               }

            })
        }
    })
})


/**
 * @description count the follower of specific user
 */


router.post('/numberOfFollower', async (req, res) => {
    const { fieldName, fieldValue } = req.body
    // console.log(fieldName);
    TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
            if(docs.length==0){
                return rc.setResponse(res,{
                    success:false,
                    msg:'user not found'
                })
            }
            followerWithUser(docs,(response)=>{
                return rc.setResponse(res,{
                    success:true,
                    msg:"Data fetch",
                    data:response
                })
            })
            function followerWithUser(docs,callback){
                let sendToData=[]
                let count=0;
                docs.forEach((ele)=>{
                   if(fieldName=="follower_userID"){
                    TableModelLogin.getDataByFieldName("username",ele.primary_userId,(err,doc)=>{
                        if(err){
                            console.log(err.message)
                        }else{
                            if(doc.length==0){
                                return rc.setResponse(res,{
                                    msg:"user not found"
                                })
                            }
                            ele.nick_name=doc[0].user_nick_name;
                            ele.user_profile_pic=doc[0].user_profile_pic;
                            sendToData.push(ele);
                            count++;
                            if(docs.length==count){
                                callback(sendToData);
                            }
                        }
                    })

                   }else{
                    TableModelLogin.getDataByFieldName("username",ele.follower_userID,(err,doc)=>{
                        if(err){
                            console.log(err.message)
                        }else{
                            // console.log(doc);
                            ele.nick_name=doc[0].user_nick_name;
                            ele.user_profile_pic=doc[0].user_profile_pic;
                            sendToData.push(ele);
                            count++;
                            if(docs.length==count){
                                callback(sendToData);
                            }
                        }
                    })
                   }
                    
                })                
            }
        }
    })

})

router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        console.log(req.body);
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
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
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
        })
    }
);

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

/**
 * custom routes
 */

router.post('/findFollower/',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {

        var PrimaryUser1 = req.body.primary_userId;
        var SecondaryUser1 = req.body.follower_userID;


        TableModel.findFollowerOption(PrimaryUser1, SecondaryUser1, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                // console.log(size);
                let data;
                // var size=Object.keys(docs).length
                if(docs==null){
                    data="userNotFound"
                }else{
                    data="userFound"
                }
                return rc.setResponse(res, {
                    success: true,
                    msg: data,
                    data: docs
                });
            }
        })
    }
);

module.exports = router;