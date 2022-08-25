//Authentication backend

//Importing all requied files
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findOne } = require('../models/User');
const fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = "Thisisthejwtsecretstring";

//Create a user using POST "/api/auth/createuser" . This page doesn't require  auth means unauthorized user can access this page
//ROUTE 1:
router.post('/createuser',[
    body('name','Enter a valid name').isLength({ min: 2 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({ min: 5 }),
],async (req,res)=>{

    //Checking for the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    //try catch block for safty from error
    try {
        let user = await User.findOne({email:req.body.email})
        if(user){
            return res.status(400).json({error:"Sorry the user with this email already exist"});
        }

        //Bcrypting process for secure passwords

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password,salt);


        //Creating a new user 
        user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      })
      const data= {
        user:{
           id: user.id,
        }
      }
      const authtoken = jwt.sign(data,JWT_SECRET);

    res.json({authtoken});
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }
});

//Authentication of user using POST "/api/auth/login" . No login required
//ROUTE 2:
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cannot be blank').exists(),
],async (req,res)=>{
     //Checking for the errors
     const errors = validationResult(req);
     if (!errors.isEmpty()) {
       return res.status(400).json({ errors: errors.array() });
     }

     const {email,password} = req.body;
     try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({error: "Please write correct email or password"});
        }
        const passwordCompare = await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error: "Please write correct email or password"});
        }

        const data= {
            user:{
               id: user.id,
            }
          }
          const authtoken = jwt.sign(data,JWT_SECRET);
    
        res.json({authtoken});

     } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
     }
})

//ROUTE 3: Get logedin user details using POST "api/auth/getuser"
router.post('/getuser',fetchuser,async (req,res)=>{
    try {
        let userID = req.user.id;
        const user = await User.findById(userID).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;