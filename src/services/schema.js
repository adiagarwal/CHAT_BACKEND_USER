const { Schema } = require('mongoose');
let {mongoose} = require('./mongoConnect');


let userschema = new mongoose.Schema({
    username : {
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unique : true
    },
    salt : {
        type : String,
    },
    password : {
        type : String,
        required:true
    },
    loggedIn : {
        type : Boolean,
        default : false
    },
    status : {
        type : Boolean,
        default : true
    },
    created_ts : {
        type : Date,
        default :  Date.now
    },
    profilePic : {
        type : String,
        default : null
    }

})

let msgSchema = new mongoose.Schema({
    sender :{
        type :  mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'Users'
    },
    body : {
        type:String,
        required:true
    },
    created_ts : {
        type:Date,
        default : Date.now
    },
    conversation_id :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref : 'conversations'
    }
})

let convSchema = new mongoose.Schema({
    participants : {
        type : [mongoose.Types.ObjectId],
        default:[],
        required : true
    },
    created_ts : {
        type : Date,
        default : Date.now
    },
    created_by : {
        type : mongoose.Schema.Types.ObjectId,
        ref:'Users',
        required:true
    },
    is_active : {
        type : Boolean,
        default:true
    },
    numberOfParticipants : {
        type : Number,
        default : 2
    }
})


let User = mongoose.model('Users' , userschema)
let Message = mongoose.model('message',msgSchema)
let Conversation = mongoose.model('conversations',convSchema)

module.exports = {Conversation , Message , User}