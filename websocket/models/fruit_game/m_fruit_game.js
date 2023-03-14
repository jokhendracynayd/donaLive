const mongoose = require("mongoose");

const TableName = "fruit_spin";

const TableSchema = mongoose.Schema({
   game_id:{
    type:String,
    required:true,
    unique:true,
   },
   seat:{
    Apple_total_amount:{
      type:Number,
      required:true,
      default:0,
    },
    Mango_total_amount:{
      type:Number,
      required:true,
      default:0
    },
    Strawberry_total_amount:{
      type:Number,
      required:true,
      default:0,
    }
   },
   game_last_count:{
    type:Number,
    default:10,
   },
   users:{
    type:Array,
   },
   game_status:{
    type:String,
    enum:["active","ended"],
    default:"active"
   },
   winnedSeat:{
    type:String,
   },
   created_at:{
    type:Date
   },
   last_update:{
    type:Date
   }
});

const Table = (module.exports = mongoose.model(TableName, TableSchema));
module.exports.addRow = (newRow, callback) => {
    newRow.created_at = Date.now();
    newRow.last_update=Date.now();
    newRow.save(callback);
};

module.exports.updateOneField=(id,newData,callback)=>{
  Table.findByIdAndUpdate(id,{$set:newData},{new:true},callback);
}

module.exports.updateRow = (id, setSeatAmount,pushUser, callback) => {
Table.findByIdAndUpdate(id, { $push:{"users":pushUser},$set:{seat:setSeatAmount,last_update:Date.now()}},{new:true}, callback);
};

module.exports.getData = callback => {
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.find(query, callback);
};

module.exports.getDataByFieldNames = (fieldNames, fieldValues, callback) => {
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    Table.find(query, callback);
};

module.exports.deleteTableById=(id,callback)=>{
   Table.findByIdAndRemove(id,callback);
}
