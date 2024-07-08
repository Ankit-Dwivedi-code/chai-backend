import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js';
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Video Id is not valid")
    }

    const comments = await Comment.find({video : videoId})
    // .populate('owner', 'username avatar') //This will populate the owner details
    .skip((page-1) * limit)
    .limit(limit)
    .sort({createdAt : -1}) // Sort by creation date by decending order

    if(!comments){
        throw new ApiError(404, "No Comments found")
    }

    // const totalComments = await Comment.countDocuments({ video: videoId });  //this will count the total number of comments

    return res
    .status(200)
    .json(
        new ApiResponse(200, {comments, page, limit}, "Comments fetched successfully")
    )

})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} =  req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, 'Video page is required')
    }
    const {content} = req.body

    if(!content){
        throw new ApiError(400, 'Comment is required')
    }
    const comment = await Comment.create(
       { content,
        video: videoId,
        owner : req.user._id
    }
    )

    if(!comment){
        throw new ApiError(401, "Failed to add a comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment added successfully")
    )

})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const {content} = req.body
    if(!content){
        throw new ApiError(400, "Content cannot be empty")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,{
        content : content,
    },
    {
        new : true
    }
    )

    if(!comment){
        throw new ApiError(404, "comment not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment updated successfully")
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Comment deleted successfully")
    )
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }