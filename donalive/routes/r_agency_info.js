const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_agency_info');
const HostTable=require('../models/m_official_talent');
const WalletTable=require('../models/m_user_wallet_balance');
const LiveStreamingTable=require('../models/m_live_streaming');
const rc = require('../controllers/responseController');
const passport = require("passport");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const {startAndendDate,hoursAndCoins,getTotal_salary,PrevstartAndendDate}=require('../utilis/get_hours_coins')
const {date_format}=require('../utilis/date_formater');

router.post('/create',
    //// passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        const newRow = new TableModel(req.body);
    
        // newRow.institute = req.user.institute;
        if (!newRow) {
            return rc.setResponse(res, {
                msg: 'No Data to insert'
            });
        }else{
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
            });
        }
       
    }
);

router.get('/',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        console.log('')
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


router.post('/makeZero',async(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,async(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            if(doc.length==0){
                res.json({
                    success:false,
                    msg:"No data found"
                })
            }else{
                let count=0;
                doc.forEach(ele=>{
                    WalletTable.getDataByField({user_id:ele.user_id},async(err,docs)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            WalletTable.movetoOldTable(docs._id,async(err,doc1)=>{
                                if(err){
                                    console.log(err.message);
                                }else{
                                    console.log(doc1);
                                    count++;
                                    if(count==doc.length){
                                        res.json({
                                            success:true,
                                            msg:"All data updated"
                                        })
                                    }
                                }
                            })
                        }
                    })
                })
            }
        }
    })
})



router.post('/salaryProccess',async(req,res)=>{
    const {agency_code,days}=req.body;
    let dataTosend=[];
    let fieldNames=["agencyId","host_status"];
    let fieldValues=[agency_code,"accepted"];

    HostTable.getDataByFieldNames(fieldNames,fieldValues,async(err,doc)=>{
        if(err){
            res.json({
                success:false, 
                msg:err.message
            })
        }else{
            if(doc.length==0){
                res.json({
                    success:false,
                    msg:"No data found"
                })
            }else{
                let count=0;
                var startDay;
                var endDay;
                await startAndendDate(days).then(day=>{
                    startDay=day.startDay;
                    endDay=day.lastDay;
                })
                doc.forEach(ele=>{
                    WalletTable.getDataByField({user_id:ele.user_id},async(err,docs)=>{
                        if(err){
                           res.json({
                            success:false,
                            msg:err.message
                           })
                        }else{
                            LiveStreamingTable.getSpecificDuration(ele.user_id,startDay,endDay,async(err,doc1)=>{
                                if(err){
                                    res.json({
                                        success:false,
                                        msg:err.message
                                    })
                                }else{
                                    await hoursAndCoins(doc1).then(async data=>{
                                        let dataToPush={};
                                            dataToPush.user_id=ele.user_id;
                                            dataToPush.real_name=ele.real_name;
                                            dataToPush.agencyId=ele.agencyId;
                                            dataToPush.coutry=ele.country;
                                            dataToPush.email=ele.email;
                                            dataToPush.total_coins=docs.user_rcoin;
                                            dataToPush.total_hours=data.durations;
                                            dataToPush.total_days=data.days;
                                            dataToPush.join_date=date_format(ele.created_at);
                                            dataToPush.streaming_type=ele.streaming_type;
                                        await getTotal_salary(docs.user_rcoin,dataToPush).then(salary=>{
                                            dataTosend.push(salary);
                                            count++;
                                            if(count==doc.length){
                                                res.json({
                                                    success:true,
                                                    msg:'All Data get',
                                                    data:dataTosend
                                                })
                                            }
                                        })
                                    })
                                }
                            })                       
                        }
                    })
                })
            }
                   
        }
    })
})


