const express = require("express")
const UserModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const otpGen = require("otp-generator")
const OtpModel = require("../models/otp.model")
const nodemailer = require('nodemailer')
const cloudinary = require("cloudinary").v2

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.CLOUD_KEY,
    api_secret:process.env.CLOUD_SECRET
})
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASSWORD
  }
});

const addUserToDB = async (req, res)=>{
    const {firstName, lastName, email, password, gender, profileImage} = req.body;


   

    try {

        const saltRound = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, saltRound)

        const image = await cloudinary.uploader.upload(profileImage);

         console.log(image); 

        const user = await UserModel.create({
            firstName, 
            lastName, 
            email,
             password:hashedPassword, 
             gender,
             profileImage:{
                public_id:image.public_id,
                secure_url:image.secure_url
             }
            })

 const token = await jwt.sign({id:user._id}, process.env.APP_TOKEN, {expiresIn:"5hr"});

        res.status(201).send({
            message: "User created sucessfully",
            data: {
                firstName,
                lastName,
                email,
                gender:gender?gender:null,
                token,
            }
        });

            let mailOptions = {
            from: process.env.APP_EMAIL,
            to: [email,  "awesomepyrop@gmail.com"],
            subject: `First Mail Sending, ${firstName}`,
            html:`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            <h1>WELCOME TO NODEMAILER</h1>
            <P>
                WELCOME MY ${firstName} ${lastName}
        </body>
        </html>`
                    };

    
    transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }


});
    } catch (error) {
        console.log(error);

    if (error.code == 11000) {
        return res.status(400).json({
            message: "User already exists"
        });
    }
        return
        res.status(400).send({
            message: "User failed to create",
        })

    }
}

const getUsers = async(req,res) => {
     
    try {
        const users = await UserModel.find().select("-password")


       res.status(200).send({
            message: "User fetched sucessfully",
            data:users

       })
       
    } catch(error) {
        res.status(400).send ({
            message: "Cannot fetch Users"
        })

    }
}

const login = async (req, res) => {
    const {email, password} = req.body;
    try {
        const isUser = await UserModel.findOne({ email })
        if(!isUser) {
            res.status(400).send({
                message: "Invalid Credentials"
            })
            return;
        }

        const isMatch = await bcrypt.compare(password, isUser.password)

        if (!isMatch){
            res.status(400).send({
                message:"Invalid Credentials",
            })
            return;
        }

        const token = await jwt.sign({id:isUser._id}, process.env.APP_TOKEN, {expiresIn:"5hr", });
        res.status(200).send({
            message:"User logged in sucessfully",
            data: {
                firstName:isUser.firstName,
                lastName:isUser.lastName,
                email,
                token,
            }

        })
    } catch(error) {
        console.log(error)
        res.status(400).send({
            message: "Invalid credentials"
        })

    }
}

const getUser = async(req,res) => {
    const {id} = req.params
    try {
        const user = await UserModel.findById(id).select("-password")

        if (!user) {
       res.status(404).send({
            message: "User not found",
       })
       return
    }
    res.status(200).send({
            message: "User fetched sucessfully",
            data:user

       })
      
    } catch(error) {
        console.log(error)

        res.status(400).send ({
            message: "Cannot fetch Users"
        })
    }
};

const changePassword = async (req, res) => {
        const id = req.user
        const {oldPassword, newPassword} = req.body 
        try {

          const isUser = await UserModel.findById(id) 
          if (!isUser) {
            res.status(404).send({
                mesasge: "User not found"
            })
            return;
          }

          const isMatch = await bcrypt.compare(oldPassword, isUser.password)

          if (!isMatch) {
            res.status(400).send({
                mesasge: "Error with password validation"
            })

            return;

          }
    
        let saltRound = 10
        const salt = await bcrypt.genSalt(saltRound)
        const hashedPass = await bcrypt.hash(newPassword, salt)

        await UserModel.findByIdAndUpdate(id, { password: hashedPass }, { new: true })

        res.status(200).send({
            message: "Password Updated Sucessfully"
        })

        

        } catch (error) {
            console.log(error)
             res.status(400).send({
            message: "Didnt work"
        })
        }
    }

const requestOTP = async (req, res) => {
        const {email} = req.body 
        try {

        const isUser = await UserModel.findOne({email})

        if(!isUser) {
            res.status(404).send({
                message:"User not found, please proceed to create account"
            })

            return;
        }

        const otpToken = otpGen.generate(6, {upperCaseAlphabets:false, specialChars:false, digits:true, lowerCaseAlphabets:false})

        const otpSend = await OtpModel.create({email, otp:otpToken})

        res.status(201).send({
            message: "Otp sent sucessfully",
        });


        } catch(error) {

            res.status(400).send ({
            message: "failed"
        })



        }
    }

const forgotPassword = async (req, res) => {
        const {email, password, otp} = req.body

    try {
        const isUser = await UserModel.findOne({email})

        if(!isUser) {
            res.status(404).send({
                message:"User not found, please proceed to create account"
            })

            return;
        }

        } catch (error) {

        }

    }


const verifyUser= async (req, res, next) => {
        const reqHead = req.headers["authorization"]

        if (!reqHead) {
        return res.status(400).json({
            message: "No authorization header"
        });
    }

        const token =  reqHead.split(" ")[1]
                    ?  reqHead.split(" ")[1] 
                    :  reqHead.split(" ")[0]

        try {
            if (!token) {
            return res.status(400).json ({
                    message:"No token available"
                })
            }
            const decoded = jwt.verify(token, process.env.APP_TOKEN, function (err, decoded) {
                if (err) {
                    console.log(err);
                    res.status(401).send({
                        message: "User unautorized"
                    })
                    return;
                }
            req.user = decoded.id;
            next()
            });


        } catch (error) {
        res.status(401).send ({
            message: "Invalid credentials"
  
        }) 
        }
    }

const deleteUser = async(req, res) => {
    const {id} = req.params
    try {

    const user = await UserModel.findByIdAndDelete(id)

    res.status(200).send({
            message: "User Deleted Sucessfully",
       })
       
       return

    } catch(error) {
        console.log(error)

        res.status(400).send ({
            message: "Cannot delete Users"
        })
    }
}

const editUser = async(req, res) => {
    const {id} = req.params 
    try {

    const user = await UserModel.findByIdAndUpdate(id, { "firstName": "Edited", "lastName":"Edited"})

    res.status(200).send({
            message: "User Updated Sucessfully",
       })
       

    } catch (error) {
        console.log(error)

        res.status(400).send ({
            message: "Cannot delete Users"
        })
    }
}


module.exports={
    addUserToDB,
    getUsers,
    getUser,
    deleteUser, 
    editUser,
    login,
    verifyUser,
    changePassword,
    requestOTP,
    forgotPassword
}