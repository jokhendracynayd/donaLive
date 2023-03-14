const mongoose = require("mongoose");

const TableName = "transaction";

const TableSchema = mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    unique: true,
  },
  transaction_type: {
    type: String,
    enum: ["credited", "debited"],
    required: true,
  },
  transaction_amount: {
    type: Number,
    required: true,
  },
  transaction_status: {
    type: String,
    enum: ["pending", "success", "failed","refund"],
    required: true,
  },
  transaction_date: {
    type: Date,
    required: true,
  },
  sender_type: {
    type: String,
    enum: ["self","user", "admin","reseller","agency"],
    required: true,
  },
  receiver_type: {
    type: String,
    enum: ["self","user", "admin","reseller","agency"],
    required: true,
  },
  sender_id: {
    type: String,
    required: true,
  },
  receiver_id: {
    type: String,
    required: true,
  },
  current_balance: {
    type: Number,
  },
  user_wallet_type_from: {
    type: String,
    enum: ["diamonds", "r-coins","coins"],
    required: true,
  },
  user_wallet_type_to: {
    type: String,
    enum: ["diamonds", "r-coins","coins"],
    required: true,
  },
  entity_type:{
    type:Object,
    required:true,
  },
  last_update: {
    type: Date,
  },

});

const Table = (module.exports = mongoose.model(TableName, TableSchema));
module.exports.addRow = (newRow, callback) => {
    newRow.last_update=new Date();
    newRow.save(callback);
};

module.exports.updateOneField=(id,newData,callback)=>{
  Table.findByIdAndUpdate(id,{$set:newData},{new:true},callback);
}

module.exports.updateCount=(id,newData,callback)=>{
  Table.findByIdAndUpdate(id,{$set:newData},{new:true},callback);
}

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
