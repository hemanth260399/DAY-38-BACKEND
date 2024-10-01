import express from 'express'
import { dbconnection } from './Mongoose.js'
import { userserver } from './registerapi.js'
import { urlmodel } from './urlmodel.js'
import cors from "cors";
import { urlserver } from './url.js';
let server = express()
server.use(express.json())
server.use(cors());
let port = 7777
server.use("/", userserver)
server.use("/", urlserver)
await dbconnection();
server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})