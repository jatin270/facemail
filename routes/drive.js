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
    database: 'datapost',
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
    drivedata=[];
    drivekeys=[];
    docRef.get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            drivekeys.push(doc.id);
            drivedata.push(doc.data());
        });
        res.send({drivedata,drivekeys});
    });
});

var temp=false;

router.post('/send',function (req,res) {

    val=req.body;

    console.log(typeof val.list);
    data=JSON.parse(val.list);
    var to = data[0].to;
    to = to.replace('@', '');
    to = to.replace('.', '');
    var command = "INSERT INTO " + to + " (TITLE,MEDIAURL,MEDIATYPE,SENDBY,CREATEDAT)\n VALUES";
    for(var i=0;i<data.length;i++) {
        var date = moment().format();
        var from = req.session.email;
        var link = data[i].link;
        var filename = data[i].name;
        var type = data[i].type;

        temp="( '" + filename + "' ,'" + link + "','" + type + "','" + from + "','" + date + "'),";
        command=command+temp;
    }

    command=command.slice(0,-1);

    client.query(command, (err, result) => {
        console.log(err,result);
        if (err) {
            var sql = "CREATE TABLE " + to + " (ID SERIAL PRIMARY KEY NOT NULL,TITLE VARCHAR(250) NOT NULL,MEDIAURL VARCHAR(250),MEDIATYPE CHAR(50),SENDBY CHAR(50),CREATEDAT TIMESTAMPTZ)";
            client.query(sql, (err, result) => {
                console.log(err,result);

                client.query(command, function (err, result) {
                    console.log(err,result);
                    console.log("Done");
                    res.send("Done");
                });
            });
        }
        else{
            res.send("Done");
        }
    });
});

router.post('/delete',function (req,res) {
    data=req.body;
    var deleteDoc = db.collection("Drive_Data").doc(data.username).collection(data.folder).doc(data.documentname).delete();
    res.send("Done");
});

module.exports = router;
