var socket = io();

function scrollToBottom () {

    //Selectors
    var messages=jQuery('#messages');
    var newMessage=messages.children('li:last-child')

    //Heights
    var clientHeight=messages.prop('clientHeight')
    var scrollTop=messages.prop('scrollTop');
    var scrollHeight=messages.prop('scrollHeight');
    var newMessageHeight=newMessage.innerHeight();
    var lastMessageHeight=newMessage.prev().innerHeight();

    if(clientHeight+scrollTop+newMessageHeight+lastMessageHeight>=scrollHeight){
        messages.scrollTop(scrollHeight);
    }
}


socket.on('connect',function () {

    var param=jQuery.deparam(window.location.search);
    var params={name:"",room:""};
    if(param.from.length>0 &&param.to.length>0) {

        params.name=param.from;
        if(param.from<param.to)
            params.room=param.from+param.to;
        else
            params.room=param.to+param.from;
    }
    params.room=params.room.replace('@','');
    params.room=params.room.replace('@','');
    params.room=params.room.replace('.','');
    params.room=params.room.replace('.','');

    console.log(params.room);
    socket.emit('join', params, function (err) {
            if (err) {
                alert("Need to Login first");
                window.location.href = '/';
            } else {
                console.log("No error")
            }
        });

});

socket.on('newMessage',function (message) {

    console.log(message);

    var formattedTime=moment(message.createdAt).format("h:mm a");
    var template=jQuery('#message-template').html();
    var html = Mustache.render(template,{
        text:message.text,
        from:message.from,
        createdAt:formattedTime
    });

    jQuery("#messages").append(html);
    scrollToBottom();
});

socket.on('oldchatdata',function (data) {

    console.log(data);
    data.forEach(function (t) {
        var formattedTime=moment(t.createdat).format("h:mm a");
        console.log(formattedTime);
        var template=jQuery('#message-template').html();
        var html = Mustache.render(template,{
            text:t.message,
            from:t.name,
            createdAt:formattedTime
        });

        jQuery("#messages").append(html);
        scrollToBottom();
    });
});


socket.on('newLocationMessage',function (message) {


    var formattedTime=moment(message.createdAt).format("h:mm a");
    var template=jQuery('#location-message-template').html();
    var html=Mustache.render(template,{
       from:message.from,
       url:message.url,
       createdAt:formattedTime
    });

    jQuery('#messages').append(html);
    scrollToBottom();
});

socket.on('updateUserList',function (users) {

    var ol=jQuery('<ol></ol>');
    users.forEach(function (user) {
        ol.append(jQuery('<li></li>').text(user));
    });

    jQuery('#users').html(ol);
});

socket.on('disconnect',function(){
    console.log('Disconnected from server');
});



jQuery('#message-form').on('submit',function (e) {
    e.preventDefault();

    var messageTextbox=jQuery('[name=message]');


    socket.emit('createMessage',{
       text:messageTextbox.val()
    },function () {
        messageTextbox.val('');
    });
});

var locationButton=jQuery('#send-location');

locationButton.on('click',function () {

    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser.')
    }
    locationButton.attr('disabled','disabled').text('Sending....');
    navigator.geolocation.getCurrentPosition(function (position) {

        locationButton.removeAttr('disabled').text('Send Location');
        socket.emit('createLocationMessage',{
           latitude:position.coords.latitude,
           longitude:position.coords.longitude
        });
        console.log(position);
    },function () {
        locationButton.removeAttr('disabled').text('Send Location');
        alert("Unable to fetch location.");
    });
});
