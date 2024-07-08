
import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    // console.log(videoId);
    
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is not valid")
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: req.user._id }); //The find method returns an array, so you need to use findOne to get a single document.

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
         return res.status(200).json(new ApiResponse(200, null, "Like removed successfully"));
    }else{
         const newLike = await Like.create({
            video : videoId,
            likedBy : req.user._id
        })
        return res
    .status(200)
    .json(
        new ApiResponse(200, newLike, "Liked added successfully")
    )
    }

    
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    // console.log(commentId);

    const userId =  req.user._id
   
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment Id is invalid")
    }

    const existingLike = await Like.findOne({
        comment : commentId,
        likedBy : userId
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Liked removed successfully")
        )
    }else{
        const newLike = await Like.create({
            comment : commentId,
            likedBy : userId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, newLike, "Liked added successfully")
        )
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId =  req.user._id
   
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Tweet Id is invalid")
    }

    const existingLike = await Like.findOne({
        tweet : tweetId,
        likedBy : userId
    })

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id)
        return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Liked removed successfully")
        )
    }else{
        const newLike = await Like.create({
            tweet : tweetId,
            likedBy : userId
        })

        return res
        .status(200)
        .json(
            new ApiResponse(200, newLike, "Liked added successfully")
        )
    }
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User Id");
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } }).populate('video', 'title description videoFile');//It populates the video field to include detailed information about each liked video. otherwise it return omly video id

    if (!likedVideos.length) {
        throw new ApiError(404, "No liked videos found for this user");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos.map(like => like.video), "Liked videos fetched successfully")
    );


})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
