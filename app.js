const dotenv = require('dotenv')
const express = require('express')
const {ApolloServer } = require("@apollo/server")
const { expressMiddleware } = require('@apollo/server/express4');
const {readFile} = require('fs/promises')
const {resolvers} = require('./src/graphql/resolvers')
const {mongoConnect} = require('./src/services/mongoConnect')
const  bodyParser = require('body-parser')
const cors=require('cors')

//web socket requirements::
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } =require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const {createServer} = require('http')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const {PubSub} = require('graphql-subscriptions');
const { authlibrary } = require('./src/library');

const pubsub = new PubSub()

dotenv.config()
const app = express()

const httpServer = createServer(app)
async function startServer(){
    mongoConnect()
    const typedef = (await readFile('src/graphql/schema.graphql')).toString('utf-8')
    const schema = makeExecutableSchema({ typeDefs : typedef , resolvers: resolvers });
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql',
    });

    const serverCleanup = useServer({ schema , context : (ctx , msg , args) =>{
      return {ctx }
    }}, wsServer);
    
    const server = new ApolloServer({
        typeDefs : typedef,
        resolvers : resolvers,
        plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer }),
          {
            async serverWillStart() {
              return {
                async drainServer() {
                  await serverCleanup.dispose();
                },
              };
            },
          },
        ],
    });
    await server.start();
    app.use(cors({origin:"*"}))
    app.use(
      '/graphql',
      bodyParser.json(),
      expressMiddleware(server, {
        context: async ({ req }) => { 
          let token = req.headers.authorization
          let expired = await authlibrary.checkTokenExpiration(token)
          if(expired.status){
            throw Error(expired.msg)
          }
          return {token } 
        },
      }),
    );
    await new Promise((resolve) => httpServer.listen({ port: process.env.PORT } , resolve));
    console.log('Server started at port : 4000')
}

startServer()


module.exports.pubsub = pubsub