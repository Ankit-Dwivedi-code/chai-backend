import { Router } from "express";
import {  changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logoutUser, registerUser, renewRefreshToken, updateUserAvatar, updateUserCoverImage, updateUserDetails } from "../controllers/user.controller.js";
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
router.route("/update-details").patch(verifyJWT, updateUserDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"), updateUserAvatar)
router.route("/update-coverimage").patch(verifyJWT, upload.single("coverImage"),  updateUserCoverImage)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/watch-history").get(verifyJWT, getWatchHistory)

export default router