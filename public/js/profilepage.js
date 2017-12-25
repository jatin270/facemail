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
