[{
    id:'',
    name:'Jatin',
    room:''
}]

// addUser(id,name,room)
// removeUser(id)
// getUser(id)
//getUserList(room)
class Users{
    constructor (){
        this.users=[];
    }

    addUser(id,name,room){
        var user={id,name,room};
        this.users.push(user);
        return user;
    }

    removeUser(id){
        //return that was removed
        var user= this.getUser(id);
        if(user){
        this.users=this.users.filter((user)=> user.id !==id);
        }
        return user;
    }

    getUser(id) {
        return this.users.filter((user) => user.id === id)[0];
    }

    getUserList(room){

        var users=this.users.filter(function (user) {
           return user.room ===room;
        });
        var namesArray=users.map(function (user) {
            return user.name;
        })

        return namesArray;

    }
}

module.exports={Users};

//
// class Person{
//     constructor (name,age){
//         this.name=name;
//         this.age=age;
//     }
//
//     getUserDescription(){
//         return 'Jen us 1 year';
//     }
// };
//
// var me=new Person("Andrew",25);
//
// var desc=me.getUserDescription();
// console.log(desc);
//
//
