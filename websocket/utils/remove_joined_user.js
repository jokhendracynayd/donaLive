function findallIndex(joinedAudience,livestreamingId){
  console.log("this is the joindaudience",joinedAudience);
  console.log("this is the livesteamingid",livestreamingId);
  let indexs=[];
  for(let i=0;i<joinedAudience.length;i++){
    if(joinedAudience[i].live_streaming_id==livestreamingId){
      indexs.push(i);
    }
  }
  return indexs;
}

module.exports=findallIndex;