import { Router } from "express";
import {  changeCurrentPassword, getCurrentUser, loginUser, logoutUser, registerUser, renewRefreshToken, updateUserAvatar, updateUserCoverImage, updateUserDetails } from "../controllers/user.controller.js";
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
router.route("/update-password").post(verifyJWT, changeCurrentPassword)
router.route("/getcurrentuser").post(verifyJWT, getCurrentUser)
router.route("/update-details").post(verifyJWT, updateUserDetails)
router.route("/update-avatar").post(upload.single("avatar"), verifyJWT, updateUserAvatar)
router.route("/update-coverimage").post(upload.single("coverImage"), verifyJWT, updateUserCoverImage)

export default router