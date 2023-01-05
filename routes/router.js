const express = require("express");
const router = new express.Router();
const products = require("../models/productsSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenticate = require("../middleware/authenticate");


// get the products data (1)

router.get("/getproducts", async (req, res) => {
    try {
        const producstdata = await products.find();
        // console.log(producstdata , "from router.js line 18");
        res.status(201).json(producstdata);
    } catch (error) {
        console.log("error from router.js line 18" + error.message);
    }
});

// getindividual(2)

router.get("/getproductsone/:id", async (req, res) => {

    try {
        const { id } = req.params;
        // const id = req.params.id we can write like this also
        // console.log(id,"from router.js line 121");

        const individual = await products.findOne({ id: id });
        //here 1 id is which is store in db and 2 is which we're getting her on line 26
        // console.log(individual + "from router.js line 120");

        res.status(201).json(individual);
    } catch (error) {
        res.status(400).json(error);
        console.log(error.message,"error from router.js line 125");
    }
});


// register the data(3)
router.post("/register", async (req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
        console.log("fill all details from router.js line 33");
    };

    try {

        const preuser = await User.findOne({ email: email });
        //first email here is db email and 2nd is user will type 

        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new User({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge before saving
            //it will go to userSchema.js in line 56

            const storedata = await finaluser.save();
            // console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        console.log("error the bhai catch ma for registratoin time" + error.message);
        res.status(422).send(error);
    }

});



// login data(4)
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await User.findOne({ email: email });
        //here 1st email is db email and 2nd email is user input email
        // console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
         //here 1st password is from frontend line 71 and 2nd is db password
            // console.log(isMatch);

            //token generate(5)
             
            const token = await userlogin.generatAuthtoken();
            // console.log(token);

            //generating cookie(7)
            res.cookie("eccomerce", token, {
                expires: new Date(Date.now() + 258900000),
                httpOnly: true
            });

            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {
                res.status(201).json(userlogin);
            }

          } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});




// adding the data into cart (8)
router.post("/addcart/:id", authenticate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await products.findOne({ id: id });
        //here ist id is db id and 2nd is from frontend
        // console.log(cart + "from router.js line 141");

        const Usercontact = await User.findOne({ _id: req.userID });
        //here ist _id is db id and 2nd is from authenticate.js page
        // console.log(Usercontact + "from router.js line 145");

       //(10)
        if (Usercontact) {
            const cartData = await Usercontact.addcartdata(cart);

            await Usercontact.save();
            // console.log(cartData + " from router.js line 152");
            // console.log(Usercontact + "from router.js line 153");
            res.status(201).json(Usercontact);
        }else{
            res.status(401).json({error:"invalid user"})
        }
    } catch (error) {
        console.log(error);
    }
});


// get data into the cart(11)
router.get("/cartdetails", authenticate, async (req, res) => {
    try {
        const buyuser = await User.findOne({ _id: req.userID });
        console.log(buyuser + "from router.js line 168");
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});



// get user is login or not(12)
router.get("/validuser", authenticate, async (req, res) => {
    try {
        const validuserone = await User.findOne({ _id: req.userID });
        console.log(validuserone + "user hain home k header main from router.js line 181");
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for valid user");
    }
});

// for userlogout(14)

router.get("/logout", authenticate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("eccomerce", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        // console.log("user logout from router.js line 199");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});

// item remove ho rhi hain lekin api delete use krna batter hoga
// remove iteam from the cart
//(13) ---------(curel)==currentvalue
router.delete("/remove/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        req.rootUser.carts = req.rootUser.carts.filter((curel) => {
            return curel.id != id
        });

        req.rootUser.save();
        res.status(201).json(req.rootUser);
        // console.log("iteam remove from router.js line 219");

    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
});


module.exports = router;