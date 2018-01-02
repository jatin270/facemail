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

    var from=document.getElementById('email').value;
    data={
        list:sharelist[0],
        link:sharedata.link,
        name:sharedata.name,
        type:sharedata.type,
        from:from
    }

    $.post('/drive/send',data,function (data) {
            console.log("Successfully Sent to "+data);
            sharelist=[];
            sharedata="";
            modal.style.display="none"
    });

}

function deleteitem() {
    console.log(sharedata);

    $.post('/drive/delete',sharedata,function (result) {

        $("#box2").empty();
        display(sharedata.folder);
    });



}