import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { tweetByUSer } from "../controllers/tweet.controller.js";

const router = Router()

router.route("/tweet").post(verifyJWT, tweetByUSer)

export default router