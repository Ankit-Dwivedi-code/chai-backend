import { Router } from "express";
import {  loginUser, logoutUser, registerUser, renewRefreshToken } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";




const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount:1,
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)

//strict route require login
router.route("/logout").post(verifyJWT ,logoutUser)
router.route("/refresh-token").post(renewRefreshToken)

export default router