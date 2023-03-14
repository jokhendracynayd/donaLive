const { update, after } = require("lodash");
const mongoose = require("mongoose");

const TableName = "user_wallet_balance";

const TableSchema = mongoose.Schema({
   
   
    user_id: {
        type: String,
        required: true,
        trim: true,
        unique:true
    },
    user_diamond: {
        type: Number,
        required: true,
        trim: true
    },
    user_rcoin: {
         type: Number,
        required: true,
        trim: true    
    },
    user_coin: {
         type: String,
        // required: true,
        trim: true   
     },
     created_at: {
        type: String,
    },
    created_by: {
        type: String,
    },
    last_update: {
        type: String,
    },
    delete_status: {
        type: String,
    },

});

const Table = (module.exports = mongoose.model(TableName, TableSchema));

const OldTable = mongoose.model("old" + TableName, TableSchema);

module.exports.addRow = (newRow, callback) => {
    newRow.created_at = Date.now();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = Date.now();
    Table.findByIdAndUpdate(id, { $set: newData },{new:true}, callback);
};




/**
 * 
 * @description this is written by jokhendra
 */

module.exports.findDatabyFiled=(query,callback)=>{
    Table.find({$or:query},callback)

}

module.exports.upadateByfieldName=(fieldName,newData,callback)=>{
    Table.findOneAndUpdate(fieldName,{$set:newData},{new: true},callback)
}
/**
 * 
 * @description this for update the document byfieldname @jokhendra
 */


module.exports.findAndUpdateBalance=(filter,balance,callback)=>{
    Table.updateOne(filter,{$inc:{user_diamond:balance}},{new:true},callback)
}
module.exports.findAndUpdateBalanceRcoin=(filter,balance,callback)=>{
    Table.updateOne(filter,{$inc:{user_rcoin:balance}},{new:true},callback)
}


module.exports.getData = callback => {
    Table.find(callback);
};

module.exports.getDataById = (id, callback) => {
    Table.findById(id, callback);
};

module.exports.getTopUser=(callback)=>{
    Table.aggregate([{
        $lookup: {
            from: "user_logins", // collection name in db
            localField: "user_id",
            foreignField: "username",
            as: "details"
        }
    }]).sort({user_rcoin:-1}).limit(10).exec(callback)
}

module.exports.getDataByFieldName = (fieldName, fieldValue, callback) => {
    let query = {};
    query[fieldName] = fieldValue;
    Table.findOne(query, callback);
};

// Table.findOneAndUpdate

module.exports.getDataByField=async(query,callback)=>{
    Table.findOne(query,callback);
}
module.exports.oldBalance=(query,callback)=>{
    OldTable.findOne(query,callback);
}

module.exports.getDataByFieldNames = (fieldNames, fieldValues, callback) => {
    let query = {};
    for (let i = 0; i < fieldNames.length; i++) {
        const fieldName = fieldNames[i];
        const fieldValue = fieldValues[i];
        query[fieldName] = fieldValue;
    }
    Table.find(query, callback);
};

module.exports.movetoOldTable = (id, callback) => {
    Table.findById(id,(err,doc)=>{
        if(err){
            callback(err,null);
        }else{  
            if(!doc){
                callback(err,doc);
            }else{
                OldTable.insertMany(doc).then(val=>{
                    Table.findByIdAndUpdate(id,{$set:{user_rcoin:0}},{new:true},callback)
                }).catch(reason=>{
                    callback(reason,null);
                })
            }
        }
    });
};

module.exports.deleteTableById = (id, callback) => {
    Table.findById(id, (err, doc) => {
        if (err) {
            callback(err, null);
        } else {
            if (!doc) {
                callback(err, doc);
            } else {
                const dataToDel = new OldTable(doc);
                OldTable.insertMany(doc)
                    .then(val => {
                        Table.findByIdAndDelete(id, callback);
                    })
                    .catch(reason => {
                        callback(reason, null);
                    });
            }
        }
    });
};

