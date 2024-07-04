import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose';

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken =   user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Internal server error while generating access and refresh token")
    }
}

const registerUser = asyncHandler(async(req, res)=>{
    //get user details frm the user 
    //validation - no field should be empty
    //check if the user already exists - email and username
    //check for images , check for avatar
    //upload them to cloudinary , avatar
    // create user object - create entry in db
    // remove password end refresh token field from response
    //check for user creation
    //return res
    

    //get user details
    const {username, email, fullname, password} =  req.body
    // console.log(email);
    // console.log(req.body);
    // res.send("Ok tested")

    //check for empty fields
    if (
        [username, email, fullname, password].some((field)=>field?.trim() === "")
    ) {
        
        console.log("All field is required");
        throw new ApiError(400, "All fields are required")
    }


    //check for existing user
    const existedUser = await User.findOne({
        $or : [{email}, {username}]
})
    // console.log("Existed User : ", existedUser);

    if(existedUser){
        throw new ApiError(409, "User already exists")
    }

    


    //check for images and avatar
    // console.log(req.files); //Undefined

    const avatarLocalPath  = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
        }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Image file is required")
    }



    //Upload files on cloudinary

    const avatar =  await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar Image is required")
    }

    //Uploading on database my creating an object

   const user =  await User.create({
        fullname,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    //check for user creation

    const createdUser = await User.findById(user._id).select("-password -refreshToken") 

    // console.log("createdUser : ", createdUser);

    if(!createdUser){
        throw new ApiError(500, "Something went wrong on creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd Successfully")
    ) 


})


const loginUser = asyncHandler(async(req, res)=>{
    //get username and password from the user
    //check the empty field
    //find the user
    //call the function is password correct to check the password
    //Generate a access token and refresh token
    //send cookie
    //login the user and send response


    //get data from user
    const {email, username, password} = req.body
    // console.log(email);

    // check for emsil or password
    if (!email && !password) {
        throw new ApiError(400, "Username or email is required")
    }

    //check for email or password
    // if (!(username || email)) {
    //     throw new ApiError(400, "Username or email is required")
    // }

    //check for password empty

    if(password.trim() === ""){
        throw new ApiError(400, "Password can't be empty")
    }

    const user =   await User.findOne({
        $or : [
            {username},
            {email}
        ]
      })

    if(!user)
        {
            throw new ApiError(404, "User does not exist")
        }
    
    const isPasswordValid =  await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} =   await generateAccessAndRefreshTokens(user._id)

    // console.log("accessToken : " , accessToken);
    // console.log("refreshToken : " , refreshToken);


    //to remove password and refresh token from the response
    const loggedinUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly  :true,
        secure : true
    }

    return res
    .status(200)
    .cookie("accessToken",await accessToken, options)
    .cookie("refreshToken",await refreshToken, options)
    .json(
        new ApiResponse(200,
             {user : loggedinUser, refreshToken, accessToken},
              "User logged in successfully")
    )


})

const logoutUser = asyncHandler(async(req, res) =>{
    //clear the cookie
    //clear rhe accesstoken
    await User.findByIdAndUpdate(req.user._id, {
        $set:{
            refreshToken : undefined
        },
    },
    {
        new : true
    }
)

const options = {
    httpOnly  :true,
    secure : true
}

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200,{}, "User Logged out"))
})

const renewRefreshToken = asyncHandler(async(req, res)=>{
    //get refreshtoken from the cookie or from req.body
    //verfy the cookie using jwt
    // find the user using the decodedToken._id
    // compare the user's refreshtoken and the cookie refresh token
    //generate a new refresh and access token 
    //set a option object
    //return res with cookie

    const token = req.cookies?.refreshToken || req.body.refreshToken

    try {
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    
        if(!decodedToken){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const user = await User.findById(decodedToken._id)
    
        if(!user){
            throw new ApiError(401, "Inavild refresh Token")
        }
    
    
        if(token !== user.refreshToken){
            throw new ApiError(401, "Token doesnot match")
        }
    
        const {refreshToken, accessToken} = generateAccessAndRefreshTokens(user._id)
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    accessToken,
                    refreshToken
                },
                "Refresh token updated"
            )
        )
    } catch (error) {
        throw new ApiError(400, error?.message || "Invalid access token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res)=>{
    //get old password and new password from req.body
    //check for empty 
    //get user from req.body //because of jwt middleware
    //check is password correct by using isPasswordCorrect method
    // set user.newpassword = password
    //save the user
    //return the response

    const {oldPassword, newPassword} = req.body
    
    if(!oldPassword && !newPassword){
        throw new ApiError(400, "Please provide old and new password")
    }

    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(400, "User not found please provide password correctly")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false })

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

