import {asyncHandler} from '../utils/asyncHandler.js'
import {Video} from '../models/video.model.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import mongoose, { isValidObjectId } from 'mongoose';

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    // Build filter criteria
    const filter = {};
    if (query) {
        filter.$or = [
            { title: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
        ];
    }
    if (userId) {
        filter.owner = userId;
    }

    // Build sort criteria
    const sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === 'asc' ? 1 : -1;
    }

    try {
        // Find videos with filter, sort, and pagination
        const videos = await Video.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limitNumber);

        // Get total count of videos for pagination
        const totalVideos = await Video.countDocuments(filter);

        // Prepare pagination info
        const pagination = {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalVideos / limitNumber),
            totalVideos
        };

        return res.status(200).json(new ApiResponse(200, { videos, pagination }, "Videos retrieved successfully"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal server error"));
    }
});


const publishAVideo = asyncHandler(async(req, res)=>{

        const {title, description} = req.body

        if(!title || !description){
            throw new ApiError(400, "Title , description is required!")
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

        // console.log(videoFile);

        if(!videoFile.url || !thumbnail.url){
            throw new ApiError(400, "Error on uploading video or thumbnail on cloudinary")
        }

            const videoDuration = videoFile.duration

        const video =await Video.create({
            duration :videoDuration ,
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

const getVideoCommented = asyncHandler(async(req, res)=>{
    const video = await Video.aggregate([
        {
            $match:{
                //match the video
                 _id : mongoose.Types.ObjectId(req.video._id)
            }
        },
        {
            $lookup:{
                from : "comment", //join comment table with video table and get the comments of a particular video.
                localField: "_id",//get all the fields from the comment collection that is joined to the video collection.
                foreignField : "video" ,//get all the fields from the video collection that is joined to the comment collection.
                as : "video" //join comment table with video table and get the comments of a particular video.
            }
        },
        {
            $project:{
                _id : 1, //get only _id field from comment collection that is joined to the video collection.
            }
        }
    ])
    if(!video){
        throw new ApiError(400, "Video not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Id of video fetched")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID format")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Id of video fetched"))
})

const updateVideo = asyncHandler(async (req, res) => {
    //update video details like title, description, thumbnail
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video id is required!")
    }

    const {title, description} = req.body

    if (!(title || description)) {
        throw new ApiError(400, "Title , description is required!")
    }

    const thumbnailPublicUrl = req.file?.path

    if(!thumbnailPublicUrl){
        throw new ApiError(400, "Error on uploading file on multer in updatevideo")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailPublicUrl)

    if(!thumbnail){
        throw new ApiError(400, "Thumbnail not uploaded in uploadVideo")
    }

    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set:{
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        {new : true}
    )

    if(!video){
        throw new ApiError(400, "Video not found")
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "video updated successfully")
    )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    
    if (!videoId) {
        throw new ApiError(400, "Video id is not found in params to delete video!")
    }

    await Video.findByIdAndDelete(videoId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Video deleted successfully")
    )

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId){
        throw new ApiError(400, "Video id is required!")
    }

    const video = await Video.findById(videoId)

    if(!video){throw new ApiError(400, "Video not found")}

     // Toggle the publish status
     video.isPublished = !video.isPublished;

     // Save the updated video document
     await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Publish status of video toggled successfully")
    )
})


export {publishAVideo,getVideoById, updateVideo, deleteVideo, togglePublishStatus, getAllVideos }