import { User } from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import jwt from 'jsonwebtoken'


export const verifyJWT = asyncHandler(async(req, _, next)=>{

    //get token
    //verify the jwt token by method : jwt.verify
    //find the user by id 
    //set req.user =  user

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
    
        const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        if (!verifiedToken) {
            throw new ApiError(401, "Invalid access token")
        }
    
        const user = await User.findById(verifiedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            throw new ApiError(401, "Invalid access token")
        }
    
        req.user = user

        next()
    } catch (error) {
        throw new ApiError(400, "Invalid access token" || error?.message)
    }
})