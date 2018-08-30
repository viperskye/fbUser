const fs = require("fs");
const sleep = require('system-sleep');
const login = require("facebook-chat-api");
const { SEND_MESSAGE, MESSAGE_TAG, MESSAGE_TEXT, TIME_DELAY, FB_EMAIL, FB_PASS } = require('./config');
let firebase = require('firebase');

const getUserIdByTag = async function(tagName) {
  return await new Promise((resolve, reject) => {
    firebase.database().ref(`tags/${tagName}`).once('value').then(function (snapshot) {
      resolve(snapshot.val());
    })
  })
}
const sendMessageByUserId = async api => {
  // Here you can use the api
  console.log('Login to facebook success');
   
  let userIds = await getUserIdByTag(MESSAGE_TAG);
  let i = 1;
  Object.keys(userIds).forEach(userId => {
	if(userIds[userId].lastMessage == MESSAGE_TEXT) {
		console.log(`${userId} had recieve this message, SKIP`);
		return;
	} else {
		api.sendMessage(MESSAGE_TEXT,userId);
		firebase.database().ref(`tags/${MESSAGE_TAG}/${userId}`).update({ lastMessage: MESSAGE_TEXT });
		console.log('send message to '+userId+ ' success !');
		console.log('Send success '+ i);
		i++;
		sleep(TIME_DELAY*1000);
		api.sendFriendRequest(userId, function(err, res) {
		 console.log(res);
	   })
		console.log('send friendrequest to '+userId+ ' success !');
	}
  });
}
const sendmessages = async () => {
	if( SEND_MESSAGE === true ) {
	  try {
		login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
		  if(err) {
			return login({ email: FB_EMAIL, password: FB_PASS }, (err, api) => {
			  if(err) return console.error(err);
			  fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
			  sendMessageByUserId(api);
			});
		  } else sendMessageByUserId(api);
		});
	  } catch (error) {
		console.log(error);
		return login({ email: FB_EMAIL, password: FB_PASS }, (err, api) => {
			  if(err) return console.error(err);
			  fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState()));
			  sendMessageByUserId(api);
			});
	  }
	} else console.log('SEND_MESSAGE : false => SKIP');
}
module.exports = sendmessages