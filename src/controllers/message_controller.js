let { response , authlibrary} = require("../library/index");
let { Message, Conversation } = require("../services/schema");
let {Types} = require('mongoose');
const httpStatus = require("http-status");
const  pubsub  = require("../../app");
const controller = "[Message_Controller]"
class Message_Controller{
    async sendMessage(_ , args , context){
        const method = "[sendMessage]"
        try{
            let {conversation_id , body}  = args
            let {token} = context
            if(!token){
                return response.failResponse(httpStatus.NOT_FOUND ,`User - ${httpStatus["404"]}`)
            }
            const user  = await authlibrary.verifyToken(token)

            const conversation = await Conversation.findById({_id : conversation_id} , {_id : true})
            if(!conversation){
                return response.failResponse(httpStatus.NOT_FOUND , `Conversation - ${httpStatus["404"]}`)
            }
            const message = await Message.create({
                sender : new Types.ObjectId(user.id),
                body : body,
                conversation_id : new Types.ObjectId(conversation_id)
            })

            await pubsub.pubsub.publish('NEW_MESSAGE',{
                publishMessage : message
            })
            return response.success(httpStatus.OK , httpStatus["200"] , message.body)
        }catch(err){
            console.log(`Error : ${method} ${controller} : `, err);
            return response.throwError(err)
        }
    };
    async getMessagesOfConversations(_ ,args ,context){
        const method = "[getMessagesOfConversations]"
        try{
            let {conversation_id} = args
            const messages = await Message.find({conversation_id})
            return messages
        }catch(err){
            console.log(`Error : ${method} ${controller} : `, err);
            return response.throwError(err)
        }
    }
}

module.exports = Message_Controller