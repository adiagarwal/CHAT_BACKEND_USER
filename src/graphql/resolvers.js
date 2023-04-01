const {usercontroller , convcontroller , MessageController}  = require('../controllers/index')
const { withFilter} = require('graphql-subscriptions')
const pubsub = require('../../app')
const {authlibrary} = require('../library/index')
const resolvers = {
    Query : {
        getAllUsers:usercontroller.getAllUsers,
        getCurrentUser:usercontroller.getCurrentUser,
        getAllConversationsForUser:convcontroller.getAllConversationsForUser,
        getMessagesOfConversations:MessageController.getMessagesOfConversations,
    },
    Mutation:{
        createUserConversation:convcontroller.createUserConversation,
        sendMessage:MessageController.sendMessage,
    }, 

    Subscription:{
        conversationCreated : {
            subscribe : withFilter(
                () =>pubsub.pubsub.asyncIterator('NEW_CONVERSATION') ,
                async (payload , variable , context ) => {
                    let user = await authlibrary.verifyToken(context.ctx.connectionParams.Authorization)
                    return (
                        variable.user_id === user.id
                    )
                }
            )
        },
        publishMessage : {
            subscribe : withFilter(
                () => pubsub.pubsub.asyncIterator('NEW_MESSAGE'),
                async (payload , variable , context) =>{
                    let user = await authlibrary.verifyToken(context.ctx.connectionParams.authorization)
                    let conversation = await convcontroller.getConversationById(0,{conversation_id : payload.publishMessage.conversation_id})
                    return (
                        conversation.participants.includes(user.id)
                    )
                }
            )
            
        }
    }
}

module.exports = {resolvers }