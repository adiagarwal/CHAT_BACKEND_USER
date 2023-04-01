let { response, authlibrary } = require("../library/index");
let { Conversation , Message, User } = require("../services/schema");
const { mongo ,Types } = require("mongoose");
const httpStatus = require("http-status");
const pubsub = require('../../app');
const controller = "[conv_controller]"
class UserConvs{
    createUserConversation = async (_ , args , context) =>{
        const method = "[createUserConversation]"
        try{
            let {id} = args
            let {token} = context
            let currentUser = await authlibrary.verifyToken(token)
            let user = await User.findById({_id : new Types.ObjectId(id)})
           if(!user){
            return response.failResponse(httpStatus.NOT_FOUND , httpStatus["404"])
           }
           if(id === currentUser.id){
            return response.failResponse(400 , " Search your friends other than yourself !")
           }
           let convExist = await Conversation.findOne({numberOfParticipants : 2 , created_by : new Types.ObjectId(currentUser.id) , participants : new Types.ObjectId(id)})
           
           if(convExist){
                return response.failResponse(400 , "Conversation already exists with this user! ")
           }
            let new_conversation = await Conversation.create({
            participants:[new Types.ObjectId(currentUser.id) ,new Types.ObjectId(user._id)],
            created_by :new Types.ObjectId(currentUser.id)
           }) 
           new_conversation = await  this.serializeConversationArray([new_conversation])

           await pubsub.pubsub.publish('NEW_CONVERSATION',{
            conversationCreated : new_conversation[0]
            })

           return response.success(httpStatus.OK , httpStatus["200"],new_conversation)

        }catch(err){
            console.log(`Error : ${method} ${controller} : `, err);           
            return response.throwError(err)
        }
    };
     serializeConversationArray = async (conversations) =>{
        try{   
            let serialize_conversation = []
               for(let conversation of conversations){
                let participants = conversation.participants
                let arr = []
                for(let part of participants ){
                    let user = await User.findById({_id : new Types.ObjectId(part)},{_id : true , username : true , loggedIn : true , profilePic : true})
                    arr.push(user)
                }
                 serialize_conversation.push({
                    id : conversation._id , 
                    created_by : conversation.created_by , 
                    is_active : conversation.is_active , 
                    numberOfParticipants : conversation.numberOfParticipants,
                    participants : arr
                })   
            }
            return serialize_conversation
        }catch(err){
            console.log(`Error : ${method} ${controller} : `, err);           
            return response.throwError(err)
        }
    };
    async getConversationById(_ , args , context){
        try{
            let {conversation_id} = args
            let conversation = await Conversation.findById({_id : conversation_id})
            if(!conversation){
                return response.failResponse(httpStatus.NOT_FOUND,httpStatus["404"])
            }
            return conversation
        }catch(err){
            console.log(`Error : ${method} ${controller} : `, err);           
            return response.throwError(err)
        }
    };
    getAllConversationsForUser = async(_ , args , context)=>{
        try{
            let {token} = context
            const {id} = await authlibrary.verifyToken(token)
            let conversations = await Conversation.find({participants : new Types.ObjectId(id) },{is_active : true , participants : true, numberOfParticipants:true , created_by:true})
            conversations = await this.serializeConversationArray(conversations)
            return conversations
        }catch(err){
            console.log(`Error : ${method} ${controller} : `, err);           
            return response.throwError(err)
        }
    }
}
module.exports = UserConvs