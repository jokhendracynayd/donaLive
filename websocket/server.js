const express = require("express");
const fs = require("fs");
const port = 3030;
const cors = require("cors");
const axios=require('axios')
var https_options = {
  key: fs.readFileSync("keys/private.key"),
  cert: fs.readFileSync("keys/certificate.crt"),
  ca: [fs.readFileSync("keys/ca_bundle.crt")],
};

const app = express();

app.use(cors());
// const http=require("https").createServer(https_options);
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const mongoose = require("mongoose");
const Table = require("./database");
const config = require("./config/database");
// const client = require("./config/redis");

/**
 * mongodb connections
 */
mongoose.Promise = global.Promise;
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

/**
 * @description Middelware
 */

const findallIndex = require("./utils/remove_joined_user");

const TableStickerMaster = require("./models/m_sticker_master");
const TableModelCurrentGifting = require("./models/m_user_current_balance");
const TableLiveStreaming = require("./models/m_live_streaming");
const TableUserLogin = require("./models/m_user_login");

mongoose.connection.on("connected", () => {
  console.log("connected to db " + config.database);
});

mongoose.connection.on("error", (err) => {
  console.log("database error:" + err);
});

/**
 * Default API for showing response
 */
app.get("/api", (req, res) => {
  res.send("Welcome To Dona Live");
});

/**
 * @Import database file
 */

const UserJoined = require("./models/m_live_streaming_joined_users");
var AudioPartyRooms = [];
var AudioPartyRoom = "";
var usersjoined = [];

/**
 * Websocket Connections starts
 * @AudioParty
 * @videLive
 */


const {CreateGame,BiddingOnseat}=require('./utils/teen_pati');




const TeenPatiGame=io.of('/teen_patti');
TeenPatiGame.on('connection', async(socket) => {
  socket.on("checkAndCreate",(data)=>{
    function createGame(){
      console.log("game created");
    }
  })
  socket.on('bidding',(data)=>{
    BiddingOnseat(data).then((newData)=>{
      console.log(newData)
      TeenPatiGame.emit('bidding',newData);
    }).catch((err)=>{
      console.log(err);
      TeenPatiGame.emit("bidding",err);
    });
  })
});

// setInterval(createGame,35000);

