
import connectDB from "./db/index.js";
// require('dotenv').config({path : './env'})
import dotenv from 'dotenv'

dotenv.config({path : './env'})


connectDB()


/*
import express from 'express'

const app = express()

(async ()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (err)=>{
            console.log(err);
            throw err
       })

       app.listen(process.env.PORT, ()=>{
        console.log(`App is listening on port : ${process.env.PORT}`);
       })
    } catch (error) {
        console.log("ERROR : ", error);
        throw err
    }
})()
*/