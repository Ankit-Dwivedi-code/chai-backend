import {asyncHandler} from '../utils/asyncHandler.js'
import {Video} from '../models/video.model.js'
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const uploadVideoAndThumbnail = asyncHandler(async(req, res)=>{

        const {title, description, duration} = req.body

        if(!title || !description || !duration){
            throw new ApiError(400, "Title , description and duration is required!")
        }



        const videoFileLocalPath = req.files?.videoFile[0]?.path

        if(!videoFileLocalPath){
            throw new ApiError(400, "Video file is missing")
        }

        const thumbnailLocalPath = req.files?.thumbnail[0]?.path

        if(!thumbnailLocalPath){
            throw new ApiError(400, "Thumbnail is rerquired")
        }

        const videoFile = await uploadOnCloudinary(videoFileLocalPath)

        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

        if(!videoFile.url || !thumbnail.url){
            throw new ApiError(400, "Error on uploading video or thumbnail on cloudinary")
        }


        const video =await Video.create({
            duration : Number(duration),
            title,
            description,
            videoFile : videoFile.url,
            thumbnail : thumbnail.url,
            owner : req.user._id,
            isPublished : true
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video uploaded successfully")
        )

})

export {uploadVideoAndThumbnail}