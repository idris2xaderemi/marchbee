const express = require("express")
const { addUserToDB, getUsers, getUser, deleteUser, editUser, login, verifyUser, changePassword, requestOTP  }= require("../controllers/user.controller")

const router = express.Router()

router.post("/addUserToDB", addUserToDB) 
router.get("/getUsers", verifyUser, getUsers)
router.get("/getUser/:id", getUser)
router.delete("/deleteUser/:id", deleteUser)
router.put("/editUser/:id", editUser)
router.post("/login", login) 
router.patch("/change-pass", verifyUser, changePassword)
router.post("/request-otp", requestOTP)


module.exports = router