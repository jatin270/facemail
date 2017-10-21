// =================================================Decalaration========================================================================================================


var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var neo4j=require('neo4j-driver').v1;
var index = require('./routes/index');
var users = require('./routes/users');
var newsfeed=require('./routes/posts');

const moment=require('moment')
const { Pool, Client } = require('pg');
const socketIO=require('socket.io');
const http=require('http');
const port=process.env.PORT || 3000;

var app = express();


var driver=neo4j.driver('bolt://localhost',neo4j.auth.basic('neo4j','aezakmisa'));
var session=driver.session();
var expressSession=require('express-session');


var server=http.createServer(app);
var io=socketIO(server);

const {generateMessage,generateLocationMessage}=require('./server/utils/message');
const {isRealString}=require('./server/utils/validation');
const {Users}=require('./server/utils/usersonline');
var usersonline=new Users();


//============================================================== Usage Code====================================================================================================

var config = require('./config'); // get our config file
app.set('superSecret', config.secret); // secret variable

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'chats',
    password: 'aezakmisa',
    port: 5433,
});
client.connect();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine","ejs");

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));


app.use(function (req,res,next) {
    res.locals.currentUser=req.session.email;
    // res.locals.error=req.flash("error");
    // res.locals.success=req.flash("success");
    next();
});

app.use('/', index);
app.use('/users', users);
app.use('/newsfeed',newsfeed);

var states=[];

session
    .run('Match (a:User) Return a')
    .then(function (result) {
        if(result.records[0]){
            for(i=0;i<result.records.length;i++){
                states.push(result.records[i]._fields[0].properties.email);
            }
        }
    })
    .catch(function (err) {
        console.log(err);
    });

//===============================Socket.io for messagin==================================================================

io.on('connection',function (socket) {

    socket.on('join',function (params,callback) {

        if(!isRealString(params.name)||!isRealString(params.room)){
            return callback("Name and room name required");
        }
        socket.join(params.room);

        usersonline.removeUser(socket.id);
        usersonline.addUser(socket.id,params.name,params.room);
        client.query('SELECT NAME,MESSAGE,CREATEDAT from '+params.room, (err, res) => {
            if(err){
                console.log(err);
                var sql = "CREATE TABLE "+params.room+"(ID SERIAL PRIMARY KEY NOT NULL, NAME TEXT NOT NULL,MESSAGE CHAR(250),CREATEDAT TIMESTAMPTZ)";
                console.log(sql);
                client.query(sql,(err,res)=> {
                    console.log(err,res);
                });
            }else{
                console.log(res.rows);
                socket.emit('oldchatdata',res.rows);
            }
        });
        io.to(params.room).emit('updateUserList',usersonline.getUserList(params.room));
        socket.emit('newMessage',generateMessage('Admin','Welcome To the chat app'));

        //socket.broadcast.emit('newMessage',generateMessage('Admin',params.name+" has joined"));
        callback();
    });
    socket.on('createMessage',function (message,callback) {

        var user=usersonline.getUser(socket.id);
        if(user && isRealString(message.text)){
            var date=moment().format();
            var command="INSERT INTO "+user.room+" (NAME,MESSAGE,CREATEDAT)\n" +
                "VALUES ( '"+user.name+"','"+message.text+"' ,'"+date+"');\n";
            client.query(command,function (err,res) {
                console.log(err,res);
            });
            io.to(user.room).emit('newMessage',generateMessage(user.name,message.text));
            callback();
        }
    });

    socket.on('createLocationMessage',function (coords) {
        var user=usersonline.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.latitude,coords.longitude));
        }
    });
    socket.on('disconnect',function () {
        var user=usersonline.removeUser(socket.id);
        if(user){
            io.to(user.room).emit('updateUserList',usersonline.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',user.name+ ' went offline.'));
        }
    });
});
//=================================================Routes=============================================================================================

app.get('/sendata',function (req,res) {

    res.send({user:states})
});


//===========================================Server================================================================
server.listen(port,function (err) {
   console.log("Server is running");
});

module.exports = app;




















// ========================================================================================================================================================
//                         Code Junk


//
// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

//
// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

//
// app.get('/',function (req,res) {
//     session
//         .run('MATCH(n:Movie) RETURN n LIMIT 25')
//         .then(function (result) {
//             var movieArr=[];
//             result.records.forEach(function (t) {
//                 movieArr.push({
//                     id:t._fields[0].identity.low,
//                     title:t._fields[0].properties.title
//                 });
//
//             });
//
//
//             res.render('index',{movies:movieArr});
//         })
//         .catch(function (err) {
//             console.log(err);
//         });
//
// });
//
// app.post('/movie/add',function (req,res) {
//     var title=req.body.movie_title;
//     session
//         .run('CREATE (n:Movie {title:{titleParam}}) RETURN n.title',{titleParam:title})
//         .then(function (result) {
//             res.redirect('/');
//             session.close();
//         })
//         .catch(function (err) {
//             console.log(err);
//         });
//
//     res.redirect('/')
// })
