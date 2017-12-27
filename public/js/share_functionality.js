var sharedata;
var sharelist=[];

function savelink(data) {
    sharedata=data;
}

function sharelistdisplay() {
    document.getElementById('sharelist').style.display = "block";
    $.post('/users/getalledges',{},function (data) {
        followinglist=data['followingList'];
        followerslist=data['followersList'];
        temp=followinglist.concat(followerslist);
        $('#datalist').empty();

        mainlist=[]
        for(var i=0;i<temp.length;i++){
            if(mainlist.indexOf(temp[i])==-1){
                mainlist.push(temp[i]);
            }
        }
        for (var i=0; i<mainlist.length; i++)
        {
            $('#datalist').append('<div class="listitem" id="'+mainlist[i]+'" onclick="addtolist(this.id)">'+mainlist[i]+'</div>');
        }
    });
}

var modal = document.getElementById('sharelist');


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {

    if (event.target == modal) {
        modal.style.display = "none";
        sharelist=[]
    }
};

function closelist() {
    sharelist=[]
    modal.style.display = "none";
}


function addtolist(id) {
    if(sharelist.indexOf(id)!=-1) {
        i=sharelist.indexOf(id)
        sharelist.splice(id,1);
        document.getElementById(id).style.background = "#fffffa";
    }
    else {
        sharelist.push(id);
        document.getElementById(id).style.background = "#065ce5";
    }
}


function send() {
    console.log(sharelist);
    console.log(sharedata);
    var from=document.getElementById('email').value;
    console.log(from)



    for (var i = 0; i < sharelist.length; i++) {
        param = {
                from: from,
                to: sharelist[i]

        }

        var params = {name: "", room: ""};

        if (param.from.length > 0 && param.to.length > 0) {
                params.name = param.from;
                if (param.from < param.to)
                    params.room = param.from + param.to;
                else
                    params.room = param.to + param.from;
            }
            params.room = params.room.replace('@', '');
            params.room = params.room.replace('@', '');
            params.room = params.room.replace('.', '');
            params.room = params.room.replace('.', '');
            $.post('/drive/send',{sharedata,params},function (data) {

            });
        }

}