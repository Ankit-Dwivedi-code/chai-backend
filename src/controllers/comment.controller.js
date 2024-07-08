import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { ApiError } from '../utils/apiError.js'
import { ApiResponse } from '../utils/apiResponse.js';
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

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