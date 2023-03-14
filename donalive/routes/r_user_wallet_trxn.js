const express = require("express");
const router = express.Router();
const TableModel = require("../models/m_user_wallet_trxn");
const rc = require("./../controllers/responseController");
const TableModelBalance = require("../models/m_user_wallet_balance");
const TableModelSticker = require("../models/m_sticker_master");
const TableModelTransicationSticker = require("../models/m_user_tansication_sticker");
const UserCurrentLiveBalance = require("../models/m_user_current_balance");
const UserGiftingTable = require("../models/m_user_gifting");
const TableModelLiveStreaming = require("../models/m_live_streaming");
const TableCoinConfig = require("../models/m_coins_configurations");
const CommentModel = require("../models/m_comments");
const {updateBalance}=require("../controllers/transaction/update_balance");
router.post(
  "/create",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // const newRow = req.body;
    const newRow = new TableModel(req.body);
    // newRow.institute = req.user.institute;
    if (!newRow) {
      return rc.setResponse(res, {
        msg: "No Data to insert",
      });
    }
    TableModel.addRow(newRow, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Inserted",
          data: doc,
        });
      }
    });
  }
);

router.get(
  "/",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.getData((err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "All Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.post("/newTransaction", async (req, res) => {
  const { sticker_id, userBy, userTo, liveStreamingRunningID, price } =
    req.body;
  if (
    userBy != "" &&
    userBy != null &&
    userBy != undefined &&
    userTo != "" &&
    userTo != null &&
    userTo != undefined
  ) {
    TableModelBalance.getDataByFieldName(
      "user_id",
      userBy,
      async (err, doc) => {
        if (err) {
          return res.json({
            success: false,
            msg: err.message,
          });
        } else {
          if (doc != null) {
            TableModelSticker.getDataById(
              sticker_id,
              async (err, docSticker) => {
                if (err) {
                  return res.json({
                    success: false,
                    msg: err.message,
                  });
                } else {
                  if (docSticker != null) {
                    if (doc.user_diamond >= docSticker.sticker_price) {
                      TableModelBalance.getDataByFieldName(
                        "user_id",
                        userTo,
                        async (err, docTo) => {
                          if (err) {
                            return res.json({
                              success: false,
                              msg: err.message,
                            });
                          } else {
                            if (docTo != null) {
                              TableCoinConfig.getDataById(
                                "630ab52a39d39b32508680c0",
                               async (err, docs) => {
                                  if (err) {
                                    return res.json({
                                      success: false,
                                      msg: err.message,
                                    });
                                  } else {
                                    if (docs != null) {
                                        TableModelBalance.findAndUpdateBalance({user_id:userBy},-docSticker.sticker_price,
                                          async (err, doc) => {
                                            if(err){
                                              return res.json({
                                                success: false,
                                                msg: err.message,
                                              });
                                            }else{
                                              if(doc!=null){
                                                TableModelBalance.findAndUpdateBalanceRcoin(
                                                  {user_id:userTo},docs.one_dimaond_r_coin_price
                                                )
                                              }else{
                                                return res.json({
                                                  success: false,
                                                  msg: "something went wrong may be user id is not valid",
                                                });
                                              }
                                            }
                                          })
                                    } else {
                                      return res.json({
                                        success: false,
                                        msg: "configration table data not found",
                                      });
                                    }
                                  }
                                }
                              );
                            } else {
                              return res.json({
                                success: false,
                                msg: "something went wrong may be user id is not valid",
                              });
                            }
                          }
                        }
                      );
                    } else {
                      return res.json({
                        success: false,
                        msg: "you don't have enough diamond",
                      });
                    }
                  } else {
                    return res.json({
                      success: false,
                      msg: "something went wrong may be sticker id is not valid",
                    });
                  }
                }
              }
            );
          } else {
            return res.json({
              success: false,
              msg: "something went wrong may be user id is not valid",
            });
          }
        }
      }
    );
  } else {
    return res.json({
      success: false,
      msg: "something went wrong may be user id is not valid",
    });
  }
});

router.post("/transaction", async (req, res) => {
  var { sticker_id, userBy, userTo, type } = req.body;
  const liveStreamingRunningID = req.body.liveStreamingRunningID;
  const price = Number(req.body.price);
  const query = [{ user_id: userBy }, { user_id: userTo }];
  await TableModelBalance.findDatabyFiled(query, async (err, doc) => {
    if (err) {
      console.log(err.message);
    } else {
      var userSendBy = 0;
      var userSendTo = 0;
      for (var i = 0; i < 2; i++) {
        if (doc[i].user_id === userBy) {
          userSendBy = Number(doc[i].user_diamond);
        }
        if (doc[i].user_id === userTo) {
          userSendTo = Number(doc[i].user_rcoin);
        }
      }
      if (price > Number(userSendBy)) {
        return rc.setResponse(res, {
          success: true,
          msg: "you can't send",
        });
      } else {
        TableCoinConfig.getDataById("630ab52a39d39b32508680c0", (err, docs) => {
          if (err) {
            console.log(err.message);
          } else {
            // console.log(docs.one_dimaond_r_coin_price);
            userSendTo = String(
              userSendTo + price * Number(docs.one_dimaond_r_coin_price)
            );
            const fillter2 = { user_id: userTo };
            const update2 = { user_rcoin: userSendTo };
            TableModelBalance.upadateByfieldName(
              fillter2,
              update2,
              (err, doc) => {
                if (err) {
                  console.log(err.message);
                } else {
                  // console.log(doc)
                }
              }
            );
          }
        });
        userSendBy = String(userSendBy - price);
        const fillter1 = { user_id: userBy };
        const update1 = { user_diamond: userSendBy };
        TableModelBalance.upadateByfieldName(fillter1, update1, (err, doc) => {
          if (err) {
            console.log(err.message);
          } else {
            console.log(doc.user_diamond);
          }
        });
        TableModelLiveStreaming.getDataById(
          liveStreamingRunningID,
          (err, docss) => {
            if (err) {
              console.log(err.message);
            } else {
              if(docss.created_by==userTo){
                let newPrice = docss.coins + price;
                let newData = { coins: newPrice };
                TableModelLiveStreaming.updateRow(
                  liveStreamingRunningID,
                  newData,
                  (err, doccss) => {
                    if (err) {
                      console.log(err.message);
                    } else {
                      // console.log(doccss)
                    }
                  }
                );
              }
            }
          }
        );
        const newRow = new UserGiftingTable({
          user_id: userBy,
          gifting_box_type_id: sticker_id,
          gifting_to_user: userTo,
          gift_price: price,
          livestreaming_id: liveStreamingRunningID,
        });
        UserGiftingTable.addRow(newRow, (err, docss) => {
          if (err) {
            console.log("this is form userGifting", err.message);
          } else {
            // console.log(docss)
          }
        });
        await UserCurrentLiveBalance.getDataByFieldName(
          "live_streaming_id",
          liveStreamingRunningID,
          async (err, doc) => {
            if (err) {
              console.log(err.message);
            } else {
              // console.log('plz check below');
              if (doc[0]) {
                var temp = Number(doc[0].r_coin_value);
                var temp2 = Number(price);

                var CurrentRCoinValue = temp + temp2;

                console.log(
                  "this is the sum of the price  -- " + CurrentRCoinValue
                );

                var UserCurrentLiveBalanceID = doc[0]._id;

                var starRating = "";

                if (CurrentRCoinValue > 0 && CurrentRCoinValue < 10000) {
                  starRating = 1;
                }
                if (CurrentRCoinValue > 10000 && CurrentRCoinValue < 50000) {
                  starRating = 2;
                }
                if (CurrentRCoinValue > 50000 && CurrentRCoinValue < 200000) {
                  starRating = 3;
                }
                if (CurrentRCoinValue > 200000 && CurrentRCoinValue < 1000000) {
                  starRating = 4;
                }
                if (CurrentRCoinValue > 1000000) {
                  starRating = 5;
                }

                // ###################### Calclulation of the star ################################

                let dataToUpdate = {
                  r_coin_value: CurrentRCoinValue,
                  star_rating: starRating,
                };

                UserCurrentLiveBalance.updateRow(
                  UserCurrentLiveBalanceID,
                  dataToUpdate,
                  (err, docs) => {
                    if (err) {
                      console.log(err);
                    } else {
                      // console.log(docs);

                      const newComment = {
                        comment_type: "live_streaming",
                        comment_desc: "gifted" + price,
                        comment_entity_id: liveStreamingRunningID,
                        comment_by_user_id: userBy,
                      };

                      const commentToWelcomeUser = new CommentModel(newComment);

                      // inserting data in comment section
                      CommentModel.addRow(
                        commentToWelcomeUser,
                        (err, docsss) => {
                          if (err) {
                            console.log("error!! ");
                          } else {
                            console.log("gift details send successfully");
                          }
                        }
                      );
                    }
                  }
                );
              } else {
                console.log("222222");
              }
            }
          }
        );
        // comment here ------------
        await TableModelSticker.getDataById(sticker_id, async (err, doc) => {
          if (err) {
            console.log(err.message);
          } else {
            const newData = await new TableModelTransicationSticker({
              host_userId: userTo,
              user_id: userBy,
              sticker_id: sticker_id,
              sticker_path: doc.sticker_path,
            });
            if (!newData) {
              return rc.setResponse(res, {
                msg: "no data to insert",
              });
            } else {
              TableModelTransicationSticker.addRow(newData, (err, document) => {
                if (err) {
                  rc.setResponse(res, {
                    msg: "no data to insert",
                  });
                } else {
                  rc.setResponse(res, {
                    success: true,
                    msg: "data set",
                    data: document,
                  });
                }
              });
            }
          }
        });
      }
    }
  });
});

router.post("/getLevel", (req, res) => {
  const { user_id } = req.body;
  UserGiftingTable.getDataByFieldName("user_id", user_id, (err, doc) => {
    if (err) {
      console.log(err.message);
    } else {
      if (doc.length == 0) {
        let dataToSend = {
          rSide: 1,
          level: 1.0,
          lSide: 2,
        };

        return rc.setResponse(res, {
          success: true,
          msg: "No gifting found",
          data: dataToSend,
        });
      }
      function sendLevel(ans, callback) {
        // console.log('this is the final level price - ' + ans);

        if (ans >= 0 && ans <= 50000) {
          var UserLevelView = ans / 50000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 1,
            level: UserLevelView,
            lSide: 2,
          };

          callback(dataToSend);
        } else if (ans >= 50000 && ans <= 150000) {
          var UserLevelView = ans / 150000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 2,
            level: UserLevelView,
            lSide: 3,
          };

          callback(dataToSend);
        } else if (ans >= 150000 && ans <= 300000) {
          var UserLevelView = ans / 300000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 3,
            level: UserLevelView,
            lSide: 4,
          };

          callback(dataToSend);
        } else if (ans >= 300000 && ans <= 500000) {
          var UserLevelView = ans / 500000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 4,
            level: UserLevelView,
            lSide: 5,
          };

          callback(dataToSend);
        } else if (ans >= 500000 && ans <= 1000000) {
          var UserLevelView = ans / 1000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 5,
            level: UserLevelView,
            lSide: 6,
          };

          callback(dataToSend);
        } else if (ans >= 1000000 && ans <= 2000000) {
          var UserLevelView = ans / 2000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 6,
            level: UserLevelView,
            lSide: 7,
          };

          callback(dataToSend);
        } else if (ans >= 2000000 && ans <= 4000000) {
          var UserLevelView = ans / 4000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 7,
            level: UserLevelView,
            lSide: 8,
          };

          callback(dataToSend);
        } else if (ans >= 4000000 && ans <= 6000000) {
          var UserLevelView = ans / 6000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 8,
            level: UserLevelView,
            lSide: 9,
          };

          callback(dataToSend);
        } else if (ans >= 6000000 && ans <= 10000000) {
          var UserLevelView = ans / 10000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 9,
            level: UserLevelView,
            lSide: 10,
          };

          callback(dataToSend);
        } else if (ans >= 10000000 && ans <= 15000000) {
          var UserLevelView = ans / 15000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 10,
            level: UserLevelView,
            lSide: 11,
          };

          callback(dataToSend);
        } else if (ans >= 15000000 && ans <= 20000000) {
          var UserLevelView = ans / 20000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 11,
            level: UserLevelView,
            lSide: 12,
          };

          callback(dataToSend);
        } else if (ans >= 20000000 && ans <= 25000000) {
          var UserLevelView = ans / 25000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 12,
            level: UserLevelView,
            lSide: 13,
          };

          callback(dataToSend);
        } else if (ans >= 25000000 && ans <= 35000000) {
          var UserLevelView = ans / 35000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 13,
            level: UserLevelView,
            lSide: 14,
          };

          callback(dataToSend);
        } else if (ans >= 35000000 && ans <= 50000000) {
          var UserLevelView = ans / 50000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 14,
            level: UserLevelView,
            lSide: 15,
          };

          callback(dataToSend);
        } else if (ans >= 50000000 && ans <= 80000000) {
          var UserLevelView = ans / 80000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 15,
            level: UserLevelView,
            lSide: 16,
          };

          callback(dataToSend);
        } else if (ans >= 80000000 && ans <= 1100000000) {
          var UserLevelView = ans / 1100000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 16,
            level: UserLevelView,
            lSide: 17,
          };

          callback(dataToSend);
        } else if (ans >= 1100000000 && ans <= 1400000000) {
          var UserLevelView = ans / 1400000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 17,
            level: UserLevelView,
            lSide: 18,
          };

          callback(dataToSend);
        } else if (ans >= 1400000000 && ans <= 1700000000) {
          var UserLevelView = ans / 1700000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 18,
            level: UserLevelView,
            lSide: 19,
          };

          callback(dataToSend);
        } else if (ans >= 1700000000 && ans <= 2050000000) {
          var UserLevelView = ans / 2050000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 19,
            level: UserLevelView,
            lSide: 20,
          };

          callback(dataToSend);
        } else if (ans >= 2050000000 && ans <= 20500000000) {
          var UserLevelView = ans / 20500000000;
          UserLevelView = Math.floor(UserLevelView * 100) / 10; // 8.88

          let dataToSend = {
            rSide: 20,
            level: UserLevelView,
            lSide: 21,
          };

          callback(dataToSend);
        }
      }
      function level(data, callback) {
        let count = 0;
        let sum = 0;
        let GiftPrice = 0;

        data.forEach((ele) => {
          // console.log(ele.gift_price);

          GiftPrice = ele.gift_price;
          if (isNaN(GiftPrice)) {
            GiftPrice = 0;
          }
          sum += Number(GiftPrice);
          count++;
          if (data.length == count) {
            sendLevel(sum, callback);
          }
        });
      }
      level(doc, (response) => {
        return rc.setResponse(res, {
          success: true,
          msg: "Data fetch",
          data: response,
        });
      });
    }
  });
});
router.get(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const id = req.params.id;
    TableModel.getDataById(id, (err, doc) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: doc,
        });
      }
    });
  }
);

router.post(
  "/byField",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldName = req.body.fieldName;
    const fieldValue = req.body.fieldValue;
    TableModel.getDataByFieldName(fieldName, fieldValue, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.post(
  "/byFields",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const fieldNames = req.body.fieldNames;
    const fieldValues = req.body.fieldValues;
    TableModel.getDataByFieldNames(fieldNames, fieldValues, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Fetched",
          data: docs,
        });
      }
    });
  }
);

router.put(
  "/update/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.updateRow(req.params.id, req.body, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Updated",
          data: docs,
        });
      }
    });
  }
);

router.delete(
  "/byId/:id",
  // passport.authenticate("jwt", { session: false }),
  (req, res) => {
    TableModel.deleteTableById(req.params.id, (err, docs) => {
      if (err) {
        return rc.setResponse(res, {
          msg: err.message,
        });
      } else {
        return rc.setResponse(res, {
          success: true,
          msg: "Data Deleted",
          data: docs,
        });
      }
    });
  }
);

module.exports = router;
