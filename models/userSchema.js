const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keysecret = process.env.KEY;

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        trim: true
        //trim is used for removing left right space
    },
    email: {
        type: String,
        required: true,
        unique: true,
        //unique means all values should be unique
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not valid email address");
            }
        }
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        maxlength:10
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    cpassword: {
        type: String,
        required: true,
        minlength: 6
    },
    tokens:[
        {
            token:{
                type:String,
                required:true
            }
        }
    ],
    carts:Array
});


// password hasing 
//line 67 in router.js se phele pre method call hoga,usme agar hum password ko modify karna chate hai tabhi password and cpassword ki value change hogi
//pre and ismodified are mongoose method
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 12);
        this.cpassword = await bcrypt.hash(this.cpassword, 12);
    }
    next();
});

// generting token(6)
//here we are using mongoose instance method
userSchema.methods.generatAuthtoken = async function(){
    try {
        let token = jwt.sign({ _id:this._id},keysecret,{expiresIn:"1d"});
        //here (_id:this._id)means storing a _id of payload in _id and payload is all details from frontend
        this.tokens = this.tokens.concat({token:token});
        //here 1st token = line 43 and 2nd token = line67 || and in array there is a method called concat to store the key inside array
        await this.save();
        return token;

    } catch (error) {
        console.log(error);
    }
} 

// addto cart data(9)
userSchema.methods.addcartdata = async function(cart){
    try {
        this.carts = this.carts.concat(cart);
        await this.save();
        return this.carts;
    } catch (error) {
        console.log(error + "bhai cart add time aai error");
    }
}



const User = new mongoose.model("USER", userSchema);

module.exports = User;
