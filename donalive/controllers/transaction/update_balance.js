const TableModelBalance = require("../../models/m_user_wallet_balance");
const TableModelTransaction = require("../../models/m_transaction");
const { boat_generate } = require("../../utilis/boat_generate");

function updateBalance(data) {
  return new Promise((resolve, reject) => {
    TableModelBalance.getDataByField(
      { user_id: data.sender_id },
      (err, doc) => {
        if (err) {
          reject({
            success: false,
            msg: err.message,
          });
        } else {
          if (!doc) {
            reject({
              success: false,
              msg: "No data found",
            });
          } else {
            if (doc.user_diamond < data.transaction_amount) {
              reject({
                success: false,
                msg: "Insufficient balance",
              });
            } else {
              TableModelBalance.updateRow(
                doc._id,
                { user_diamond: doc.user_diamond - data.transaction_amount },
                (err, doc) => {
                  if (err) {
                    data.transaction_status = "failed";
                    const newRow = new TableModelTransaction(data);
                    TableModelTransaction.addRow(newRow, (err, doc) => {
                      if (err) {
                        reject({
                          success: false,
                          msg: err.message,
                        });
                      } else {
                        if (!doc) {
                          reject({
                            success: false,
                            msg: "No data found",
                          });
                        } else {
                          resolve({
                            success: false,
                            msg: "Something went wrong balance not updated",
                          });
                        }
                      }
                    });
                  } else {
                    data.transaction_status = "success";
                    const newRow = new TableModelTransaction(data);
                    TableModelTransaction.addRow(newRow, (err, docs) => {
                      if (err) {
                        TableModelBalance.updateRow(
                          doc._id,
                          {
                            user_diamond:
                              doc.user_diamond + data.transaction_amount,
                          },
                          (err, doc) => {
                            if (err) {
                              reject({
                                success: false,
                                msg: err.message,
                              });
                            } else {
                              data.transaction_status = "refund";
                              const newRow = new TableModelTransaction(data);
                              TableModelTransaction.addRow(
                                newRow,
                                (err, doc) => {
                                  if (err) {
                                    reject({
                                      success: false,
                                      msg: err.message,
                                    });
                                  } else {
                                    if (!doc) {
                                      reject({
                                        success: false,
                                        msg: "No data found",
                                      });
                                    } else {
                                      resolve({
                                        success: false,
                                        msg: "Something went wrong balance not updated",
                                      });
                                    }
                                  }
                                }
                              );
                            }
                          }
                        );
                      } else {
                        if (!docs) {
                          TableModelBalance.updateRow(
                            doc._id,
                            {
                              user_diamond:
                                doc.user_diamond + data.transaction_amount,
                            },
                            (err, doc) => {
                              if (err) {
                                reject({
                                  success: false,
                                  msg: err.message,
                                });
                              } else {
                                data.transaction_status = "refund";
                                const newRow = new TableModelTransaction(data);
                                TableModelTransaction.addRow(
                                  newRow,
                                  (err, doc) => {
                                    if (err) {
                                      reject({
                                        success: false,
                                        msg: err.message,
                                      });
                                    } else {
                                      if (!doc) {
                                        reject({
                                          success: false,
                                          msg: "No data found",
                                        });
                                      } else {
                                        resolve({
                                          success: false,
                                          msg: "Something went wrong balance not updated",
                                        });
                                      }
                                    }
                                  }
                                );
                              }
                            }
                          );
                        } else {
                          resolve({
                            success: true,
                            msg: "Balance updated successfully",
                          });
                        }
                      }
                    });
                  }
                }
              );
            }
          }
        }
      }
    );
  });
}

function creditBalance(data, winner, id) {
  return new Promise(async (resolve, reject) => {
    if (data.length == 0) {
      await boat_generate(winner).then((result) => {
        resolve(result)
        // console.log("result", result);
      });
    } else {
      // console.log("data", data);
      let count = 0;
      let sendToData = {};
      data.forEach((ele) => {
        if (`${ele.user_id}` in sendToData) {
          sendToData[`${ele.user_id}`].BetAmount += Number(ele.amount);
          sendToData[`${ele.user_id}`].WinAmount += Number(ele.amount) * 2.9;
        } else {
          sendToData[`${ele.user_id}`] = {
            BetAmount: Number(ele.amount),
            WinAmount: Number(ele.amount) * 2.9,
          };
        }
        var transaction_id;
        transaction_id = new Date().getTime().toString();
        let dataCreate = {
          transaction_id: transaction_id,
          transaction_type: "credited",
          transaction_amount: ele.amount * 2.9,
          transaction_status: "pending",
          transaction_date: new Date(),
          sender_type: "user",
          receiver_type: "user",
          sender_id: ele.user_id,
          receiver_id: id,
          user_wallet_type_from: "diamonds",
          user_wallet_type_to: "diamonds",
          entity_type: {
            type: "game",
            game_id: id,
            game_name: "fruit",
          },
        };
        TableModelBalance.findAndUpdateBalance(
          { user_id: ele.user_id },
          ele.amount * 2.9,
          async (err, doc) => {
            if (err) {
                dataCreate.transaction_status = "failed";
              const newRow = new TableModelTransaction(dataCreate);
              TableModelTransaction.addRow(newRow, (err, doc) => {
                if (err) {
                //   console.log("err", err);
                } else {
                  if (!doc) {
                    
                  } else {
                    // console.log("doc", doc);
                  }
                }
              });
            } else {
              if (!doc) {
                dataCreate.transaction_status = "failed";
                const newRow = new TableModelTransaction(dataCreate);
                TableModelTransaction.addRow(newRow, (err, doc) => {
                  if (err) {
                    // console.log("err", err);
                  } else {
                    // console.log("doc", doc);
                    // resolve({
                    //     success: false,
                    //     msg: "Something went wrong balance not updated",
                    // });
                  }
                });
              } else {
                dataCreate.transaction_status = "success";
                const newRow = new TableModelTransaction(dataCreate);
                TableModelTransaction.addRow(newRow, (err, doc) => {
                    if(err){
                        // console.log("err",err)
                    }else{
                        // console.log("doc",doc)
                    }
                });
              }
              count++;
              if (data.length == count) {
                let TopUserWinner=[];
                    for(let prop in sendToData){
                      let temp={};
                      temp[prop]=sendToData[prop].WinAmount;
                      TopUserWinner.push(temp);
                    }
                    TopUserWinner.sort((a,b)=>{
                      return b[Object.keys(b)[0]]-a[Object.keys(a)[0]];
                    })
                    TopUserWinner=TopUserWinner.slice(0,3);
                    resolve({WiningAmount:sendToData,TopUserWinner,winnedSeat:winner,winnerAnnounced:"yes",game_status:"ended"})
                // console.log("sendToData",sendToData)
                // console.log("TopUserWinner",TopUserWinner)
              }
            }
          }
        );
      });
    }
  });
}

function transaction(data){
    return new Promise((resolve,reject)=>{
      data.transaction_id = new Date().getTime().toString();
      data.transaction_date = new Date();
      const newRow = new TableModelTransaction(data);
      TableModelTransaction.addRow(newRow, (err, doc) => {
        if (err) {
          reject({
            success: false,
            msg: err.message,
          });
        } else {
          if (!doc) {
            reject({
              success: false,
              msg: "No data found",
            });
          } else {
            resolve({
              success: true,
              msg: "Transaction added successfully",
            });
          }
        }
      });
        
    })
}


module.exports = { updateBalance, creditBalance,transaction };
