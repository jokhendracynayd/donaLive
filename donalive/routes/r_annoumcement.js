const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_announcement');
const UserLoginTable=require('../models/m_user_login')
const rc = require('../controllers/responseController');
const passport = require("passport");


router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
     const {user_id,message}=req.body;
      UserLoginTable.getDataByFieldName("username",user_id,(err,doc)=>{
        if(err){
          console.log(err.message);
        }else{
          if(doc.length==0){
            res.json({
              success:false,
              msg:"User Not Found",
            })
          }
          else{
            const newRow=new TableModel(req.body);
            if(!newRow){
              return rc.setResponse(res,{
                msg:"No Data to Insert"
              })
            }
            else{
              TableModel.addRow(newRow,(err,docs)=>{
                if(err){
                  console.log(err.message);
                }
                else{
                  res.json({
                    success:true,
                    msg:"Data Inserted",
                    data:docs
                  })
                }
              })
            }
          }
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
        console.log(fieldName)
        const fieldValue = req.body.fieldValue;
        console.log(fieldValue)
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

router.put('/update/:id',
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