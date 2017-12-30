document.getElementById("defaultOpen").click();
$(document).ready(function() {
    $(".btn-pref .btn").click(function () {
        $(".btn-pref .btn").removeClass("btn-primary").addClass("btn-default");
        // $(".tab").addClass("active"); // instead of this do the below
        $(this).removeClass("btn-default").addClass("btn-primary");

    });
});
function openCity(evt, cityName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(cityName).style.display = "block";
    evt.currentTarget.className += " active";
}

jQuery('#followrequest').on('submit',function (e) {
    e.preventDefault();
    var val=document.getElementById('emailfollow').value;
    var body={
        email:val
    }
    $.post('/users/follow',body,function (data) {
        console.log(data);
        document.location.href='/users/'+val;
    });
});

jQuery('#unfollowrequest').on('submit',function (e) {
    e.preventDefault();
    var val = document.getElementById('emailunfollow').value;
    var body = {
        email: val
    }
    $.post('/users/unfollow', body, function (data) {
        console.log(data);
        document.location.href = '/users/' + val;
    });
});
$.post("/users/receivefiles",{},function (data) {
    console.log(data);

    if(data.length>0) {
        for (var i = 0; i < data.length; i++) {

            tdata={
                name:data[i].title,
                link:data[i].mediaurl,
                type:data[i].mediatype
            }
            $('#datalist').append("<div><h class='filename'> "+data[i].title+"</h></p>" +
                "<button onclick='showcontent(tdata)' style='float: right'>View</button>" +
                "</div>")
        }
    }else{
        $('#datalist').append("<div>No new data</div>")
    }
});

var modal = document.getElementById('viewer');

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        sharelist=[]
    }
};
function showcontent(e) {

    document.getElementById("viewer").style.display="block";
    $('#viewer-content').empty();
    type=e.type.toString();
    var link=e.link;
    var name=e.name;

    if(type[0] == "i")
    {
        $('#viewer-content').append('<div class="boximg task">\n' +
            '        <img src="' + link + '" alt="Fjords" width="300" height="200">\n' +
            '    <div class="desc">' + name + '</div>\n' +
            '</div>');
    }
    else if(type[0] =="a"){

        $('#viewer-content').append("<div class='box task '>" +
            " <div class='task' id='media-player'>\n" +
            "                                 <video id='media-video' controls>\n" +
            "                                     <source src='"+ link+ "' >\n" +
            "                                 </video>\n" +
            "                            </div>\n" +
            "  <p> "+name+"</p>  " +
            "      </div>                 ");
    }
    else if(type[0]=="v"){
        console.log("Checkv");
        $('#viewer-content').append("<div class='audioelement'>" +
            " <div class='task' id='media-player'>\n" +
            "                                 <video id='media-video' width='320' height='240' controls>\n" +
            "                                     <source src='"+ link+ "' >\n" +
            "                                 </video>\n" +
            "                            </div>\n" +
            "  <p> "+name+"</p>  " +
            "      </div>                 ");
    }
}