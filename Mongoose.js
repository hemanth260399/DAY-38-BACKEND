import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config()
let dbname = "Day-37"
let dburl = `mongodb+srv://${process.env.user}:${process.env.password}@${process.env.cluster_name}/${dbname}?retryWrites=true&w=majority&appName=Cluster0`
export let dbconnection = async () => {
    try {
        await mongoose.connect(dburl)
        console.log("Database connection successful")
    } catch (e) {
        console.log("something went wrong", e)
        process.exit(1)
    }
}