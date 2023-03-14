const TableModelAgency=require('../models/m_agency_info');
const jwt = require('jsonwebtoken');
const config= require('../config/database')
var agency_authentication=(req,res,next)=>{
  let agency_token;
  const {authorization}=req.headers;
  agency_token=authorization.split(' ')[1];
  const {id,username,agency_code,email,special_approval_name}=jwt.verify(agency_token,config.secret);
  let agency_id=id;
  let agency_username=username;
  let agency_c=agency_code;
  let agency_email=email;
  let agency_name=special_approval_name;
  TableModelAgency.getDataById(agency_id,(err,docs)=>{
    if(err){
      console.log(err.message);
    }else{
      if(docs==null){
        res.json({
          success:false,
          msg:"Unauthorized Agecny"
        })
      }else{
        if(agency_id==docs._id && agency_username==docs.username && agency_c==docs.agency_code && agency_email==docs.email && agency_name==docs.special_approval_name){
          next();
        }else{
          res.json({
            success:false,
            msg:"Unautherized user"
          })
        }
      }
    }
  })
}

module.exports =agency_authentication;