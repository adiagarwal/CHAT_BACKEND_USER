const jwt = require('jsonwebtoken')
let { response } = require("../library/index");

class AuthLibrary{
    async createAccessToken(payload){
        const method = "[createAccessToken]"
        try{
            let jwtkey = process.env.JWT_KEY
            let token = jwt.sign(payload, jwtkey)
            return token
        }catch(err){
            console.log(`Error : ${method}: `, err);           
            return response.throwError(err)
        }
    };
    async verifyToken(token){
        const method = "[verifyToken]"
        try{
            let jwtkey = process.env.JWT_KEY
            let payload = jwt.verify(String(token),jwtkey)
            return payload
        }catch(err){
            console.log(`Error : ${method}: `, err);           
            return response.throwError(err)
        }
    };
    async checkTokenExpiration(token){
        const method = "[checkTokenExpiration]"
        try{
            let jwtkey = process.env.JWT_KEY
            let {exp} = jwt.verify(String(token),jwtkey)
            let expiry_time = exp * 1000
            if(expiry_time <= Date.now()){
                return {status : true , msg : "Token is Expired!"}
            }
            else{
                return {status : false , msg : "Token is alive!"}
            }
        }catch(err){
            return {status : true , msg : JSON.stringify(err)}
        }
    }
}

module.exports=AuthLibrary