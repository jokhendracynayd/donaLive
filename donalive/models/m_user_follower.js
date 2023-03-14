const { query } = require("express");
const mongoose = require("mongoose");
const rc=require("../controllers/responseController")

const TableName = "user_follower";

const TableSchema = mongoose.Schema({
   

    primary_userId: {
        type: String,
        required: true,
        trim: true
    },
    follower_userID: {
        type: String,
        required: true,
        trim: true
    },
    last_update: {
        type: String,
    },
    created_at: {
        type: String,
    },
    created_by: {
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
    Table.findByIdAndUpdate(id, { $set: newData }, callback);
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

    // Table.find({})
    Table.aggregate([{$match:query}],callback)
    // Table.find(query, callback).count();
};
module.exports.findNoOfFollower=(fieldName,fieldValue,callback)=>{
    let query={};
    query[fieldName]=fieldValue;
    Table.find(query,callback)
}
module.exports.removeByFieldName=async(res,query)=>{
    try{
        const result=await Table.deleteOne(query);
        return rc.setResponse(res,{
            success:true,
            msg:"made unfollow",
            data:result,
        })
    }catch (err){
        return rc.setResponse(res,{
            msg:err.message
        })
    }
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

/** 
 * custom routes
 */

 module.exports.findFollowerOption = (PrimaryUser, SecondaryUser, callback) => {
        // console.log(PrimaryUser, SecondaryUser)

    Table.findOne({primary_userId:PrimaryUser,  follower_userID: SecondaryUser}, callback);
};