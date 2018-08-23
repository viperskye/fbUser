const fs = require("fs");
const Promise = require('bluebird');
const { ACCESS_TOKEN, FANPAGE_LINK, NUMBER_POST, REMOVE_OLD } = require('./config');
const sendmess = require('./sendmessages');
let graph = Promise.promisifyAll(require('fbgraph'));
let firebase = require('firebase');
let Facebook = require('fb-id');
let facebook = new Facebook();
firebase.initializeApp({
    apiKey: "AIzaSyCjngFwIVQk5-JuoFugPwjeNuX8earDk2g",
    authDomain: "fbuser-267d7.firebaseapp.com",
    databaseURL: "https://fbuser-267d7.firebaseio.com",
    projectId: "fbuser-267d7",
    storageBucket: "fbuser-267d7.appspot.com",
    messagingSenderId: "1050226204791"
});

graph.setAccessToken(ACCESS_TOKEN);
graph.setVersion("3.0");
GetNext = async function(save,res,info = null) {
    let arr = [...save,...res.data];
    if(res.paging && res.paging.next) {
        console.log('Get next');
        let gnext = await graph.getAsync(res.paging.next);
        return await GetNext(arr,gnext,info);
    } else {
        console.log(`get finish comments of post : ${info}`);
        return arr;
    }
}
GetComments = async function(arrId) {
    let arrFull = [];
    for (let i = 0; i < arrId.length; i++) {
        let id = arrId[i].id;
        console.log(`get comments of post : ${id}`,i);
        let comment = await graph.getAsync(`${id}/comments`, { limit:500,fields:"created_time,from{name,birthday,email,gender,location{name},mobile_phone},message,comment_count", access_token: ACCESS_TOKEN});
        let fullcmt = await GetNext([],comment, id);
        arrFull = [...arrFull,...fullcmt];
        console.log('next post');
        console.log(arrFull.length);
    };
    let users = arrFull.map(arr=> {
        return arr.from;
    });
    WriteComment(users,'hello');
}
WriteComment = async function(arrRes,info) {
    arrRes.forEach(element => {
        console.log(element.id);
        if(element.location) {
            firebase.database().ref('users/'+(element.gender || 'None')+'/'+element.location.name+'/'+element.id).update(element);
        } else
            firebase.database().ref('users/'+(element.gender || 'None')+'/None/'+element.id).update(element);
    });
    console.log('end viewcomments');
}
GetPosts = async function(fbId) {
    console.log('hi');
    let a = await graph.getAsync(`${fbId}/feed`, {limit: NUMBER_POST, fields:"id", access_token: ACCESS_TOKEN});
    console.log(a);
	await GetComments(a.data);
    console.log('finish');
	console.log('start sendmessages');
	sendmess();
}
removeAll = async function() {
    console.log('DELETE ALL DATA ...');
    await firebase.database().ref('users').remove();
    await firebase.database().ref('tags').remove();
    console.log('remove all data successfull !');
}
if(REMOVE_OLD === true) removeAll();
facebook.getId(FANPAGE_LINK, function(id) {
    GetPosts(id);
});