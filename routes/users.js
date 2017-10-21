var express = require('express');
var router = express.Router();

var neo4j=require('neo4j-driver').v1;
var driver=neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','aezakmisa'));
var session=driver.session();


//=============================================Following functinality and Display User===============================================================

router.get('/chat',function (req,res) {
    res.render('chat');

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
    if(email) {
        session
            .run('MATCH (a:User {email:{emailParam1}})<-[r:follow]-(b:User) RETURN b', {emailParam1: email})
            .then(function (result) {
                if (result.records) {
                    followers = result.records.length;
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
                        following: following,
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
            res.redirect('/home');
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
            res.redirect('/home');
        })
        .catch(function (err) {
            console.log(err);
        });

});


router.post('/followerslist',function (req,res) {

    var email=req.body.useremail;
    var userList=[];
    session
        .run('MATCH (a:User {email:{emailParam1}})<-[r:follow]-(b:User) RETURN b', {emailParam1: email})
        .then(function (result) {
            if (result.records) {
                followers = result.records.length;
                for(i=0;i<followers;i++){
                    userList.push(result.records[i]._fields[0].properties.email);
                }
            } else {
                followers = 0;
            }
            res.render('listpage',{users:userList});
        })
        .catch(function (err) {
            console.log(err);
        });

});


router.post('/followinglist',function (req,res) {
    var email=req.body.useremail;
    var userList=[];
    session
        .run('MATCH (a:User {email:{emailParam1}})-[r:follow]->(b:User) RETURN b', {emailParam1: email})
        .then(function (result) {
            if (result.records) {
                followers = result.records.length;
                for(i=0;i<followers;i++){
                    userList.push(result.records[i]._fields[0].properties.email);
                }
            } else {
                followers = 0;
            }
            res.render('listpage',{users:userList});
        })
        .catch(function (err) {
            console.log(err);
        });
});



//===============================================================================================================================
router.post('/search',function (req,res) {

    console.log(req.body.useremail);
    res.redirect('/users/'+req.body.useremail);
});
//==================================================================================================================================

module.exports = router;
