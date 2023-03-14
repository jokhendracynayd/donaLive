const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_official_talent');
const TableModel1=require('../models/m_user_wallet_balance');
const rc = require('./../controllers/responseController');
const passport = require("passport");
const authenticate=require("../config/admin_auth");


router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    async(req, res) => {
        console.log("i got a request from agency portal");
        // const newRow = req.body;
        
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
    }
);

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

router.put('/updateHostDetails',(req,res)=>{
    const {real_name,mobile_no,country,state,address,streaming_type,nationalIdNo,id}=req.body;
    TableModel.updateRow(id,{real_name,mobile_no,country,state,address,streaming_type,nationalIdNo},(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            res.json({
                success:true,
                msg:"Data updated",
            })
        }
    })
})

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

router.post('/byFieldOfficial',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    TableModel.getDataByFieldNames(fieldNames, fieldValues, async(err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
            fetchUserR_coin(docs,(response)=>{
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: response                
                });
            });
            function fetchUserR_coin(docss,callback){
                let sendToData=[]
                let count=0;

                docss.forEach((ele)=>{
                     // console.log('get info of ' + ele.user_id);
                    TableModel1.getDataByFieldName("user_id",ele.user_id,(err,doc)=>{
                        if(err){
                            console.log(err.message)
                        }else{
                            ele._doc.coins=doc.user_rcoin;
                            sendToData.push(ele);
                            count++;
                            if(docss.length==count){
                                callback(sendToData);
                            }
                        }
                    })
                    
                })                
            }
        }
    })

})


router.post('/total-earning',(req,res)=>{
    console.log(req.body);
    const fieldName="agencyId";
    const fieldValue=req.body.agencyId;
    TableModel.getDataByFieldName(fieldName,fieldValue,(err,doc)=>{
        if(err){
            console.log(err.message);
            res.json(err.message)
        }
        else{
            if(doc.length==0){
                res.json(0)
            }else{
                res.json(doc);
            }
        }
    })
})

router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldName = req.body.fieldName;
        const fieldValue = req.body.fieldValue;
        TableModel.getDataByFieldName(fieldName, fieldValue, async(err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                   return  res.json({
                        success:true,
                        msg:"No data found",
                        data:docs
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
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        
        console.log(req.body);

        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                    return res.json({
                        success:true,
                        msg:'No user Found',
                        data:docs
                    })
                }else{
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Fetched',
                    data: docs
                });
            }
            }
        })
    }
);

router.put('/update/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log(req.params.id);
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
    authenticate,
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