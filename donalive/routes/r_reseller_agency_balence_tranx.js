const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_reseller_agency_trax');
const ResellerAgencyUserTran=require('../models/m_reseller_agency_user_recharge_trax');
const TableLogin=require('../models/m_user_login')
const rc = require('./../controllers/responseController');
router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
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

router.post('/reseller-agency-user-tran',(req,res)=>{
    const {fieldName,fieldValue}=req.body;
    ResellerAgencyUserTran.getDataByFieldName(fieldName,fieldValue,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            setUserName(doc,(response)=>{
                return rc.setResponse(res,{
                    success:true,
                    msg:"Data fetched",
                    data:response,
                })
            })
            function setUserName(data,callback){
                let count=0;
                let sendToData=[]
                data.forEach(ele=>{
                    TableLogin.getDataByFieldName('username',ele.receiver_user_id,(err,docs)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            // console.log(ele , docs[0])
                            if(docs[0]){
                                ele._doc.username=docs[0].user_nick_name!=undefined?docs[0].user_nick_name:"Not Available";
                                sendToData.push(ele);
                                count++;
                                if(data.length==count){
                                    callback(sendToData);
                                }
                            }else{
                                ele._doc.username="Not Available";
                                sendToData.push(ele);
                                count++;
                                if(data.length==count){
                                    callback(sendToData);
                                }   
                            }
                        }
                    })
                })
            }
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
                // console.log(doc.user_diamond)
                // res.json(doc);
                
            }
        })
    }
);






router.post('/byField',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log("i got the request");
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




module.exports = router;