const uniqueUserCheck=(data)=>{
  let users=[];
  data.users.forEach(ele=>{
    users.push(ele.user_id);
  })
  let temp=new Set(users);
  if(temp.size<=5){
    return true;
  }
  return false;
}

const response=(WiningAmount,winner,callback)=>{
  let TopUserWinner=[];
  var count=0;
  for(let prop in WiningAmount){
    count++;
    let temp={};
    temp[prop]=WiningAmount[prop].WinAmount;
    TopUserWinner.push(temp);
    TopUserWinner.sort((a,b)=>{
      return b[Object.keys(b)[0]]-a[Object.keys(a)[0]];
    })
    TopUserWinner=TopUserWinner.slice(0,3);
  }
  if(WiningAmount.leght==count){
    callback(TopUserWinner,winner)
  }
}


module.exports={uniqueUserCheck,response};