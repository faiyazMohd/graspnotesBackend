const express = require('express');
const router = express.Router();
const User = require('../models/Users')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser')
const JWT_SECRET =  'Now!SayMyName'

// Route 1 : Create a User using: POST "/api/auth/createuser" . No login required
router.post('/createuser',[
            body('name',"Enter a valid name").isLength({ min: 3 }),
            body('email',"Enter a valid email").isEmail(),
            body('password',"password must be atleast 4 character").isLength({ min: 4 }),
        ],async (req,res)=>{
            let success = false;
                // If there are errors , return bad request and the errors
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    success = false;
                    return res.status(400).json({success,msg:"Invalid Inputs", errors: errors.array()});
                }   
                try {
                    //check whether the user with this email exists already    
                    let user = await User.findOne({email:req.body.email})
                    if (user) {
                        success = false;
                        return res.status(400).json({success,msg:"Sorry a user with this email already exists"})
                    }

                    const salt = await bcrypt.genSalt(10);
                    const secPass = await bcrypt.hash(req.body.password,salt)
                    //create a new user
                    user = await User.create({
                        name: req.body.name,
                        email: req.body.email,
                        password: secPass,
                    })
                    const data = {
                        user:{
                            id:user.id
                        }
                    }
                    const authToken = jwt.sign(data,JWT_SECRET)
                    success = true;
                    res.json({success,msg:"User Created Successfully",authToken})
                    // res.send(user)
                    //   .then(user => res.json(user))
                    //   .catch(err=>{res.send({error:"Please enter a unique value for email"})})
                } 
                catch (error) {
                    success = false;
                    res.status(500).send({success,msg:"Internal server error"});
                }
        })



// Route 2 :  Authenticate a User using: POST "/api/auth/login" . No login required
router.post('/login',[
    body('email',"Enter a valid email").isEmail(),
    body('password',"password cannot be blank").exists(),
],async (req,res)=>{
        let success = false;
        // If there are errors , return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            success = false;
            return res.status(400).json({success,msg:"Invalid Inputs", errors: errors.array()});
        }   

        const {email,password} = req.body;
       try {
        let user = await User.findOne({email});
        if (!user) {
            success = false;
            return res.status(400).json({success,msg:"Please try to login with correct credentials"})
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if (!passwordCompare) {
            success = false;
            return res.status(400).json({success,msg:"Please try to login with correct credentials"})
        }
        const data = {
            user:{
                id:user.id
            }
        }
        const authToken = jwt.sign(data,JWT_SECRET);
        success = true;
        res.json({success,msg:"User Logged In Successfully",authToken})

       } catch (error) {
        success = false;
      res.status(500).send({success,msg:"Internal server error"});
    }
})



// Route 3 : Get loggedin User Details using: POST "/api/auth/getuser" . Login required
router.post('/getuser',[
],fetchuser,async (req,res)=>{
    let success = false;
       try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user)

       } catch (error) {
        success = false;
      res.status(500).send({success,msg:"Internal server error"});
    }
})


module.exports = router