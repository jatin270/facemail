var curid;
function display(id) {
    document.getElementById(id).style.display="none";
    document.getElementById("c"+id).style.display="block";
    curid=id;
}
function postcomment() {
    var commenttext=document.getElementById("d"+curid).value;
    var info={
        commenttext:commenttext,
        postid:curid
    }
    console.log(commenttext);
    $.post('/newsfeed/createcomment',info,function (data) {
        document.getElementById("cl"+curid).append(data.commenttext+"-"+data.email)
        document.getElementById("d"+curid).value=""
    });
}



function remove() {
    document.getElementById("c"+curid).style.display="none";
    document.getElementById(curid).style.display="block";
    curid=""
}

