const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_wallet_balance');
const ResellerAgencyWallet=require('../models/m_agency_reseller_wallate_balence')
const ResellerAgencyUserTran=require('../models/m_reseller_agency_user_recharge_trax')
const rc = require('./../controllers/responseController');
const authenticate=require('./../config/reseller_auth')

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


/**
 * @description add R-coin to Agency and Reseller @jokhendra
 */




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
        console.log("get byid function run")
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

router.put('/rechargeUser',authenticate,(req,res)=>{
    const {user_id,coins,resellerId}=req.body;
    const filter={user_id:user_id}
    const newData={user_diamond:coins}
    TableModel.getDataByFieldName("user_id",user_id,(err,doc)=>{
        if(err){
            console.log(err.message);
        }else{
            if(doc!=null){
                ResellerAgencyWallet.getDataByFieldName("ra_id",resellerId,(err,docs)=>{
                    if(err){
                        console.log(err.message)
                    }else{
                        if(Number(docs.ra_r_coin)<Number(coins)){
                            return rc.setResponse(res,{
                                success:false,
                                msg:"Insufficient Balance"
                            })
                        }
                        else{
                            let R_newCoins=String(Number(docs.ra_r_coin)-Number(coins));
                            ResellerAgencyWallet.upadateByfieldName({"ra_id":resellerId},{"ra_r_coin":R_newCoins},(err,docss)=>{
                                if(err){
                                    console.log(err.message)
                                }else{
                                    const newRow=new ResellerAgencyUserTran({
                                        receiver_user_id:user_id,
                                        receiver_type:"user",
                                        sender_id:resellerId,
                                        sender_type:docs.ra_type,
                                        coins:coins,
                                        transaction_id:Date.now()
                                    })
                                    ResellerAgencyUserTran.addRow(newRow, (err, docsss) => {
                                        if (err) {
                                            
                                        } else {
                                            // console.log(docsss)
                                        }
                                    })
                                }
                            })
                            let newCoins=String(Number(doc.user_diamond)+Number(coins));
                            TableModel.upadateByfieldName(filter,{"user_diamond":newCoins},(err,docs)=>{
                                if(err){
                                    console.log(err.message)
                                }else{
                                    return rc.setResponse(res,{
                                        success:true,
                                        msg:"Data Updated",
                                        data:docs
                                    })
                                }
                            })
                        }
                    }
                })
               
            }else{
                return rc.setResponse(res,{
                    success:false,
                    msg:"User not found",
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