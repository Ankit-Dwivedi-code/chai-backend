import {asyncHandler} from '../utils/asyncHandler.js'
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/apiResponse.js';

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
    console.log(email);
    console.log(req.body);
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
    console.log("Existed User : ", existedUser);

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

    console.log("createdUser : ", createdUser);

    if(!createdUser){
        throw new ApiError(500, "Something went wrong on creating the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd Successfully")
    ) 


})


// const loginUser = asyncHandler(async(req, res)=>{
//     res.status(200).json({
//         message:"Login karo"
//     })
//     res.send("ok bye") Both are correct
// })

export {registerUser}