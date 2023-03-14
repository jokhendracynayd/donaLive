const express = require("express");
const router = express.Router();
const TableModel = require("../models/m_live_streaming");
const rc = require("./../controllers/responseController");
const passport = require("passport");
const TableModelUser_login = require("../models/m_user_login");
const  {hoursAndCoins,startAndendDate}=require('../utilis/get_hours_coins');



router.post('/create',(req,res)=>{
  const userId=req.body.user_id;
  const fieldNames=["user_id","live_streaming_current_status"];
  const fieldValues=[userId,"live"];
  TableModel.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
    if(err){
      console.log(err.message);
    }else{
      if(doc.length==0){
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
      }else if(doc.length>0){
        TableModel.updateRow(doc[0]._id,{"live_streaming_current_status":"ended"},(err,docs)=>{
          if(err){
            res.json({success:false,msg:err.message})
          }else{
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
        })
    }
  } 
 })
})

router.post(
  "/create",
  (req, res) => {
    const userId = req.body.user_id;

    const filter = { user_id: userId };
    const update = { live_streaming_current_status: "ended" };

    TableModel.find_OndAndUpdate(filter, update, (err, docs) => {
      if (err) {
        // return rc.setResponse(res, {
        //     msg: err.message
        // })

        console.log("Error!! While ending Live Streaming");
      } else {
      }
    });
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

router.get(
  "/",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.getData((err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "All Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.get(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    TableModel.getDataById(id, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: doc,
        });
      }
    });
  }
);

/**
 * @discription this is for 24 hour live coins
 */

router.get('/getDayliveCoin/:userId',(req,res)=>{
  const userId= req.params.userId;
  TableModel.getDataByFieldName("user_id",userId,(err,doc)=>{
    if(err){
      console.log(err.message);
    }else{
      let coins=0;
      let count=0;
      doc.forEach(ele=>{
        let liveDate=ele.live_streaming_start_time.split('T')[0];
        let curretnDate=new Date().toISOString().split('T')[0];
        if(liveDate==curretnDate){
          console.log(ele.coins);
          coins+=ele.coins;
        }
        count++;
        if(doc.length===count){
          
          var starRating = '';

          if(coins > 0 && coins < 10000){
              starRating = 1;
          }
          if(coins > 10000 && coins < 50000){
               starRating = 2;
          }
          if(coins > 50000 && coins < 200000){
               starRating = 3;
          }
          if(coins > 200000 && coins < 1000000){
               starRating = 4;
          }
          if(coins > 1000000){
               starRating = 5;
          }

          res.json({
            success:true,
            msg:"Data fetched",
            data:{
              coins:coins,
              start:starRating,
            }
          })
        }
      })
    }
  })
})

router.post(
  "/byField",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        if(docs.length==0){
          return rc.setResponse(res,{
            msg:'No data found'
          })
        }
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);




router.post(
  "/byFields",
  (req, res) => {
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        if(docs.length==0){
          return rc.setResponse(res,{
            msg:'No data found'
          })
        }
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.get('/report/:userId',(req,res)=>{
  TableModel.getDataForDurationAndCoin(req.params.userId,(err,doc)=>{
    if(err){
      console.log(err.message);
    }else{
      if(doc.length==0){
        res.json({
          success:true,
          msg:'Data not found',
          data:{
            coins:0,
            durations:"00:00:00"
          }
        })
      }
      hoursAndCoins(doc).then(response=>{
        res.json({
          success:true,
          msg:'Data fetched',
          data:response,
        })
      })
    }
  })
})

router.post('/view-report-duration',(req,res)=>{
  const {getDays,user_id}=req.body;
  if(getDays!==""&&user_id!=""){
    startAndendDate(getDays).then(days=>{
      console.log(days)
      TableModel.getSpecificDuration(user_id,days.startDay,days.lastDay,(err,doc)=>{
        if(err){
          res.json({
            success:false,
            msg:err.message
          })
        }else{
          hoursAndCoins(doc).then(response=>{
            res.json({
              success:true,
              msg:"Data fetched",
              data:response
            })
          })
        }
      })
    })
  }
})

router.post('/view-report',(req,res)=>{
  const {getDays,user_id}=req.body;
  startAndendDate(getDays).then((days)=>{
    TableModel.getSpecificDuration(user_id,days.startDay,days.lastDay,(err,doc)=>{
      if(err){
        console.log(err.message);
      }else{
          res.json({
            success:true,
            msg:"Data fetched",
            data:doc
          })      
      }
    })
  })
})

router.put(
  "/update/:id",
  (req, res) => {
    TableModel.updateRow(req.params.id, req.body, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Updated",
          data: docs,
        });
      }
    });
  }
);

router.delete(
  "/byId/:id",
  (req, res) => {
    TableModel.deleteTableById(req.params.id, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Deleted",
          data: docs,
        });
      }
    });
  }
);


