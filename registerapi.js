import express from "express"
import { usermodel } from "./usermodel.js"
import { v4 } from "uuid"
import mongoose from "mongoose"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { mailobj, transporter } from "./mailsend.js";
import { jwttoken } from "./jwt_token.js";
import dotenv from "dotenv"
dotenv.config()
export let userserver = express.Router()
//Post call to register a new user in DB password hash and saved successfully
userserver.post("/register", async (req, res) => {
    let data = req.body
    let userfind = await usermodel.findOne({ email: data.email })
    if (userfind) {
        return res.json({ msg: "user already exists" })
    }
    else {
        let userdata = new usermodel({
            ...data,
            id: v4(),
            passcode_change: [],
            isverified: false
        })
        let token = jwttoken({ email: userdata.email }, "1d")
        let link = ` ${process.env.FE_URL}/register-verify-email?token=${token}`
        await transporter.sendMail({
            ...mailobj,
            to: userdata.email,
            subject: "Email Verification",
            text: `Click on the link below to verify your email address: ${link}`
        })
        bcrypt.hash(userdata.password, 10, async (err, hashdata) => {
            try {
                userdata.password = hashdata
                try {
                    await userdata.save()
                    res.json({ msg: "User added succesfully" })
                } catch {
                    if (err instanceof mongoose.Error.ValidationError) {
                        res.status(400).json({ msg: "Sorry some field are missing" })
                    } else {
                        res.status(500).json({ msg: "Internal server error" })
                    }
                }
            } catch (err) {
                return res.status(500).json({ msg: "Internal server error" })
            }
        })
    }
})
userserver.post("/register-verify-email", (req, res) => {
    let { token } = req.query;
    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        if (err) {
            res
                .status(400)
                .json({ msg: "Link Seems To Be Expired, Please try again" });
        }
        const { email } = data;
        await usermodel.updateOne({ email: email }, { $set: { isverified: true } },)
        res.json({ msg: "User verified successfully" });
    });
})
//Post call to login the page user with email and password
userserver.post("/login", async (req, res) => {
    let { email, password } = req.body
    try {
        let userfind = await usermodel.findOne({ email })
        if (userfind) {
            if (userfind.isverified) {
                bcrypt.compare(password, userfind.password, (err, data) => {
                    if (data) {
                        delete userfind.password
                        res.json({ msg: `Successfully logged in ${userfind.name}` })
                    }
                    else if (err) {
                        res.status(400).json({ msg: "Something went wrong" })
                    }
                    else {
                        res.status(404).json({ msg: "Invalid credentials" })
                    }
                })
            } else {
                res.status(404).json({ msg: "Email not verified" })
            }
        }
        else {
            res.status(404).json({ msg: "User not found" })
        }
    } catch (e) {
        res.status(500).json({ msg: "Internal server error" })
    }
})
//post call to verify the email to change the password
userserver.post("/verify-email", async (req, res) => {
    let { email } = req.body
    let emailfind = await usermodel.findOne({ email: email })
    if (emailfind) {
        let tempdata = v4()
        await usermodel.updateOne({ email: emailfind.email }, { $set: { passcode_change: tempdata } })
        let currentuser = await usermodel.findOne({ email: emailfind.email })
        let token = jwttoken({ passcode: currentuser.passcode_change[0] }, "1d")
        await transporter.sendMail({
            ...mailobj,
            to: currentuser.email,
            subject: "Password Recovery",
            text: `Click on the link below to reset your password: ${process.env.FE_URL}/reset-password?token=${token}`
        })
        res.json({ msg: 'Password recovery mail sent succesfully' })
    } else {
        res.status(404).json({ msg: "User not found" })
    }
})
//Post call to reset the password and save the new password
userserver.post("/reset-password", async (req, res) => {
    let { token } = req.query
    let password = req.body
    jwt.verify(token, process.env.JWT_KEY, async (err, data) => {
        let user = await usermodel.findOne({ passcode_change: data.passcode })
        if (user) {
            if (err) {
                res.status(400).json({ msg: "Sorry Link is expired" })
            }
            else {
                bcrypt.hash(password.password, 10, async (err, hashdata) => {
                    if (err) {
                        res.status(500).json({ msg: "Internal server error" })
                    }
                    else {
                        await usermodel.updateOne({ passcode_change: data.passcode }, { $set: { password: hashdata } })
                        await usermodel.updateOne({ passcode_change: data.passcode }, { $set: { passcode_change: [] } })
                        res.json({ msg: "Password changed succesfully" })
                    }
                })
            }
        }
        else {
            res.status(400).json({ msg: "Sorry link already used" })
        }
    })
})