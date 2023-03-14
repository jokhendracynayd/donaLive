const express = require('express');
const router = express.Router();
const TableModel = require('../models/m_user_login');
const rc = require('./../controllers/responseController');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/database");
const TableModelUserInfo = require('../models/m_user_info');
const TableModelUserBalance=require('../models/m_user_wallet_balance');
const CounterTableModel=require('../models/counter')
const {hashPassword} = require('../controllers/passwordHash');
const {getNextSequenceValue}=require('../utilis/idIncreament')
const {sendSms,verifyDonalive}=require('../controllers/smsController')


router.post('/create',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        // const newRow = req.body;
        console.log(req.body);

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


//  This for admin panel

router.get('/adminUser',(req,res)=>{
    TableModel.adminUser((err, docs) => {
        if (err) {
            return rc.setResponse(res, {
                msg: err.message
            })
        } else {
          res.json({
            success:true,
            msg:"data fetched",
            data:docs
          })
        }
    })
})


router.get('/newadminUser',(req,res)=>{
    TableModel.getData((err, docs) => {
        if(err){
            return rc.setResponse(res, {
                msg: err.message
            })
        }else{
            setUserCoin(docs,(response)=>{
                return rc.setResponse(res,{
                    success:true,
                    msg:'data fetched',
                    data:response
                })
            })
            function setUserCoin(data,callback){
                let count=0;
                let sendToData=[];
                data.forEach(ele=>{
                    let query={"user_id":ele.username}        
                    TableModelUserBalance.getDataByField(query,(err,doc)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }else{
                            if(doc!=null){
                                ele._doc.r_coin=doc.user_rcoin;
                                sendToData.push(ele);
                                count++;
                                if(data.length==count){
                                    callback(sendToData);
                                }
                            }else{
                                ele.r_coin=0;
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
    });
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
                    return res.json({
                        success:true,
                        msg:"No user found",
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
        TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                if(docs.length==0){
                    return rc.setResponse(res, {
                        success: true,
                        msg: 'Data Fetched',
                        data: docs
                    });
                }
                else{
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

/** 
 * route for creating users using email, mobile and social login
 */

/**
 * creating account using email address and password
 */

router.post('/createNewUser', (req, res, next) => {
    const {email,mobile,password,cpassword}=req.body;
    if((email==null || email==undefined || email=="") ||
    (mobile==null || mobile==undefined || mobile=="") || (password==null || password==undefined || password=="" )
    || (cpassword==null || cpassword==undefined || cpassword=="")){
        return res.json({
            success:false,
            msg:"All fields are required"
        }) 
    }else{
        TableModel.getDataByFieldName("email",email,(err,docs)=>{
            if(err){
                res.json({
                    success:false,
                    msg:err.message
                })
            }else{
                if(docs.length>0){
                    res.json({
                        success:false,
                        msg:"User already exists"
                    })
                }else{
                    if(password===cpassword){
                        hashPassword(password).then((hash)=>{
                            getNextSequenceValue().then((seq)=>{
                                let dona_user=new TableModel({
                                    username:seq,
                                    email:email.toLowerCase(),
                                    mobile:mobile,
                                    password:password,
                                    hashPassword:hash
                                })
                                TableModel.addRow(dona_user,(err,doc)=>{
                                    if(err){
                                        res.json({
                                            success:false,
                                            msg:err.message
                                        })
                                    }
                                    else{
                                        if(doc!=null){
                                            const user_balace=new TableModelUserBalance({
                                                user_id:doc.username,
                                                user_diamond:'0',
                                                user_rcoin:'0',
                                            })
                                            TableModelUserBalance.addRow(user_balace,(err,docs)=>{
                                                if(err){
                                                    TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
                                                        if(err){
                                                            res.json({
                                                                success:false,
                                                                msg:err.message
                                                            })
                                                        }else{
                                                            res.json({
                                                                success:false,
                                                                msg:"User not created"
                                                            });
                                                        }
                                                    })
                                                }else{
                                                    if(docs!=null){
                                                        res.json({
                                                            success:true,
                                                            msg:"User created successfully",
                                                            data:{newId:doc._id}
                                                        })
                                                    }else{
                                                        TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
                                                            if(err){
                                                                res.json({
                                                                    success:false,
                                                                    msg:err.message
                                                                })
                                                            }else{
                                                                res.json({
                                                                    success:false,
                                                                    msg:"User not created"
                                                                });
                                                            }
                                                        })   
                                                    }
                                                }
                                            })
                                        }else{
                                            res.json({
                                                success:false,
                                                msg:"User not created"
                                            });
                                        }
                                    }
                                })
                            }).catch((err)=>{
                                res.json({
                                    success:false,
                                    msg:err.message
                                });
                            });
                        }).catch((err)=>{
                            res.json({
                                success:false,
                                msg:err.message
                            });
                        })
                    }
                    else{
                        res.json({
                            success:false,
                            msg:"password not matched"
                        })
                    }
                }
            }
        });
    }
});

router.post('/sendOtp', sendSms,(req, res) => {
    res.json({
        success:true,
        msg:"Otp sent successfully",
        data:req.body.verification
    })
})


router.post('/createAndLoginUser',verifyDonalive, (req, res) => {
    const {mobile}=req.body;
    TableModel.getDataByFieldName("mobile",mobile,(err,docs)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            if(docs.length>0){
                var t_user = {
                    id: docs._id,
                 
                    username: docs[0].username,
                    mobile: docs[0].mobile,
                    email: docs[0].email?docs[0].email:"email not provided",
                  };
                  const token = jwt.sign(t_user, config.secret, {
                    expiresIn: 604800,
                  });
                  res.status(200).json({
                    success: true,
                    msg: "Welcome " + docs[0].username,
                    token: "JWT " + token,
                    user: t_user,
                  });
            }else{
                getNextSequenceValue()
                .then((seq)=>{
                    let dona_user=new TableModel({
                        username:seq,
                        mobile:mobile,
                        account_create_method:"otpLogin"
                    })
                    TableModel.addRow(dona_user,(err,doc)=>{
                        if(err){
                            res.json({
                                success:false,
                                msg:err.message
                            })
                        }
                        else{
                            if(doc!=null){
                                const user_balace=new TableModelUserBalance({
                                    user_id:doc.username,
                                    user_diamond:'0',
                                    user_rcoin:'0',
                                })
                                TableModelUserBalance.addRow(user_balace,(err,docs)=>{
                                    if(err){
                                        TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
                                            if(err){
                                                res.json({
                                                    success:false,
                                                    msg:err.message
                                                })
                                            }else{
                                                res.json({
                                                    success:false,
                                                    msg:"User not created"
                                                });
                                            }
                                        })
                                    }else{
                                        if(docs!=null){
                                            res.json({
                                                success:true,
                                                msg:"User created successfully",
                                                data:{newId:doc._id}
                                            })
                                        }else{
                                            TableModel.getByIdAndDelete(doc._id,(err,dc)=>{
                                                if(err){
                                                    res.json({
                                                        success:false,
                                                        msg:err.message
                                                    })
                                                }else{
                                                    res.json({
                                                        success:false,
                                                        msg:"User not created"
                                                    });
                                                }
                                            })   
                                        }
                                    }
                                })
                            }else{
                                res.json({
                                    success:false,
                                    msg:"User not created"
                                });
                            }
                        }
                    })
                })
                .catch((err)=>{
                    res.json({
                        success:false,
                        msg:err
                    })
                })
            }
        }
    })
})

//TODO: get top users

router.get('/top-users', (req, res) => {
    TableModelUserBalance.getTopUser((err,docs)=>{
        if(err){
            res.json({
                success:false,
                msg:err.message
            })
        }else{
            res.json({
                success:true,
                msg:"Top users",
                data:docs
            })
        }
    })
})


 router.post('/createUser', (req, res, next) => {
                    bcrypt.hash(req.body.password, 10, (err, hash) => {
                        if (err) {
                            res.json({
                                success: false,
                                msg: "error!",
                                data: err.message
                            })
                        } else {
                            CounterTableModel.findOneAndUpdate(
                                {count_id:'autoInc'},
                                {"$inc":{'seq':1}},
                                {new:true},
                                (err,document)=>{
                                    if(err){
                                        console.log(err.message)
                                    }else{
                                        let seqId;
                                        if(document==null){
                                            const newCounter=new CounterTableModel(
                                                {count_id:'autoInc'},
                                                {seq:111111}
                                            )
                                            newCounter.save();
                                            seqId=111111;
                                            const user_balace=new TableModelUserBalance({
                                                user_id:seqId,
                                                user_diamond:'0',
                                                user_rcoin:'0',
                                            })
                                            TableModelUserBalance.addRow(user_balace,(err,doc)=>{
                                                if(err){
                                                    console.log(err.message);
                                                }else{
                                                    console.log("data saved");
                                                }
                                            })
                                            let dona_user=new TableModel({
                                                username:seqId,
                                                email:req.body.email.toLowerCase(),
                                                mobile:req.body.mobile,
                                                password:req.body.password,
                                                hashPassword:hash
                                            })
                                            TableModel.addRow(dona_user,(err,dc)=>{
                                                if(err){
                                                    res.json({
                                                        success:false,
                                                        msg:err.message
                                                    })
                                                }
                                                else{
                                                    res.json({
                                                        success:true,
                                                        msg:"User created successfully",
                                                        data:{newId:dc._id}
                                                    })
                                                }
                                            })
                                        }
                                        else{
                                            const user_balace=new TableModelUserBalance({
                                                user_id:document.seq,
                                                user_diamond:'0',
                                                user_rcoin:'0',
                                            })
                                            TableModelUserBalance.addRow(user_balace,(err,doc)=>{
                                                if(err){
                                                    console.log(err.message);
                                                }else{
                                                    console.log("data saved");
                                                }
                                            })
                                            let dona_user=new TableModel({
                                                username:document.seq,
                                                email:req.body.email.toLowerCase(),
                                                mobile:req.body.mobile,
                                                password:req.body.password,
                                                hashPassword:hash
                                            })
                                            TableModel.addRow(dona_user,(err,dc)=>{
                                                if(err){
                                                    res.json({
                                                        success:false,
                                                        msg:err.message
                                                    })
                                                }
                                                else{
                                                    res.json({
                                                        success:true,
                                                        msg:"User created successfully",
                                                        data:{newId:dc._id}
                                                    })
                                                }
                                            })
                                        }
                                    }
                                }
                            )
                }
     });
});

/**
 * api for users login
 */
// login
router.post("/login", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    TableModel.getSingleDataByFieldName("email", email, (err, user) => {
      if (err) {
        res.status(200).json({ success: false, msg: "error ocurred", err: err });
      } else {
        if (user) {
          TableModel.comparePassword(
            password,
            user.hashPassword,
            (err, isMatch) => {
              if (err) {
                // // console.log(err);
                res
                  .status(200)
                  .json({ success: false, msg: "error ocurred", err: err });
              }
              if (isMatch) {
                var t_user = {
                    id: user._id,
                 
                    username: user.username,
                    mobile: user.mobile,
                    email: user.email,
                  };
                  const token = jwt.sign(t_user, config.secret, {
                    expiresIn: 604800,
                  });
                  res.status(200).json({
                    success: true,
                    msg: "Welcome " + user.username,
                    token: "JWT " + token,
                    user: t_user,
                  });
              } else {
                res.status(200).json({ success: false, msg:"wrong password"});
              }
            }
          );
        } else {
          res.status(200).json({ success: false, msg: "User not found" });
        }
      }
    });
  });
router.put('/createNewPassword/:id',
// passport.authenticate("jwt", { session: false }),
(req, res) => {

    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            res.json({
                success: false,
                msg: "error!",
                data: err.message
            })
        } else {

        // pushing hash in body
        req.body.hashPassword = hash;
        TableModel.updateRow(req.params.id, req.body, (err, docs) => {
            if (err) {
                return rc.setResponse(res, {
                    msg: err.message
                })
            } else {
                return rc.setResponse(res, {
                    success: true,
                    msg: 'Data Updated',
                    data: docs._id
                });
            }
        })
    }
    })
});


