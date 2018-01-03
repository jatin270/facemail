var express = require('express');
var router = express.Router();


var Cookies=require('cookies'),
    uuid=require('uuid'),
    njwt=require('njwt');

var secretKey;


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

const client2=new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'datapost',
    password: 'aezakmisa',
    port: 5433,
});

client2.connect();


router.get('/',function (req,res) {
    const token=new Cookies(req,res).get('access_token');
    secretKey=res.app.get('secretKey');


    njwt.verify(token,secretKey,function (err,result) {
        if(err){
            res.render("login");
        }else{

            var postdata;
            client.query('SELECT * FROM post ORDER BY createdat DESC', (err, result) => {
                console.log(result.rows);
                postdata = result.rows;
                if (err) {
                    return res.send("Error");
                }


                client.query('Select * FROM comment', (err, result) => {

                    if(err){
                        return res.render('post',{postdata,commentdata:[{}]})
                    }
                    else {
                        console.log(result.rows);
                        commentdata = result.rows;
                        if (err) {
                            commentdata = [];
                        }
                        res.render('post', {postdata, commentdata});
                    }
                });
            });
        }
    });


});

router.get('/create',function (req,res) {
    const token=new Cookies(req,res).get('access_token');
    secretKey=res.app.get('secretKey');


    njwt.verify(token,secretKey,function (err,result) {
        if(err){
            res.send("Error accessing");
        }else{
            res.render('create');
        }
    });

});

router.post('/create',function (req,res) {

    console.log(req.body);
    var title=req.body.title;
    var desc=req.body.description;
    var url=req.body.mediaurl;
    var type=req.body.filextension;
    var postid=uuidv4();
    var currentUser=req.session.email;
    var date=moment().format();
    client.query('SELECT * FROM post', (err, result) => {
        if(err){
            var sql = "CREATE TABLE post (ID SERIAL PRIMARY KEY NOT NULL,POSTID VARCHAR(100), TITLE CHAR(50) NOT NULL,DESCRIPTION CHAR(250),MEDIAURL VARCHAR(250),MEDIATYPE CHAR(50),CREATEDBY CHAR(50),CREATEDAT TIMESTAMPTZ)";
            console.log(sql);
            client.query(sql,(err,res)=> {
                console.log(err,res);
            });
        }

        var command="INSERT INTO post (POSTID,TITLE,DESCRIPTION,MEDIAURL,MEDIATYPE,CREATEDBY,CREATEDAT)\n" +
            "VALUES ( '"+postid+"','"+title+"' ,'"+desc+"','"+url+"','"+type+"','"+currentUser+"','"+date+"');\n";
        client.query(command,function (err,result) {
            console.log(err,result);
            if(err){
                res.send(false);
            }else{
                res.send(true);
            }
        });
    });

});

router.post('/createcomment',function (req,res) {

    var commenttext=req.body.commenttext;
    var email=req.session.email;
    var date=moment().format();
    var postid=req.body.postid;

    data={
        commenttext,
        email,
        date,
        postid
    }

    console.log(commenttext);

    client.query('SELECT * FROM comment', (err, result) => {
        if(err){
            var sql = "CREATE TABLE comment (ID SERIAL PRIMARY KEY NOT NULL,POSTID VARCHAR(100),COMMENTTEXT CHAR(250),CREATEDBY CHAR(50),CREATEDAT TIMESTAMPTZ)";
            console.log(sql);
            client.query(sql,(err,res)=> {
                console.log(err,res);
            });
        }

        var command="INSERT INTO comment (POSTID,COMMENTTEXT,CREATEDBY,CREATEDAT)\n" +
            "VALUES ( '"+postid+"','"+commenttext+"','"+email+"','"+date+"');\n";
        client.query(command,function (err,result) {
            console.log(err,result);
            if(err){
                res.send(false);
            }else{
                res.send(data);
            }
        });
    });


});

router.post('/send',function (req,res) {


    console.log(req.body);

    link=req.body.key;
    filename=req.body.name;
    to=req.body.to;
    to=to.replace('@','');
    to=to.replace('.','');
    type="post"
    from=req.session.email;
    var date=moment().format();


    var command = "INSERT INTO " + to + " (TITLE,MEDIAURL,MEDIATYPE,SENDBY,CREATEDAT)\n" +
        "VALUES ( '" + filename + "' ,'" + link + "','" + type + "','" + from + "','" + date + "');\n";
    client2.query(command, (err, result) => {
        if (err) {
            var sql = "CREATE TABLE " + to + " (ID SERIAL PRIMARY KEY NOT NULL,TITLE VARCHAR(250) NOT NULL,MEDIAURL VARCHAR(250),MEDIATYPE CHAR(50),SENDBY CHAR(50),CREATEDAT TIMESTAMPTZ)";
            client2.query(sql, (err, result) => {
                console.log("---------------------------------------------",to);
                console.log(err,result);
                var command = "INSERT INTO " + to + " (TITLE,MEDIAURL,MEDIATYPE,SENDBY,CREATEDAT)\n" +
                    "VALUES ( '" + filename + "' ,'" + link + "','" + type + "','" + from + "','" + date + "');\n";
                client2.query(command, function (err, result) {
                    console.log("-----------------------------------------");
                    console.log(err,result);
                    res.send("Done")
                });
            });
        }
    });
});

module.exports = router;
