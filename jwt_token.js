import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export let jwttoken = (payload, expiry) => {
    return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: expiry });
}