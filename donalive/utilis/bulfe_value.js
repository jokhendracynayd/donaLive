// TODO: Make bulfe Amount in always increasing value than previese value

function createBulfeAmount(data){
  return new Promise((resolve, reject) => {
    let bulfe=[];
    bulfe.push(Math.floor(Math.random()*data.seat.A_total_amount+1))
    bulfe.push(Math.floor(Math.random()*data.seat.B_total_amount+1))
    bulfe.push(Math.floor(Math.random()*data.seat.C_total_amount+1))
    resolve(bulfe);
  });
}

module.exports = {createBulfeAmount};