//to get the cureent user
const getCurrentUser = asyncHandler(async(req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "Current user fetched successfully")
    )
})

const updateUserDetails = asyncHandler(async(req, res)=>{
    //get the field details that user want to change
    //check for empty
    //find user by req.user and upadate details by database method : findByIdAndUpdate
    //remove the password field by using select method
    //return the response

    const {fullname, email} = req.body

    if(!fullname || !email){
        throw  new ApiError(400, "Please provide fullname or email")
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set:{
                fullname,
                email
            }
        },
        {new : true}
    ).select("-password")

    if(!user){
        throw new ApiError(400, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User updated Successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req, res)=>{
    // const {avatar} = req.body

    // if(!avatar){
    //     throw new ApiError(400, "Please provide the avatar")
    // }

    const avatarLocalPath = req.file.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Please provide the avatar")
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(req.body?._id, 
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    if(!user){
        throw new ApiError(400, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "File uploaded successfully")
    )
})
const updateUserCoverImage = asyncHandler(async(req, res)=>{
    
    const coverImageLocalPath = req.file.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Please provide the Cover Image")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading on Cover Image")
    }

    const user = await User.findByIdAndUpdate(req.body?._id, 
        {
            $set:{
                coverImage : coverImage.url
            }
        },
        {new : true}
    ).select("-password")

    if(!user){
        throw new ApiError(400, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "File uploaded successfully")
    )
})

const getUserChannelProfile = asyncHandler(async(req, res)=>{
        const {username} = req.params

        if (!username?.trim()) {
            throw new ApiError(400, "User name not found")
        }

        const channel = await User.aggregate([
            {
                $match : {username : username?.toLowerCase()}
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as:"subscribers"
                }
            },
            {
                $lookup:{
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as:"subscribedTo"
                }
            },
            {
                $addFields:{
                    subscribersCount : {
                        $size : "$subscribers"
                    },
                    channelsSubscribedToCount : {
                        $size: "$subscribedTo"
                    },
                    isSubscribed : {
                        $cond: {
                            if:{$in : [req.user._id, "$subscribers.subscriber"]},
                            then: true,
                            else : false
                        }
                    }
                }
            },
            {
                $project:{
                    fullname:1,
                    username: 1,
                    subscribersCount:1,
                    channelsSubscribedToCount:1,
                    isSubscribed:1,
                    email:1,
                    avatar:1,
                    coverImage:1
                }
            }
        ])

        // console.log("channel" , channel);

        if(!channel?.length){
            throw new ApiError(400, "Channel does not exists")
        }

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                channel[0],
                "User channel fetched successfully"
            )
        )
})

const getWatchHistory =asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField: "_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully")
    )
})

const getTweetOwner = asyncHandler(async(req, res)=>{
    const user = await User.aggregate([
        {
            $match:{
                _id: mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "tweets",
                localField: "_id",
                foreignField:"owner",
                as: "owner"
            }
        },
        {
            $project:{
                username:1,
                fullname:1,
                email:1,
                avatar:1,
                coverImage:1
            }
        }
    ])

    if(!user?.length){
        throw new ApiError(400, "User not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0], "Tweet Owner fetched successfully")
    )
})

export {registerUser,
     loginUser, 
     logoutUser,
     renewRefreshToken,
     changeCurrentPassword,
     getCurrentUser,
     updateUserDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory,
     getTweetOwner
    }