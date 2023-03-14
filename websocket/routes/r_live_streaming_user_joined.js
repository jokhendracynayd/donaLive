const express = require('express');
const router = express.Router();
// const TableModel = require('');


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
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const userId = req.body.joined_user_id;

    /**
     * dissabling the other live streaming if already running
     */

    const filter = { joined_user_id: userId };
    const update = { joined_status: "no" };

    TableModel.find_OndAndUpdate(filter, update, (err, docs) => {
      if (err) {
        // return rc.setResponse(res, {
        //     msg: err.message
        // })

        console.log("Error!! While ending removing user from live streaming");
      } else {
        // return rc.setResponse(res, {
        //     success: true,
        //     msg: 'Data Fetched',
        //     data: docs
        // });
        console.log("All previous user joining in live streaming is  ended");
      }
    });

    /**
     * Creating the new live streaming
     */
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
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log("i got the request")
        const fieldNames = req.body.fieldNames;
        const fieldValues = req.body.fieldValues;
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                    return rc.setResponse(res,{
                        success:true,
                        msg:"data fetched",
                    })
                }
                setUserName(docs,(response)=>{
                    return rc.setResponse(res,{
                        success:true,
                        msg:'Data Fetched',
                        data:response
                    })
                })
                function setUserName(data,callback){
                    let count=0;
                    let sendToData=[];
                    data.forEach(ele=>{
                        UserTableModelLogin.getDataByFieldName("username",ele.joined_user_id,(err,docss)=>{
                            if(err){
                                console.log(err.message)
                            }else{
                                // console.log(docss[0].username);
                                ele._doc.user_nick_name=docss[0].user_nick_name;
                                ele._doc.user_profile_pic=docss[0].user_profile_pic
                                count++;
                                sendToData.push(ele)
                                if(data.length==count){
                                    callback(sendToData);
                                }   
                            }
                        })
                    })
                }
            }
        })
    }
);

router.post('/updateViauserId/',(req,res)=>{
    const {fieldNames,fieldValues,kickOut,role}=req.body;
    let newData;
    if(role)newData={role:role};        
    if(kickOut)newData={kickOut:kickOut};
    console.log(newData);
    TableModel.updateViaUserId(fieldNames,fieldValues,newData,(err,docs)=>{
        if(err){
            console.log(err.message)
            return rc.setResponse(res,{
                msg:err.message
            })
        }
        else{
            return rc.setResponse(res,{
                success:true,
                msg:"Data Update",
                data:docs
            })
        }
    })
    // res.send("hello");
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


module.exports = router;