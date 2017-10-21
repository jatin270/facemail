// Get the modal
var modal = document.getElementById('myModal');
// Get the button that opens the modal
var btn = document.getElementById("myBtn");
// Get the <span> element that closes the modal
var span = document.getElementById("span");
// When the user clicks the button, open the modal

var fileButton=document.getElementById('profilepic');
var uploader=document.getElementById('uploader');
var file;
fileButton.addEventListener('change',function (e) {
     file=e.target.files[0];
});


jQuery('#registrationform').on('submit',function (e) {
    e.preventDefault();
    modal.style.display = "block";
    var username=document.getElementById('username').value;
    var password=document.getElementById('password').value;
    var email=document.getElementById('email').value;


    var profileurl;
    var storageRef=firebase.storage().ref('profilepic/'+file.name);
    var task=storageRef.put(file);

    var userinfo;
    var elem = document.getElementById("myBar");
    var width = 0;
    function frame(percentage) {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width=percentage;
            elem.style.width = width + '%';
            elem.innerHTML = width * 1  + '%';
        }
    }
    task.on('state_changed',
        function progress(snapshot) {
            var percentage=(snapshot.bytesTransferred/snapshot.totalBytes)*100;
            profileurl=snapshot.downloadURL;
            console.log(percentage);
            console.log(profileurl)
            userinfo={username,password,email,profileurl};
            frame(percentage);
        },
        function error(err) {
        },
        function complete() {
            $.post('/register',userinfo,function (data) {
                document.location.href="/";
            });
        });
});