io.on("connection", (socket) => {
  console.log("Audio party user connected");

  socket.on("starts-audio-party", (livestreamingId, userId) => {
    socket.join(livestreamingId);
    AudioPartyRooms.push({
      id: socket.id,
      live_streaming_id: livestreamingId,
      user: userId,
    });
  });
// TODO:  adding new feature in comment section

// TODO: Updating on comment part adding level and user details

  socket.on(
    "audio_party_comment",
    (liveStreamingIdGet, userComment, UserIdGet,userTo=null,price=null) => {
      let commentCreated = {
        comment_type: "live_streaming",
        comment_desc: userComment,
        comment_entity_id: liveStreamingIdGet,
        comment_by_user_id: UserIdGet,
      };
    
      TableUserLogin.getSingleDataByFieldName("username", UserIdGet,(err,doc)=>{
        if(err){
          io.to(liveStreamingIdGet).emit("userComment", commentCreated);
        }else{
          let payload={user_id:UserIdGet}
          axios.post('https://13.234.16.85:3000/api/giftTransation/getLevel',payload).then((res)=>{
            commentCreated.level=res.data.data.level;
            commentCreated.user_profile_pic=doc.user_profile_pic;
            commentCreated.user_nick_name=doc.user_nick_name;
            commentCreated.status=doc.status;
            io.to(liveStreamingIdGet).emit("userComment", commentCreated);
            if(userTo!=null && price!=null){
              commentCreated.userTo=userTo;
              commentCreated.price=price;
            }
          }).catch((err)=>{
            if(userTo!=null && price!=null){
              commentCreated.userTo=userTo;
              commentCreated.price=price;
            }
            commentCreated.level=0;
            commentCreated.user_profile_pic=doc.user_profile_pic;
            commentCreated.user_nick_name=doc.user_nick_name;
            commentCreated.status=doc.status;
            io.to(liveStreamingIdGet).emit("userComment", commentCreated);
          });
        }
      })
    }
  );
  socket.on("audienceJoined", (livestreamingId, userId) => {
    // preparing data structure
    let joinedUsers = {
      live_streaming_id: livestreamingId,
      joined_user_id: userId,
      created_by: userId,
      mute: false,
      kickOut: "no",
      role: "audience",
      joined_status: "yes",
    };

    // saving data in the database

    var userJoinedStatus = usersjoined.filter(
      (user) => user.joined_user_id === userId
    );

    if (userJoinedStatus.length === 0) {
      // pushing data in the array
      usersjoined.push(joinedUsers);
    }
    // getting other details from database
    // sending data back to client
    console.log(usersjoined);
    io.to(livestreamingId).emit("newUserJoined", joinedUsers);
  });
  socket.on("audienceRemove", (livestreamingIdGetH, userId) => {
    let removeUser = {
      live_streaming_id: livestreamingIdGetH,
      joined_user_id: userId,
      created_by: userId,
      mute: false,
      kickOut: "no",
      role: "audience",
      joined_status: "no",
    };
    // removing
    const index = usersjoined.indexOf(removeUser);
    usersjoined.splice(index, 1);
    // console.log('one  user left the live streaming');
    // console.log(removeUser);
    io.to(livestreamingIdGetH).emit("removeduser", removeUser);
  });
  socket.on("userJoinedOnSeat", (LiveUserresponseAray) => {
    var usersOnSeat = [];
    var seatGetH = LiveUserresponseAray._id;
    var live_streaming_idGetH = LiveUserresponseAray.live_streaming_id;
    var request_by_user_idGetH = LiveUserresponseAray.request_by_user_id;
    var request_to_user_idGetH = LiveUserresponseAray.request_to_user_id;
    var userRequestAccpetStatusGetH =
      LiveUserresponseAray.request_accept_status;
    var request_sent_by_typeGetH = LiveUserresponseAray.request_sent_by;
    var UserMuteStatusGetH = LiveUserresponseAray.mute;
    var userRoleGetH = LiveUserresponseAray.role;
    var createdAtGetH = LiveUserresponseAray.created_at;

    let userJoinedOnSeat = {
      seatId: seatGetH,
      live_streaming_id: live_streaming_idGetH,
      request_by_user_id: request_by_user_idGetH,
      request_to_user_id: request_to_user_idGetH,
      request_accept_status: userRequestAccpetStatusGetH,
      request_sent_by: request_sent_by_typeGetH,
      mute: UserMuteStatusGetH,
      role: userRoleGetH,
      created_at: createdAtGetH,
    };
    usersOnSeat.push(userJoinedOnSeat);
    io.to(live_streaming_idGetH).emit("totalUsersOnSeat", usersOnSeat);
    io.to(live_streaming_idGetH).emit("newUserOnSeat", userJoinedOnSeat);
  });
  socket.on(
    "textMuteUsers",
    (liveStreamingIdGet, muteType, muteTypeFor, UserIdGet) => {
      let TextMute = {
        textMuteType: muteType,
        textMuteTypeFor: muteTypeFor,
        textMuteUser: UserIdGet,
      };

      //sending response
      io.to(liveStreamingIdGet).emit("textMuteRes", TextMute);
    }
  );
  socket.on(
    "voiceMuteUsers",
    (liveStreamingIdGet, muteType, muteTypeFor, UserIdGet) => {
      let voiceMute = {
        voiceMuteType: muteType,
        voiceMuteTypeFor: muteTypeFor,
        voiceMuteUser: UserIdGet,
      };
      io.to(liveStreamingIdGet).emit("voiceMuteRes", voiceMute);
    }
  );

  socket.on("common_socket_receiver",(liveStreamingId,data)=>{
    io.to(liveStreamingId).emit("common_socket_sender",data);
  })

  socket.on("stickerSend", (live_streaming_id, stickerId) => {
    let stickerDataToShow = {};
    TableStickerMaster.getDataById(stickerId, (err, doc) => {
      if (err) {
        console.log(err.message);
      } else {
        stickerDataToShow.sticker_path = doc.sticker_path;
        stickerDataToShow.live_streaming_id = live_streaming_id;
        io.to(live_streaming_id).emit("userGiftToShow", stickerDataToShow);
      }
    });
  });
  socket.on("removeUserFromSeat", (LiveUserresponseAray) => {
    var seatGetH = LiveUserresponseAray._id;
    var live_streaming_idGetH = LiveUserresponseAray.live_streaming_id;
    var request_by_user_idGetH = LiveUserresponseAray.request_by_user_id;
    var request_to_user_idGetH = LiveUserresponseAray.request_to_user_id;
    var userRequestAccpetStatusGetH =
      LiveUserresponseAray.request_accept_status;
    var request_sent_by_typeGetH = LiveUserresponseAray.request_sent_by;
    var UserMuteStatusGetH = LiveUserresponseAray.mute;
    var userRoleGetH = LiveUserresponseAray.role;
    var createdAtGetH = LiveUserresponseAray.created_at;

    let userJoinedRemoveSeat = {
      seatId: seatGetH,
      live_streaming_id: live_streaming_idGetH,
      request_by_user_id: request_by_user_idGetH,
      request_to_user_id: request_to_user_idGetH,
      request_accept_status: userRequestAccpetStatusGetH,
      request_sent_by: request_sent_by_typeGetH,
      mute: UserMuteStatusGetH,
      role: userRoleGetH,
      created_at: createdAtGetH,
    };

    console.log(userJoinedRemoveSeat);
    io.to(live_streaming_idGetH).emit(
      "removeUserFromSeatRes",
      userJoinedRemoveSeat
    );
  });
  socket.on("removeUserFromSeatIndividual", (RoomIDGeth, userIdIndi) => {
    console.log("Removing individual user from seat", userIdIndi);

    io.to(RoomIDGeth).emit("removedUserIndiFromSeat", userIdIndi);
  });
  socket.on("leaveRoom", (room) => {
    let users = usersjoined.filter((ele) => ele.live_streaming_id == room);
    removeUser(users, room);
    socket.leave(room);
  });
  socket.on("disconnect", async () => {
    let user = AudioPartyRooms.find((ele) => {
      return ele.id == socket.id;
    });
    let index = AudioPartyRooms.findIndex((ele) => {
      return ele.id == socket.id;
    });
    if (index > -1) {
      AudioPartyRooms.splice(index, 1);
    }
    console.log(user);
    TableLiveStreaming.updateRow(
      user.live_streaming_id,
      { live_streaming_current_status: "ended" },
      (err, docs) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log(
            "🤣🤣🤣🤣🤣🤣🤣",
            findallIndex(usersjoined, user.live_streaming_id)
          );
          // console.log(docs);
        }
      }
    );
    console.log("user disconnected");
  });
});

http.listen(port);

console.log("Listening on port " + http.address().port); //Listening on port 8888

// module.exports=io;