/**
 * Social Authentication using google
 */


 router.post('/SocialAuthentication',async (req, res, next) => {
    let AccountAvailableStatus = '';  
    const authenticationMethod = req.body.authMethod;
    const email1 = req.body.email;
    const profile_pic = req.body.user_profile_pic
    var username1 = '';
    var account_create_method1 = '';
    let username;
    await CounterTableModel.findOneAndUpdate(
        {count_id:'autoInc'},
        {"$inc":{'seq':1}},
        {new:true},
        (err,document)=>{
            username=document.seq;
        })

    if(authenticationMethod === 'google'){

        username1 = req.body.email;
        account_create_method1 = 'google_auth_method';

    }

    /**
     * searching for the username is available in database or not, if the username is available in the database, then login otherwise register the data
     */

        userAvailabilty(username1, function(response){
            console.log(response);
        AccountAvailableStatus = response;
            
            if(AccountAvailableStatus === 'yes'){

                /**
                 * if the account is available in the database, then login the user
                 */
                    TableModel.getSingleDataByFieldName("email", email1, (err, user) => {
                        if (err) {
                        res.status(200).json({ success: false, msg: "error occured", err: err });
                        } else {
                            
                            var t_user = {
                                id: user._id,
                                username: user.username,
                                mobile: user.mobile,
                                email: user.email,
                                };
                                const token = jwt.sign(t_user, config.secret, {
                                expiresIn: 604800,
                                });
                                res.status(200).json({
                                success: true,
                                msg: "Welcome " + user.username,
                                token: "JWT " + token,
                                user: t_user,
                                });
                                
                        }
                    });
    }else{
                 const user_balace=new TableModelUserBalance({
                        user_id:username,
                        user_diamond:'0',
                        user_rcoin:'0',
                    })
                    TableModelUserBalance.addRow(user_balace,(err,doc)=>{
                        if(err){
                            console.log(err.message);
                        }else{
                            console.log("data saved");
                        }
                    })


                const dona_user = new TableModel({
            
                    username: username,
                    email: email1,
                    account_create_method: account_create_method1,
                    gmail_token: username1,
            user_profile_pic: profile_pic,
                });

                TableModel.addRow(dona_user, (err, doc) => {
                    if (err) {
                        res.json({
                            success: false,
                            msg: "Error While Creating User. Try Again!",
                            data: err.message
                        })
                    } else {

                        // if the user account is created successfully then login the user with token
                        
                var t_user = {
                                id: doc._id,
                                username: doc.username,
                                mobile: doc.mobile,
                                email: doc.email,
                                };
                                const token = jwt.sign(t_user, config.secret, {
                                expiresIn: 604800,
                                });
                                res.status(200).json({
                                success: true,
                                msg: "Welcome " + doc.username,
                                token: "JWT " + token,
                                user: t_user,
                                });
                    }
                })

        }
    })

 
 });


