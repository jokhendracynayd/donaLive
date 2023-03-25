const cron=require('node-cron');
const LiveStreamingTableModel = require('../models/m_live_streaming');
const TableModelTeenPatti=require('../models/teen_pati/m_game_teen_pati')
const TableModel = require('../models/teen_pati/m_game_teen_pati');
const axios =require('axios');



// cron.schedule('*/40 * * * * *',()=>{
//   var dt;
//   Today = new Date();
//   dt = Today.getTime();
//   dt = dt-1326416267200;
//   var shortNumber = dt+"";
//   game_id = shortNumber.substring(1, shortNumber.length-2);
//   const newRow = new TableModel({
//     game_id:game_id,
//   });
//   TableModel.addRow(newRow,(err,doc)=>{
//     if(err){
//       console.log(err.message);
//     }else{
//       // console.log(doc);
//     }
//   })
// })

// cron.schedule('*/30 * * * * *',()=>{
//   TableModel.getDataByFieldName("game_status","active",(err,docs)=>{
//     if(err){
//       console.log(err.message);
//     }else{
//       if(docs.length!=0){
//         axios.get(`https://3.7.87.3:3000/api/teen-pati/winner-announcement/${docs[0]._id}`).then((response)=>{
//           // console.log(response.data);
//         }).catch((err)=>{
//           console.log(err);
//         })
//       }
//     }
//   })
// });

// cron.schedule('*/15 * * * * *',()=>{
//   // console.log('this is scheduler');
//   LiveStreamingTableModel.cronJobStatus((err,doc)=>{
//     if(err){
//       console.log(err.message);
//     }else{
//       checkLastUpdate(doc,(response)=>{
//         // console.log(response)
//       })
//       function checkLastUpdate(data,callback){
//         let count=0;
//         let sendToData=[];
//         data.forEach(ele=>{
//           let date1=new Date();
//           let date2=ele.last_update;
//           date2=new Date(date2)
//           let distance = Math.abs(date1 - date2);
//           const hours = Math.floor(distance / 3600000);
//           distance -= hours * 3600000;
//           const minutes = Math.floor(distance / 60000);
//           distance -= minutes * 60000;
//           const seconds = Math.floor(distance / 1000);
//           if(seconds>=12){
//             let newData={live_streaming_current_status:'ended',live_streaming_end_time:new Date()}
//             LiveStreamingTableModel.updateRow(ele.id,newData,(err,doc)=>{
//               if(err){
//                 console.log(err.message);
//               }else{
//                 console.log('Live Streaming is ended by corn at',new Date() );
//                 // console.log(doc)
//               }
//             }) 
//           }
//           sendToData.push(ele.last_update);
//           count++;
//           if(data.length==count){
//             callback(sendToData);
//           }
//         })
//       }
     
//     }
//   })
// })

cron.schedule('*/1 * * * * *',()=>{
  TableModelTeenPatti.getDataByFieldName("game_status","active",(err,doc)=>{
    if(err){
      console.log(err.message);
    }else{
      if(doc.length!==0){  
        let count=doc[0].game_last_count;
        if(count>0){
          TableModelTeenPatti.updateCount(doc[0]._id,{game_last_count:--count},(err,docs)=>{
            if(err){
              console.log(err.message);
            }else{
              // console.log(docs);
            }
          })
        }
      }
    }
  })

})