router.post('/prevSalaryProccess',async(req,res)=>{
    const {agency_code,days}=req.body;
    let dataTosend=[];
    let fieldNames=["agencyId","host_status"];
    let fieldValues=[agency_code,"accepted"]
    HostTable.getDataByFieldNames(fieldNames,fieldValues,async(err,doc)=>{
        if(err){
            res.json({
                success:false, 
                msg:err.message
            })
        }else{
            if(doc.length==0){
                res.json({
                    success:false,
                    msg:"No data found"
                })
            }else{
                let count=0;
                var startDay;
                var endDay;
                await PrevstartAndendDate(days).then(day=>{
                    startDay=day.startDay;
                    endDay=day.lastDay;
                })
                doc.forEach(ele=>{
                    WalletTable.oldBalance({user_id:ele.user_id},async(err,docs)=>{
                        if(err){
                           res.json({
                            success:false,
                            msg:err.message
                           })
                        }else{
                            LiveStreamingTable.getSpecificDuration(ele.user_id,startDay,endDay,async(err,doc1)=>{
                                if(err){
                                    res.json({
                                        success:false,
                                        msg:err.message
                                    })
                                }else{
                                   if(docs!=null){
                                    await hoursAndCoins(doc1).then(async data=>{
                                        let dataToPush={};
                                            dataToPush.user_id=ele.user_id;
                                            dataToPush.real_name=ele.real_name;
                                            dataToPush.agencyId=ele.agencyId;
                                            dataToPush.coutry=ele.country;
                                            dataToPush.email=ele.email;
                                            dataToPush.total_coins=docs.user_rcoin;
                                            dataToPush.total_hours=data.durations;
                                            dataToPush.total_days=data.days;
                                            dataToPush.join_date=ele.created_at;
                                        await getTotal_salary(docs.user_rcoin,dataToPush).then(salary=>{
                                            dataTosend.push(salary);
                                            count++;
                                            if(count==doc.length){
                                                res.json({
                                                    success:true,
                                                    msg:'All Data get',
                                                    data:dataTosend
                                                })
                                            }
                                        })
                                    })
                                   }else{
                                    await hoursAndCoins(doc1).then(async data=>{
                                        let dataToPush={};
                                            dataToPush.user_id=ele.user_id;
                                            dataToPush.real_name=ele.real_name;
                                            dataToPush.agencyId=ele.agencyId;
                                            dataToPush.coutry=ele.country;
                                            dataToPush.email=ele.email;
                                            dataToPush.total_coins=0;
                                            dataToPush.total_hours=data.durations;
                                            dataToPush.total_days=data.days;
                                            dataToPush.join_date=ele.created_at;
                                        await getTotal_salary(0,dataToPush).then(salary=>{
                                            dataTosend.push(salary);
                                            count++;
                                            if(count==doc.length){
                                                res.json({
                                                    success:true,
                                                    msg:'All Data get',
                                                    data:dataTosend
                                                })
                                            }
                                        })
                                    })
                                   }
                                }
                            })                       
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
        console.log("this is from agency");
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
    //// passport.authenticate("jwt", { session: false }),
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
                if(docs.length==0){
                    return rc.setResponse(res,{
                        success:true,
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


/**
 * @description get all host coins of specific agency 
 * 
 */

router.post('/all-hostCoins',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            getAllHostCoins(doc,(response)=>{
                res.json({
                    success:true,
                    msg:'All Date get',
                    data:response
                })
            })
            function getAllHostCoins(data,callback){
                let count=0;
                let allCoins=0;
                data.forEach(ele=>{
                    WalletTable.getDataByFieldName('user_id',ele.user_id,(err,docs)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })                        }else{
                            allCoins+=Number(docs.user_rcoin);
                            count++;
                            if(data.length==count){
                                callback(allCoins);
                            }
                        }
                    })
                })
            }
        }
    })
})



router.post('/prevall-hostCoins',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            getAllHostCoins(doc,(response)=>{
                res.json({
                    success:true,
                    msg:'All Date get',
                    data:response
                })
            })
            function getAllHostCoins(data,callback){
                let count=0;
                let allCoins=0;
                data.forEach(ele=>{
                    WalletTable.oldBalance({'user_id':ele.user_id},(err,docs)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })                        
                        }else{
                            if(docs!=null){
                                allCoins+=Number(docs.user_rcoin);
                            count++;
                            if(data.length==count){
                                callback(allCoins);
                            }
                            }else{
                                count++;
                                if(data.length==count){
                                    callback(allCoins);
                                }
                            }
                        }
                    })
                })
            }
        }
    })
})


/**
 * @description get all live Streaming durations of host for specific Agency;
 */



router.post('/Prevall-hostDurations/:getDays',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message,
            })
        }else{ 
            let count=0;
            let totalHours=0;
            let totalMinutes=0;
            let totalSeconds=0;
            let days=0;      
            doc.forEach(ele=>{
                PrevstartAndendDate(req.params.getDays).then(day=>{
                    LiveStreamingTable.getSpecificDuration(ele.user_id,day.startDay,day.lastDay,(err,docs)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            hoursAndCoins(docs).then(data=>{
                                let arr=data.durations.split(":");
                                let hours=Number(arr[0]);
                                let minutes=Number(arr[1]);
                                let seconds=Number(arr[2]);
                                days+=Number(data.days);
                                totalHours+=hours;
                                totalMinutes+=minutes;
                                totalSeconds+=seconds;
                                if(totalMinutes>=60){
                                    totalHours++;
                                    totalMinutes-=60;
                                }
                                else if(totalSeconds>=60){
                                    totalMinutes++;
                                    totalSeconds-=60;
                                }
                                count++;
                                if(count==doc.length){
                                    res.json({
                                        success:true,
                                        durations:`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`,
                                        days
                                    })
                                }
                            })
                        }
                    })
                })
            })
        }
    })

})


