
class Response{
    success(status  , message , data){
        status = parseInt(status)
        message = String(message)
       let successResponse = {status , msg:message , data}
       return successResponse
    };

    failResponse(failStatus , message){
      failStatus = parseInt(failStatus)
      message = String(message)
      let failResponse = {status:failStatus , msg : message , data:null}
      return failResponse
    };

    throwError(err){
       let obj = {status : 500 , msg : "Something Went Wrong!" , data:null}
       return obj
    }
} 

module.exports = {Response}