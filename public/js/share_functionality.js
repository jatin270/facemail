var sharedata;
var sharelist=[];
var itemlist=[];


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

function savelink(key) {

    console.log("-------------------------");
    for(var i=0;i<folderdata.length;i++){
        if(folderdata[i].documentname==key){
            sharedata=folderdata[i];
            break;
        }
    }

    console.log(sharedata);
}

var modal = document.getElementById('sharelist');

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
        sharelist.splice(i,1);
        document.getElementById(id).style.background = "#fffffa";
    }
    else {
        sharelist.push(id);
        document.getElementById(id).style.background = "#065ce5";
    }
}

function send() {
    // send multiple item and send to multiple left
    // var from=document.getElementById('email').value;


    for (var i = 0; i < sharelist.length; i++) {
        data = {
            to: sharelist[i],
            link: sharedata.link,
            name: sharedata.name,
            type: sharedata.type,
        }

        console.log("----------------------");
        $.ajax({
            type: 'POST',
            url: '/drive/send',
            data: data,
            success: success,
            async: false
        });

        function success() {
            console.log("Successfully Sent ");
        }
    }


    console.log("Finished----------------------");
    sharelist = [];
    sharedata = "";
    modal.style.display = "none"
}

function deleteitem() {
    console.log(sharedata);

    $.post('/drive/delete',sharedata,function (result) {

        $("#box2").empty();
        display(sharedata.folder);
    });
}

function additemtolist() {
    itemlist.push(sharedata);
    $("#selected-item-list").append("<div class='item'>"+sharedata.name+"</div>");
}