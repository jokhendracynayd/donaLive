const mongoose = require("mongoose");

const TableName = "offical_talent";

const TableSchema = mongoose.Schema({
   
    
    user_id: {
        type: String,
        require:true,
        trim:true,
    },
    real_name: {
        require:true,
        type: String,
    },
    mobile_no: {
        type: String,
    },
    country: {
        type: String,
    },
    state: {
        type: String,
    },
    address: {
        type: String,
    },
    email: {
        type: String,
    },
    nationalIdNo: {
        type: String,
    },
    IDPicPath: {
        type: String,
    },
    holdingImageId: {
        type: String,
    },
    selfTakenPhoto: {
        type: String,
    },
    payment_recive_type: {
        type: String,
        enum: ['self', 'agency', 'tructedThirdParty']
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'online']
    },
    streaming_type:{
        type:String,
        enum:['video','audio','both']
    },
    cardImage: {
        type: String,
    },
    ifscCode: {
        type: String,
    },
    bankName: {
        type: String,
    },
    acc_Name: {
        type: String,
    },
    acc_Number: {
        type: String,
    },
    agencyId: {
        type: String,
    },
    host_status: {
        type: String,
        enum:['pending','accepted','rejected','deleted'],
        default:"pending"
    },
    created_at: {
        type: String,
    },
    created_by: {
        type: Date,
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
    newRow.created_at = new Date();
    newRow.save(callback);
};

module.exports.updateRow = (id, newData, callback) => {
    newData.last_update = new Date();
    Table.findByIdAndUpdate(id, { $set: newData },{new:true}, callback);
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