router.post('/down',(req,res)=>{
  const {liveId}=req.body;
  TableModel.getDataByFieldNameSort("live_streaming_current_status","live",(err,doc)=>{
    if(err){
      console.log(err.message)
    }else{
      function nextLive(liveUser,callback){
      for(let i=0;i<liveUser.length;i++){
        if(liveUser[i].id==liveId){
          if(i==0){
            callback(liveUser[liveUser.length-1])
          }else{
            callback(liveUser[i-1]);
          }
        }
      }
      }
      upSwipe(doc,(response)=>{
        return rc.setResponse(res,{
          success:true,
          msg:"Data fetch",
          data:response
        })
      })
      function upSwipe(data,callback){
        let count=0;
        let setArray=[];
        data.forEach(ele=>{
          setArray.push(ele)
          count++;
          if(data.length==count){
            nextLive(setArray,callback)
          }
        })
      }
    }
  })
})


router.post('/up',(req,res)=>{
  const {liveId}=req.body;
  if(liveId.length<=0){
    TableModel.getDataByFieldName("live_streaming_current_status","live",(err,doc)=>{
      if(err){
        res.json({
          success:false,
          msg:err.message
        })
      }else{
        res.json({
          success:true,
          msg:"Data fetch",
          data:doc[0]
        })
      }
    })
  }else{
    TableModel.getDataByFieldNameSort("live_streaming_current_status","live",(err,doc)=>{
      if(err){
        console.log(err.message)
      }else{
        function nextLive(liveUser,callback){
        for(let i=0;i<liveUser.length;i++){
          if(liveUser[i].id==liveId){
            
            if(liveUser.length==i+1){
              callback(liveUser[0]);
            }
            else{
              callback(liveUser[i+1]);
            }
            
          }
        }
        }
        upSwipe(doc,(response)=>{
          return rc.setResponse(res,{
            success:true,
            msg:"Data fetch",
            data:response
          })
        })
        function upSwipe(data,callback){
          let count=0;
          let setArray=[];
          data.forEach(ele=>{
            setArray.push(ele)
            count++;
            if(data.length==count){
              nextLive(setArray,callback)
            }
          })
        }
      }
    })
  }

})
router.get(
  "/fetchLiveStreamingforHomeScreen/:id",
  (req, res, next) => {
    const UserId = req.params.id;
    var errors = [];
    var finalData = new Array();
    var responsegg = "no";
    var itemsProcessed = 0;
    TableModel.fetchLiveStreamingforHomeScreen(UserId, (error, docs) => {
      if (error) {
        res.send("error");
      } else {
        if(docs.length==0){
          return rc.setResponse(res,{
            msg:'No data found'
          })
        }
        fetchUserinfo(docs, function (response) {
          return rc.setResponse(res, {
            success: true,
            msg: "Data Updated",
            data: response,
          });
        });
        function fetchUserinfo(docss, callback) {
          if (docss[0]) {
            docss.forEach((element) => {
              TableModelUser_login.getDataByUserId(
                element.user_id,
                (err, doc) => {
                  if (err) {
                    errors = err;
                  } else {
                    if (doc) {
                      if (typeof doc.length != 0) {
                        var profilePicToShow = "";
                        var tarea = doc.user_profile_pic;
                        if (
                          tarea.indexOf("http://") == 0 ||
                          tarea.indexOf("https://") == 0
                        ) {
                          profilePicToShow = doc.user_profile_pic;
                        } else {
                          profilePicToShow =
                            "https://3.7.87.3:3000/api/file/view/" +
                            doc.user_profile_pic;
                        }

                        if (UserId !== element.user_id) {
                          let dataToSend = {
                            _id: element._id,
                            created_at: element.created_at,
                            user_id: element.user_id,
                            live_streaming_channel_id:
                              element.live_streaming_channel_id,
                            live_streaming_token: element.live_streaming_token,
                            live_streaming_type: element.live_streaming_type,
                            live_name: element.live_name,
                            live_streaming_start_time:
                              element.live_streaming_start_time,
                            live_streaming_current_status:
                              element.live_streaming_current_status,
                            created_by: element.created_by,
                            userProfilePic: profilePicToShow,
                            user_nick_name:doc.user_nick_name,
                            agora_ud:element.agora_ud,
                          };

                          itemsProcessed++;
                          finalData.push(dataToSend);
                        } else {
                          docss.length--;
                        }
                      }
                      if (itemsProcessed === docss.length) {
                        callback(finalData);
                      }
                    } else {
                      finalData.push("");
                      callback(finalData);
                    }
                  }
                }
              );
            });
          } else {
            finalData.push("");
            callback(finalData);
          }
        }
      }
    });
  }
);

module.exports = router;
