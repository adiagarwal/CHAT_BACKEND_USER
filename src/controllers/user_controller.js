let { response, authlibrary } = require("../library/index");
let { User } = require("../services/schema");
const bcrypt = require("bcrypt");
const { mongo } = require("mongoose");
const httpStatus = require('http-status')

const controller = "[User Controller]";
class UserController {
async getAllUsers(_ , args, context){
    const method = "[getAllUsers]"
    try{

      let {token} = context

      if(!token){
        return response.failResponse(401 , "Unauthorized to get users!")
      }

      let user = await authlibrary.verifyToken(token)

      let users = await User.find({_id : {$ne : user.id}})

      return response.success(httpStatus.OK , httpStatus["200"],users)
    }catch(err){
      console.log(`Error : ${method} ${controller} : `, err);           
      return response.throwError(err)
    }
  };
  async getCurrentUser(_ , args , context){
    try{
      let {token} = context
      if(!token){
        return response.failResponse(404,"user not found!")
      }
      let data = await authlibrary.verifyToken(token)
      let user = await User.findById({_id : data.id})
      return response.success(httpStatus.OK,httpStatus["200"],user)
    }catch(err){
      console.log(`Error : ${method} ${controller} : `, err);           
      return response.throwError(err)
    }

  }
}

module.exports = UserController;
