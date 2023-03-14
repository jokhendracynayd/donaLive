const express = require('express');
const router = express.Router();
// const TableModel = require('../models/m_audio_party_host');
const rc = require('./../controllers/responseController');
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole} = require('agora-access-token')

router.post('/',(req, res) => {

    USERID = req.body.user_id;
// updating the variable
// const d = new Date();
// let ms = d.valueOf();

const channelName  = 'dona_live'+USERID;
// const channelName  = 'dona_live';

    // Rtc Examples
const appID = 'dab415ad3c0a42e7a6e5b8f69dc5b155';
const appCertificate = '28d7e2ca1987410f95b5089d1a4c4c7e';
// const channelName = req.body.channel_name;
// const account = req.body.accountId;
const role = RtcRole.PUBLISHER;

// const uid = 2882341273;
const expirationTimeInSeconds = 3600

const currentTimestamp = Math.floor(Date.now() / 1000)

const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

// IMPORTANT! Build token with either the uid or with the user account. Comment out the option you do not want to use below.

// // Build token with uid
const tokenA = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, channelName, 0, role, privilegeExpiredTs);
console.log("Token With Integer Number Uid: " + tokenA);

// Build token with user account
// const tokenB = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, channelName, account, role, privilegeExpiredTs);
// console.log("Token With UserAccount: " + tokenB);

let Data = {
    channel_name : channelName,
    token : tokenA
}
      
        return rc.setResponse(res, {
            success: true,
            msg: 'Token Generated',
            data: Data
            
        });
    }
);


module.exports = router;