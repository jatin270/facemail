var sharedata;
var sharelist=[];
var itemlist=[];

function sharelistdisplay() {
    if(sharedata.length!=0){
        itemlist.push(sharedata);
    }
    $("#selected-item-list").empty();
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

    for(var i=0;i<folderdata.length;i++){
        if(folderdata[i].documentname==key){
            sharedata=folderdata[i];
            break;
        }
    }
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
    console.log(sharedata);
    console.log(itemlist);

    for (var i = 0; i < sharelist.length; i++) {


        for(var j=0;j<itemlist.length;j++){
            itemlist[j].to=sharelist[i];
        }

        $.ajax({
            type: 'POST',
            url: '/drive/send',
            data: {list:JSON.stringify(itemlist)},
            dataType:"json",
            beforeSend: function(x) {
                if (x && x.overrideMimeType) {
                    x.overrideMimeType("application/j-son;charset=UTF-8");
                }
            },
            success: success,
            async: false
        });
        function success() {
            console.log("Done ");
        }
    }
    sharelist = [];
    sharedata = "";
    itemlist=[]
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
    sharedata="";
}