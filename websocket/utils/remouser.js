const TableModel=require('../models/m_live_streaming_joined_users');

const removeUser=(users,live_streaming_id)=>{
  users.forEach(ele=>{
    const fieldNames=["live_streaming_id","joined_user_id"];
    const fieldValues=[live_streaming_id,ele.joined_user_id]
    TableModel.getDataByFieldNames(fieldNames,fieldValues,(err,docs)=>{
      if(err){
        console.log(err.message);
      }
      else{
        TableModel.updateRow(docs._id,{joined_user_id:"no"},(err,doc)=>{
          if(err){
            console.log(err.message);
          }else{
            console.log(doc);
          }
        })
      }
    })
  })
}

module.exports=removeUser;