import { model, Schema } from "mongoose";

let urldatamodel = new Schema({
    longurl: { type: Array, required: true },
    shortner_id: { type: String, required: true },
    shorturl: { type: Array, required: true },
    date: { type: String, immutable: true },
})
export let urlmodel = new model("url", urldatamodel, "url");