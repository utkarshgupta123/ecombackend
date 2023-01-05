const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const keysecret = process.env.KEY

const authenticate = async(req,res,next)=>{
    try {
        const token = req.cookies.eccomerce;
        
        const verifyToken = jwt.verify(token,keysecret);
        console.log(verifyToken,"from authenticate.js line 10");
     
        const rootUser = await User.findOne({_id:verifyToken._id,"tokens.token":token});
       //here 1st _id is db id and verifyToken._id is (db-tokens-id)|| verifyToken me id ki
       console.log(rootUser,"from authenticate.js ine 14");

        if(!rootUser){ throw new Error("User Not Found") };

        req.token = token; 
        req.rootUser = rootUser;   
        req.userID = rootUser._id;   
    
        next();  


    } catch (error) {
        res.status(401).send("Unauthorized:No token provided");
        console.log(error);
    }
};

module.exports = authenticate; 