import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()

app.use(cors({                                 //uses of cors
    origin : process.env.CORS_ORIGIN,
    credentials : true
}))

app.use(express.json({limit : "16kb"}))  //To get the json data and setted the limit of it
app.use(express.urlencoded({extended : true, limit : "16kb"})) // for url encoded just like ?=ankit+dwivedi
app.use(express.static("public")) //to serve the files to all just like favicon

app.use(cookieParser())                        //uses of cookieparser

// app.use((req, res, next)=>{
//     console.log(req.cookies);
// })

//routes import

import userRouter from './routes/user.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import videoRouter from './routes/video.routes.js'
import subscriptionRouter from "./routes/subscription.routes.js"
import commentRouter from "./routes/comment.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import likeRouter from "./routes/like.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"

//routes decleration

app.use("/api/v1/users", userRouter)   //use cannot use app.get because router is in seprate file // url look like this http://localhost:8000/api/v1/users/register
app.use("/api/v1/tweets", tweetRouter)   // url look like this http://localhost:8000/api/v1/tweets/
app.use("/api/v1/videos", videoRouter)  // url look like this http://localhost:8000/api/v1/videos/upload-video
app.use("/api/v1/subscriptions", subscriptionRouter) //url look like http://localhost:8000/api/v1/subscriptions/u/
app.use("/api/v1/comments", commentRouter) //url look like http://localhost:8000/api/v1/comments/
app.use("/api/v1/playlist", playlistRouter) //url look like http://localhost:8000/api/v1/playlist/
app.use("/api/v1/likes", likeRouter) //url look like http://localhost:8000/api/v1/likes/
app.use("/api/v1/dashboard", dashboardRouter) //url look like http://localhost:8000/api/v1/dashboard/
app.use("/api/v1/healthcheck", healthcheckRouter)//url look like http://localhost:8000/api/v1/healthcheck/






export { app } 