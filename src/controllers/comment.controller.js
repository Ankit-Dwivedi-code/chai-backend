import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { ApiError } from "../utils/apiError";
import { Comment } from "../models/comment.model";


const commentController = asyncHandler(async(req, res)=>{
    const {content} = req.body;

    if(!content){
        throw new ApiError(400, "Content is required")
        }

    const comment = await Comment.create({
        content,
        video : req.video._id,
        owner  : req.user._id,
    })

    if (!comment) {
        throw new ApiError(500, "Server Error")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment Created Successfully",)
    )


})