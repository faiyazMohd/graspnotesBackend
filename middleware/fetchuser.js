const jwt = require('jsonwebtoken');
const JWT_SECRET =  'Now!SayMyName'


const fetchuser = (req,res,next)=>{
    //Get the user form the jwt token and add id to req object
    let success = false;
    const token =  req.header('auth-token')
    if (!token) {
        success = false;
        res.status(401).send({success,msg:"Please authenticate using a valid token"})
    }

    try {
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        success = false;
        res.status(401).send({success,msg:"Please authenticate using a valid token"})
    }
}



module.exports = fetchuser;