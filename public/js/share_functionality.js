
function sharelistdisplay() {

    document.getElementById('sharelist').style.display = "block";
    $.post('/users/getalledges',{},function (data) {

        console.log(data)
        followinglist=data['followingList'];
        followerslist=data['followersList'];
        temp=followinglist.concat(followerslist);

        mainlist=[]

        for(var i=0;i<temp.length;i++){
            if(mainlist.indexOf(temp[i])==-1){
                mainlist.push(temp[i]);
            }
        }

        for (var i=0; i<mainlist.length; i++)
        {
            console.log(mainlist[i])
            $('#datalist').append('<div class="listitem" id="'+mainlist[i]+'" onclick="addtolist(this.id)">'+mainlist[i]+'</div>');
        }

    });
}

var modal = document.getElementById('sharelist');
// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};


function closelist() {
    modal.style.display = "none";
}

var sharelist=[];

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

}