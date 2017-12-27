var express = require('express'),
    router = express.Router(),
    Cookies=require('cookies'),
    uuid=require('uuid'),
    formidable=require('formidable'),
    multer=require('multer'),
    njwt=require('njwt');

var fs=require('fs');
var multiparty = require('multiparty');

//======================Graph Database====================================================================
var neo4j=require('neo4j-driver').v1;
var driver=neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','aezakmisa'));
var session=driver.session();
//===========================================================================================================================
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

var upload = multer({ storage: storage }).single('profileimage');
var secretKey;

//===================================================Routes=========================================================================

router.get('/', function(req, res) {
  res.render("home");
});

router.get('/home',function (req,res) {

    res.render('home');
});

router.get('/register',function (req,res) {
    res.render('register');
});

router.post('/register',function (req,res) {

     var username=req.body.username;
     var password=req.body.password;
     var email=req.body.email;
     var profileurl=req.body.profileurl;

        session
            .run('CREATE (n:User {email:{emailParam},username:{userParam},password:{pasParam},profileurl:{profileParam}}) RETURN n', {
                emailParam: email,
                userParam: username,
                pasParam: password,
                profileParam:profileurl
            })
            .then(function (result) {

                console.log("Checking......................");
                var details = result.records[0]._fields[0].properties;
                console.log(details);
                const claims = {
                    sub: details.email,
                    iss: 'http://localhost:3000',
                    permissions: 'viewprofile'
                };
                secretKey=res.app.get('secretKey');
                const jwt = njwt.create(claims, secretKey);
                jwt.setExpiration(new Date().getTime() + (24 * 60 * 60 * 1000));
                const token = jwt.compact();
                new Cookies(req, res).set('access_token', token, {
                    httpOnly: true
                });
                req.session.email = details.email;
                session.close();
                res.send("Hello");
            })
            .catch(function (err) {
                console.log(err);
            });

});

router.get('/login',function (req,res) {
    res.render('login');
});

router.post('/login',function (req,res) {


    var email=req.body.email;
    var password=req.body.password;

    session
        .run("MATCH(n:User) WHERE n.email={emailParam} AND n.password={passParam} RETURN n LIMIT 10",{emailParam:email,passParam:password})
        .then(function (result) {
            var details=result.records[0]._fields[0].properties;
            const claims={
                sub:details.email,
                iss:'http://localhost:3000',
                permissions:'viewprofile'
            };
            secretKey=res.app.get('secretKey');
            const jwt=njwt.create(claims,secretKey);
            jwt.setExpiration(new Date().getTime()+(24*60*60*1000));
            const token=jwt.compact();
            new Cookies(req,res).set('access_token',token,{
                httpOnly:true
            });
            req.session.email=details.email;
            res.redirect('/home');
        })
        .catch(function (err) {
            console.log(err);
        });

});

router.get('/private',function (req,res) {
    secretKey=res.app.get('secretKey');
    const token=new Cookies(req,res).get('access_token');
    njwt.verify(token,secretKey,function (err,result) {
       if(err){
           res.send("Error accessing");
       }else{
           res.redirect('private');
       }
    });
});

router.get('/logout',function (req,res) {
    console.log(req.session.email);
    const claims={
        sub:'',
        iss:'http://localhost:3000',
        permissions:''
    };

    const jwt=njwt.create(claims,uuid.v4());
    jwt.setExpiration(new Date(0));
    const token=jwt.compact();
    new Cookies(req,res).set('access_token',token,{
        httpOnly:true
    });
    req.session.destroy();
    res.redirect('/home');
});

module.exports = router;
