import express from "express";
import { v4 } from "uuid";
import { urlmodel } from "./urlmodel.js";
export let urlserver = express.Router()
import dotenv from "dotenv"
dotenv.config()
urlserver.post("/urlshortner", async (req, res) => {
    let longurl = req.body
    let tempid = v4()
    let today = new Date().toISOString().slice(0, 10)
    let date = today.split("-").reverse().join("-")
    let nordata = new Date()
    let fordate = nordata.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    let urldata = new urlmodel({
        ...longurl,
        shortner_id: tempid,
        shorturl: [`${process.env.FE_URL}/short?url=${tempid}`],
        date: fordate
    })
    await urldata.save()
    res.json({ msg: "URL SHORTED SUCCESSFULLY", data: urldata.shorturl })
})
urlserver.post("/short", async (req, res) => {
    let { url } = req.query
    let short_url = await urlmodel.findOne({ shortner_id: url })
    if (short_url) {
        res.json({ msg: "success", data: short_url.longurl })
    } else {
        res.status(404).json({ msg: "Short URL not found" })
    }
})
urlserver.get("/history", async (req, res) => {
    let data = await urlmodel.find({}).exec();
    if (data) {
        res.json({ msg: "success", data: data })
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})
urlserver.post("/dashboard", async (req, res) => {
    let { data } = req.body
    if (data) {
        let totalcount = await urlmodel.find({ date: { $regex: data } }).countDocuments()
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May",
            "Jun", "Jul", "Aug", "Sep", "Oct",
            "Nov", "Dec"
        ]
        let monthnum = months.findIndex((tdata) => tdata === data)
        let totaldays = new Date(0, monthnum + 1, 0).getDate();
        let avgurl = parseInt(totalcount) / parseInt(totaldays)
        avgurl = avgurl.toFixed(1)
        let result = { countpermonth: totalcount, avgurl: avgurl }
        res.json({ msg: "Data fetch succesfully", result })
    } else {
        res.status(404).json({ msg: "No data found" })
    }
})