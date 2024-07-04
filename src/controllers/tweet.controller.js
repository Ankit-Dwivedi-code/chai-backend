import {asyncHandler} from '../utils/asyncHandler.js'
import { Tweet } from '../models/tweet.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

const tweetByUSer = asyncHandler(async(req, res)=>{
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        owner: req.user._id,
        content
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "Tweet created successfully!")
    )
})

export {tweetByUSer}