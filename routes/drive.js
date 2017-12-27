var express = require('express');
var router = express.Router();


var Cookies=require('cookies'),
    uuid=require('uuid'),
    njwt=require('njwt');
var secretKey;



var admin = require("firebase-admin");
var serviceAccount = require("C:\\Users\\Jatin\\WebstormProjects\\facemail\\facemail-8813d-firebase-adminsdk-6n4ag-87c3518619.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://facemail-8813d.firebaseio.com"
});

var db = admin.firestore();

const { Pool, Client } = require('pg');
const moment=require('moment');
const uuidv4 = require('uuid/v4');
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'posts',
    password: 'aezakmisa',
    port: 5433,
});

client.connect();

router.get('/',function (req,res) {

    const token=new Cookies(req,res).get('access_token');
    secretKey=res.app.get('secretKey');


    njwt.verify(token,secretKey,function (err,result) {
        if(err){
            res.render("login");
        }else{
            var currentUser=req.session.email;
            res.render('drive',{currentUser});
        }
    });

});

router.post('/foldername',function (req,res) {

    var email=req.body.email;
    var folders=[];
    db.collection("Drive_Data").doc(email).collection("foldernames").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            folders.push(doc.id);
        });
        res.send(folders);
    });
});

router.post('/createfolder',function (req,res) {

    var email=req.body.email;
    var foldername=req.body.foldername;

    db.collection("Drive_Data").doc(email).collection("foldernames").doc(foldername).set({});
    res.send("Done");
});


router.post('/upload',function (req,res) {
    var filename=req.body.filename;
    var filetype=req.body.filetype;
    var username=req.body.username;
    var downloadlink=req.body.downloadlink;
    var file = db.collection("Drive_Data").doc(username).collection(filetype).doc();
    var filepath = file.set({
        'filename': filename,
        'link': downloadlink
    });
    res.send("Done");
});

router.post('/obtain',function (req,res) {

    var email=req.body.email;
    var foldername=req.body.name;
    var docRef = db.collection("Drive_Data").doc(email).collection(foldername);
    console.log(docRef);
    drivedata=[];
    docRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            drivedata.push(doc.data());
        });
        console.log("Check"+drivedata);
        res.send(drivedata);
    });
});

router.post('/send',function (req,res) {


})

module.exports = router;
