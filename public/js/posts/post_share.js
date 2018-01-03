
var post_data;
function send_list(key,name) {

    post_data={
        key,
        name
    }
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
var sharelist=[];

window.onclick = function(event) {

    if (event.target == modal) {
        modal.style.display = "none";
        sharelist=[]
    }
};


function addtolist(id) {
    if(sharelist.indexOf(id)!=-1) {
        i=sharelist.indexOf(id);
        sharelist.splice(i,1);
        document.getElementById(id).style.background = "#fffffa";

    }
    else {
        sharelist.push(id);
        document.getElementById(id).style.background = "#065ce5";
    }
}

function send() {
    console.log(post_data);

    for(var i=0;i<sharelist.length;i++) {

        var data={
            key:post_data.key,
            name:post_data.name,
            to:sharelist[i]
        }
        $.ajax({
            type: 'POST',
            url: '/newsfeed/send',
            data: data,
            success: success,
            async:false
        });

        function success() {
            console.log("done")
        }
    }
}