const mongoose=require("mongoose");

const tablName="student";

const TableSchema=new mongoose.Schema({
  name:{
    type:String
  },
  collage:{
    type:String
  }
})

const Table=mongoose.model("student",TableSchema);

module.exports=Table;