router.post('/all-hostDurations/:getDays',(req,res)=>{
    const {fieldNames,fieldValues}=req.body;
    HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message,
            })
        }else{ 
            let count=0;
            let totalHours=0;
            let totalMinutes=0;
            let totalSeconds=0;
            let days=0;      
            doc.forEach(ele=>{
                startAndendDate(req.params.getDays).then(day=>{
                    LiveStreamingTable.getSpecificDuration(ele.user_id,day.startDay,day.lastDay,(err,docs)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            hoursAndCoins(docs).then(data=>{
                                let arr=data.durations.split(":");
                                let hours=Number(arr[0]);
                                let minutes=Number(arr[1]);
                                let seconds=Number(arr[2]);
                                days+=Number(data.days);
                                totalHours+=hours;
                                totalMinutes+=minutes;
                                totalSeconds+=seconds;
                                if(totalMinutes>=60){
                                    totalHours++;
                                    totalMinutes-=60;
                                }
                                else if(totalSeconds>=60){
                                    totalMinutes++;
                                    totalSeconds-=60;
                                }
                                count++;
                                if(count==doc.length){
                                    res.json({
                                        success:true,
                                        durations:`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`,
                                        days
                                    })
                                }
                            })
                        }
                    })
                })
            })
        }
    })

})

// router.post('/all-hostDurations',(req,res)=>{
//     const {fieldNames,fieldValues}=req.body;
//     HostTable.getDataByFieldNames(fieldNames,fieldValues,(err,doc)=>{
//         if(err){
//             console.log(err.message)
//         }else{
//             let count=0;
//             getAllHostDurations(doc,(response)=>{
//                 res.json({
//                     success:true,
//                     msg:'All data fetch',
//                     data:response,
//                 })
//             })
//             function getAllHostDurations(data,callback){
//                 let totalHours=0;
//                 let totalMinutes=0;
//                 let totalSeconds=0;
//                 data.forEach(ele=>{
//                     LiveStreamingTable.getDataForDurationAndCoin(ele.user_id,(err,docs)=>{
//                         if(err){
//                             console.log(err.message)
//                         }else{
//                             count++;
//                             if(docs.length==0){
//                                 if(data.length==count){
//                                     callback(`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`)
//                                 }
//                             }else{
//                                 let c=0;
//                                 docs.forEach(e=>{
//                                     let date1=new Date(e.live_streaming_end_time);
//                                     let  date2=new Date(e.live_streaming_start_time);
//                                     let distance = Math.abs(date1 - date2);
//                                     const hours = Math.floor(distance / 3600000);
//                                     distance -= hours * 3600000;
//                                     const minutes = Math.floor(distance / 60000);
//                                     distance -= minutes * 60000;
//                                     const seconds = Math.floor(distance / 1000);
//                                     totalHours+=hours;
//                                     totalMinutes+=minutes;
//                                     totalSeconds+=seconds;
//                                     if(totalMinutes>=60){
//                                       totalHours++;
//                                       totalMinutes-=60;
//                                     }
//                                     else if(totalSeconds>=60){
//                                       totalMinutes++;
//                                       totalSeconds-=60;
//                                     }
//                                     c++;
//                                    if(data.length===count&&docs.length===c){
//                                     callback(`${totalHours<10?'0'+totalHours:totalHours}:${totalMinutes<10?'0'+totalMinutes:totalMinutes}:${totalSeconds<10?'0'+totalSeconds:totalSeconds}`)
//                                    }
//                                 })
//                             }
//                         }
//                     })
//                 })
//             }
//         }
//     })
// })


//<< Custom APIs Created By Ziggcoder//
router.post('/byCreatedBetween',
   // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const startdate = req.body.startdate;
        const enddate = req.body.enddate;
        TableModel.getDataByCreatedBetween(startdate, enddate, (err, docs) => {
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
//Custom APIs Created By Ziggcoder >>//


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
 * custom functions
 */

// function for updating data via user_id

router.put('/updateViaUserID/:id',
    //// passport.authenticate("jwt", { session: false }),
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


// for fetching the information

router.post('/loginFromAdminPanel',
    //// passport.authenticate("jwt", { session: false }),
    (req, res) => {

        var email = req.body.email;
        var password = req.body.password;
        TableModel.loginViaAdminPanel(email, password, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs!=null){
                    var t_user = {
                        id: docs._id,
                        username: docs.username,
                        agency_code: docs.agency_code,
                        email: docs.email,
                        special_approval_name:docs.special_approval_name
                      };
                      const token = jwt.sign(t_user, config.secret, {
                        expiresIn: 604800,
                      });
                      res.json({
                        success: true,
                        msg: "Welcome " + docs.username,
                        token: "JWT " + token,
                        user: t_user,
                      });
                }else{
                    res.json({
                        success:false,
                        msg:'Invalid Credentials'
                    })
                }
            }
        })
    }
);

module.exports = router;