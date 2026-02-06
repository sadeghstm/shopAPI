
const successResponse = (res,statusCode=200,message,data)=>{
    return res.status(statusCode).json({status:statusCode,success:true,message,data})
}
const errorResponse = (res,statusCode,message,data)=>{
    return res.status(statusCode).json({status:statusCode,success:false,error:message,data})
}


module.exports = {
    successResponse,
    errorResponse
}
