var file;

var fileButton=document.getElementById('mediafile');

var filextension;

fileButton.addEventListener('change',function (e) {
    file=e.target.files[0];

    var fileTypes = ['jpg', 'jpeg', 'png','pdf', 'mkv', 'mp3','wav','mov','avi','mp4'];  //acceptable file types
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


jQuery('#postForm').on('submit',function (e) {
    e.preventDefault();

    document.getElementById('myModal').style.display = "block";
    var title=document.getElementById('title').value;
    var description=document.getElementById('description').value;

    var ID = function () {
        return '_' + Math.random().toString(36).substr(2, 9);
    };

    var mediaurl;
    var storageRef=firebase.storage().ref('postMedia/'+ID());

    var task=storageRef.put(file);

    var postinfo;
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


    task.on('state_changed', function(snapshot){
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        frame(progress);
        switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
                console.log('Upload is paused');
                break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
                console.log('Upload is running');
                break;
        }
    }, function(error) {
        // Handle unsuccessful uploads
    }, function() {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        var downloadURL = task.snapshot.downloadURL;
        console.log(downloadURL);
        postinfo={title:title,description:description,mediaurl:downloadURL,filextension};
        $.post('/newsfeed/create',postinfo,function (data) {
            console.log(data);
            document.location.href="/newsfeed";
        });
    });
});