/**
 * API for registrating and login with mobile
 */


 /**
  * function for checking google user existenece
  */
 function userAvailabilty(username1,callback){

    TableModel.getDataByFieldName('email', username1, (err, docs) => {
        if (err) {
            
          console.log('i am here with err');
          return  callback('no');
        } else {
            if(docs == ''){
                
          console.log('i am here with no');
                return callback('no');
            }else{
                
                console.log('i am here with yes');
                return callback('yes');
            }
           
        }
    })

 }

 /**
  * router for seaeching user info using mobile, email, and username
  */
  router.post('/searchingViaUsernameMobileEmail',
  // passport.authenticate("jwt", { session: false }),
  (req, res, next) => {
      const searchString = req.body.searchString;
      var errors = [];
      var finalData = new Array();
      var responsegg = 'no';
      var itemsProcessed = 0;

      console.log(req.body);
      TableModel.searchingViaUsernameMobileEmail(searchString, (error, docs) => {
          if (error) {
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


// function for updating data via user_id

router.put('/updateViaUserID/:id',
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

router.get('/getDetailsViaUserID/:id',
    // passport.authenticate("jwt", { session: false }),
    (req, res) => {
        const id = req.params.id;
        TableModel.getDataByUserId(id, (err, doc) => {
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

module.exports = router;