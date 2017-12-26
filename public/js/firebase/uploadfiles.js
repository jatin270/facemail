var file;
var fileButton=document.getElementById('uploadfiles');


var email=document.getElementById('email').value;

var foldersgl;
$.post('/drive/foldername',{email},function (folders) {
    console.log(folders);
    foldersgl=folders;
    for (var i=0; i<folders.length; i++)
    {
        $('#box1').append('<div class="box task col-lg-4">\n' +
            '                        <button onclick="display()">\n' +
            '                            <span class="glyphicon glyphicon-folder-open"></span>  '+  folders[i]+ '\n' +
            '                        </button>\n' +
            '                    </div>');
    }
});

function createfolder() {

    var foldername=document.getElementById("foldername").value;

     $.post('/drive/createfolder',{foldername,email},function (data) {
         console.log(data+" folder created.");
         document.location.href = "/drive";

     });

}

fileButton.addEventListener('change',function (e) {

    file=e.target.files[0];

    var fileTypes = ['jpg', 'jpeg', 'png','pdf', 'mkv', 'mp3','wav','mov','avi','mp4','docx'];  //acceptable file types
    var extension = file.name.split('.').pop().toLowerCase(),  //file extension from input file
        isSuccess = fileTypes.indexOf(extension) > -1;  //is extension in acceptable types
    filextension=extension;
    if (isSuccess) {
        console.log(extension);
    }
    else {
        console.log(extension);
    }
});

function choosefolder() {
    document.getElementById('folderlist').style.display="block";

    $('#list').empty();
    for (var i=0; i<foldersgl.length; i++)
    {
        $('#list').append('  <button class="listitem" onclick="" >\n' +
            '            <span class="glyphicon glyphicon-folder-open"></span>  '+foldersgl[i]+'\n' +
            '        </button>');
    }
}

var folderdestination="";
$('#list').click(function(event) {
    var text = $(event.target).text().toString().trim();
    folderdestination=text;
});

function uploadFiles() {

    document.getElementById('list').style.display = "none";
    var email=document.getElementById('email').value;
    if(email.toString().trim()=="")
        return ;
    console.log(filextension);

    document.getElementById('myModal').style.display = "block";

    console.log(email);
    var ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };
    var profileurl;

    var path='drivedata/';
    var fileinfo={};
    fileinfo.filename=file.name;

    if(filextension.match("docx")||filextension.match("pdf")){
        fileinfo.filetype="documents"
        path=path+'documents/';
    }else if(filextension.match("mp3")){
        fileinfo.filetype="audio";
        path=path+'audio/';
    }else if(filextension.match("wav")||filextension.match("avi")||filextension.match("mp4")||filextension.match("mov")){
        fileinfo.filetype="video";
        path=path+'video/'
    }else{
        fileinfo.filetype="image";
        path=path+'image/'
    }

    if(folderdestination!=""){
        fileinfo.filetype=folderdestination;
    }

    path+='/'+ID();

    var storageRef=firebase.storage().ref(path);
    var task=storageRef.put(file);
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

    fileinfo.username=email;

    task.on('state_changed', function(snapshot){
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        frame(progress);
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED:
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING:
                console.log('Upload is running');
                break;
        }
    }, function(error) {
    }, function() {
        var downloadURL = task.snapshot.downloadURL;
        fileinfo.downloadlink=downloadURL;
        document.getElementById('myModal').style.display = "none";
        console.log(downloadURL);
        console.log(fileinfo);
        $.post('/drive/upload',fileinfo,function () {
            console.log("Post completed");
        });
    });
}


$('#box1').click(function(event) {

    $('#box2').empty();
    document.getElementById("loader").style.display="block";
    var text = $(event.target).text();
    if(text.toString().trim())
    display(text.toString().trim())
});

function display(foldername) {

    document.getElementById("box1").style.display="none";
    document.getElementById("box2").style.display="block";
    var email=document.getElementById('email').value;

    userinfo={
        email:email,
        name:foldername
    };

    if(foldername.toString().trim()=="")
    {
        document.getElementById("box1").style.display="block";
        return;
    }

    console.log(userinfo);

    $.post('/drive/obtain',userinfo,function (data) {


        $("#box3").append("<h1>Content:</h1>");
        document.getElementById("loader").style.display="none";

        if(data.length==0)
        {
            $("#box2").append("<h2>Empty folder</h2>");
        }

        for (var i = 0; i < data.length; i++) {
                var type;
                var extension = data[i].filename.split('.').pop().toLowerCase();
                var filextension=extension;

                console.log(filextension);

                if(filextension.match("docx")||filextension.match("pdf")){
                    type="documents";
                }else if(filextension.match("mp3")){
                    type="audio";
                }else if(filextension.match("wav")||filextension.match("avi")||filextension.match("mp4")||filextension.match("mov")){
                    type="video";
                }else{
                    type="image";
                }

                if(type=="image")
                {
                    $('#box2').append('\n' +
                        '<div class="boximg task col-lg-4">\n' +
                        '        <img src="' + data[i].link + '" alt="Fjords" width="300" height="200">\n' +
                        '    <div class="desc">' + data[i].filename + '</div>\n' +
                        '</div>');
                }
                else if(type =="audio"){
                    $('#box2').append("<div class='box task col-lg-4'>" +
                        " <div class='task' id='media-player'>\n" +
                        "                                 <video id='media-video' controls>\n" +
                        "                                     <source src='"+ data[i].link+ "' >\n" +
                        "                                 </video>\n" +
                        "                            </div>\n" +
                        "  <p> "+data[i].filename+"</p>  " +
                        "      </div>                 ");
                }
                else if(type=="video"){
                    $('#box2').append("<div class='audioelement'>" +
                        " <div class='task' id='media-player'>\n" +
                        "                                 <video id='media-video' width='320' height='240' controls>\n" +
                        "                                     <source src='"+ data[i].link+ "' >\n" +
                        "                                 </video>\n" +
                        "                            </div>\n" +
                        "  <p> "+data[i].filename+"</p>  " +
                        "      </div>                 ");
                }
            }


    });
}

function back() {
    $('#box2').empty();
    $('#box3').empty();

    document.getElementById("box1").style.display="block";
    document.getElementById("box2").style.display="none"
    document.getElementById("loader").style.display="none"
}

function sharelistdisplay() {
    console.log("Hello")
    document.getElementById('sharelist').style.display = "block";


}

var modal = document.getElementById('sharelist');


// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
var span = document.getElementsByClassName("close")[0];
span.onclick = function() {
    modal.style.display = "none";
}
