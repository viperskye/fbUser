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
        console.log('>>>Get next');
        let gnext = await graph.getAsync(res.paging.next);
        return await GetNext(arr,gnext,info);
    } else {
        console.log(`>>>get finish comments of post : ${info}`);
        return arr;
    }
}
GetComments = async function(arrId, fbId, resolve) {
    let arrFull = [];
    for (let i = 0; i < arrId.length; i++) {
        let id = arrId[i].id;
        console.log(`>>get comments of post : ${id}`,i);
        let comment = await graph.getAsync(`${id}/comments`, { limit:500,fields:"created_time,from{name,birthday,email,gender,location{name},mobile_phone},message,comment_count", access_token: ACCESS_TOKEN});
        let fullcmt = await GetNext([],comment, id);
        arrFull = [...arrFull,...fullcmt];
        console.log('>>next post');
    };
    let users = arrFull.map(arr=> {
        return arr.from;
    });
    console.log(`>Get success comment in page : ${fbId}`);
    WriteComment(users, fbId, resolve);
}
WriteComment = async function(arrRes, fbId, resolve) {
    let objectUpdate = {};
    arrRes.forEach(element => {
        if(element.location) {
            objectUpdate[(element.gender || 'None')+'/'+element.location.name+'/'+element.id] = element;
        } else
            objectUpdate[(element.gender || 'None')+'/None/'+element.id] = element;
    })
    await firebase.database().ref('users').update(objectUpdate);
    console.log(`>Save success comment in page ${fbId}`);
    resolve('success');
}
GetPosts = async function(fbId, resolve) {
    console.log(`>Get list posts of page : ${fbId}`);
    let a = await graph.getAsync(`${fbId}/feed`, {limit: NUMBER_POST, fields:"id", access_token: ACCESS_TOKEN});
	GetComments(a.data, fbId, resolve);
}
removeAll = async function() {
    console.log('DELETE ALL DATA ...');
    await firebase.database().ref('users').remove();
    await firebase.database().ref('tags').remove();
    console.log('remove all data successfull !');
}
if(REMOVE_OLD === true) removeAll();

Promise.all(FANPAGE_LINK.map(link => {
    return new Promise( resolve => {
        facebook.getId(link, id => {
            id = id || link;
            console.log(`Get success ${id}`);
            resolve(id);
        })
    })
})).then((arrIds) => {
    return Promise.all(arrIds.map( arrId => {
        return new Promise( resolve => {
            GetPosts(arrId,resolve);
        })
    }))
}).then(result => {
    console.log(result);
    sendmess();
})