const fs = require("fs");
const sleep = require('sleep');
const login = require("facebook-chat-api");
const { SEND_MESSAGE, MESSAGE_TAG, MESSAGE_TEXT, TIME_DELAY } = require('./config');
let firebase = require('firebase');
firebase.initializeApp({
  apiKey: "AIzaSyCjngFwIVQk5-JuoFugPwjeNuX8earDk2g",
  authDomain: "fbuser-267d7.firebaseapp.com",
  databaseURL: "https://fbuser-267d7.firebaseio.com",
  projectId: "fbuser-267d7",
  storageBucket: "fbuser-267d7.appspot.com",
  messagingSenderId: "1050226204791"
});

const getUserIdByTag = async function(tagName) {
  return await new Promise((resolve, reject) => {
    firebase.database().ref(`tags/${tagName}`).once('value').then(function (snapshot) {
      resolve(snapshot.val());
    })
  })
}
const sendMessageByUserId = async (err, api) => {
  if(err) {

    return console.error(err);
  } else {
    // Here you can use the api
    console.log('Login to facebook success');
    // await api.sendFriendRequest("100005849980941",function(err, res) {
    //   console.log(res);
    // })
    let userIds = await getUserIdByTag(MESSAGE_TAG);
    Object.keys(userIds).forEach(userId => {
      console.log(userId);
      sleep.sleep(5);
      // api.sendMessage(MESSAGE_TEXT,userId);
      // sleep.sleep(TIME_DELAY);
    });
  }
}
try {
  login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, sendMessageByUserId);
} catch (error) {
  console.log(error);
}