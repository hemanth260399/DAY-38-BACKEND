import { model, Schema } from "mongoose";

let userdatamodel = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isverified: { type: Boolean, required: true },
    passcode_change: { type: Array, required: true }
})
export let usermodel = new model("user", userdatamodel, "user")