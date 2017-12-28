var express = require('express');
var router = express.Router();

var neo4j=require('neo4j-driver').v1;
var driver=neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','aezakmisa'));
var session=driver.session();
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
    database: 'datapost',
    password: 'aezakmisa',
    port: 5433,
});
client.connect();

//=============================================Following functinality and Display User===============================================================

router.get('/chat',function (req,res) {
    const token=new Cookies(req,res).get('access_token');
    secretKey=res.app.get('secretKey');
    njwt.verify(token,secretKey,function (err,result) {
        if(err){
            res.send("Error accessing");
        }else{
            res.render('chat');
        }
    });
});

router.get('/:email', function(req, res, next) {
    var email=req.params.email;
    var followers=0;
    var following=0;
    var flag=0;
    var email1=req.session.email;
    console.log(email1);
    var email2=email;

    if(email1&&email2) {
        session
            .run('MATCH (a:User {email:{emailParam1}})-[r:follow]->(b:User {email:{emailParam2}}) RETURN b', {
                emailParam1: email1,
                emailParam2: email2
            })
            .then(function (result) {
                if (result.records[0]) {
                    flag = 1;
                } else {
                    flag = 0;
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    }
    var followersList=[];
    var followingList=[];
    if(email) {
        session
            .run('MATCH (a:User {email:{emailParam1}})<-[r:follow]-(b:User) RETURN b', {emailParam1: email})
            .then(function (result) {
                if (result.records) {
                    followers = result.records.length;
                    for(i=0;i<followers;i++){
                        followersList.push(result.records[i]._fields[0].properties.email);
                    }
                } else {
                    followers = 0;
                }
            })
            .catch(function (err) {
                console.log(err);
            });

        session
            .run('MATCH (a:User {email:{emailParam1}})-[r:follow]->(b:User) RETURN b', {emailParam1: email})
            .then(function (result) {
                if (result.records) {
                    following = result.records.length;
                    for(i=0;i<following;i++){
                        followingList.push(result.records[i]._fields[0].properties.email);
                    }
                } else {
                    following = 0;
                }
            })
            .catch(function (err) {
                console.log(err);
            });

        session
            .run("MATCH(n:User) WHERE n.email={userParam} RETURN n LIMIT 10", {userParam: email})
            .then(function (result) {

                if(result.records[0]) {
                    var details = result.records[0]._fields[0].properties;

                    res.render('profilepage', {
                        userdetail: details,
                        followers: followers,
                        followerslist:followersList,
                        following: following,
                        followinglist:followingList,
                        from:email1,
                        flag: flag
                    });
                }else{
                    res.send('User not Found');
                }
            })
            .catch(function (err) {
                console.log(err);
            });
    }
});

router.post('/follow',function (req,res) {
    var user1=req.session.email;
    var user2=req.body.email;
    session
        .run("MATCH (a:User), (b:User) \n" + "   WHERE a.email = {user1Param} AND b.email = {user2Param} "+"\n" +"CREATE (a)-[r:follow]->(b) \n" +
            "RETURN a,b",{user1Param:user1,user2Param:user2})
        .then(function (result) {
            console.log(result);
            res.send("Followed")
        })
        .catch(function (err) {
           console.log(err);
        });
});

router.post('/unfollow',function (req,res) {
    var user1=req.session.email;
    var user2=req.body.email;
    session
        .run("MATCH (:User {email:{user1Param}})-[r:follow]->(:User {email:{user2Param}}) \n" + "DELETE r",{user1Param:user1,user2Param:user2})
        .then(function (result) {
            console.log(result);
            res.send("Unfollowed");
        })
        .catch(function (err) {
            console.log(err);
        });

});

router.post('/getalledges',function (req,res) {

    email=req.session.email;
    console.log(email);

    var followersList=[];
    var followingList=[];

    session
        .run('MATCH (a:User {email:{emailParam1}})<-[r:follow]-(b:User) RETURN b', {emailParam1: email})
        .then(function (result) {
            if (result.records) {
                followers = result.records.length;
                for(i=0;i<followers;i++){
                    followersList.push(result.records[i]._fields[0].properties.email);
                }
            } else {
                followers = 0;
            }
            console.log(followersList);
        })
        .catch(function (err) {
            console.log(err);
        });

    session
        .run('MATCH (a:User {email:{emailParam1}})-[r:follow]->(b:User) RETURN b', {emailParam1: email})
        .then(function (result) {
            if (result.records) {
                following = result.records.length;
                for(i=0;i<following;i++){
                    followingList.push(result.records[i]._fields[0].properties.email);
                }
            } else {
                following = 0;
            }
            console.log(followingList)
            res.send({followersList,followingList});
        })
        .catch(function (err) {
            console.log(err);
        });
});

router.post('/receivefiles',function (req,res) {
    cuser=req.session.email;
    cuser=cuser.replace('@','');
    cuser=cuser.replace('.','');
    console.log(cuser);

    client.query('SELECT * FROM '+cuser, (err, result) => {
        if(err){
            res.send(false)
        }
        else{
            data=result.rows;
            res.send(data);
        }
    });
});

//===============================================================================================================================
router.post('/search',function (req,res) {

    console.log(req.body.useremail);
    res.redirect('/users/'+req.body.useremail);
});

//==================================================================================================================================

module.exports = router;
