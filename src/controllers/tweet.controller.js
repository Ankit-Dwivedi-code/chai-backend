import {asyncHandler} from '../utils/asyncHandler.js'
import { Tweet } from '../models/tweet.model.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/user.model.js';
import mongoose, { set } from 'mongoose';

const createTweet = asyncHandler(async(req, res)=>{
    const {content} = req.body

    if(!content){
        throw new ApiError(400, "Content is required")
    }

    const tweet = await Tweet.create({
        owner: new mongoose.Types.ObjectId(req.user._id),
        content
    })

    return res
    .status(201)
    .json(
        new ApiResponse(201, tweet, "Tweet created successfully!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params

    if (!userId?.trim()) {
        throw new ApiError(400, "UserId not found in fetching the tweets")
    }

    const allTweets =await User.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup:{
                from: 'tweets',
                localField: '_id',
                foreignField: 'owner',
                as: 'user_tweets'
            }
        },
        {
            $project:{
                user_tweets:1
            }
        }
    ])

    if(!allTweets.length){
        throw new ApiError(400, "User does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, allTweets[0].user_tweets, "All tweets are fetched successfully" )
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    //get the tweet 
    const {newTweet} = req.body

    if(!newTweet.trim()){
        throw new ApiError(400, "Please provide the tweet to be updated")
    }

    const tweetId = req.params.tweetId

    //update the tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        {
            _id : new mongoose.Types.ObjectId(tweetId)
        },
        {
            $set : { content : newTweet }
        },
        {
            new : true
        }
    )

    if(!updateTweet){
        throw new ApiError(400, "The tweet to be updated does not exists")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "The tweet to be updated is successfully updated!")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if(!tweetId.trim()){
        throw new ApiError(400, "Please provide the tweet id to be deleted")
    }

    await Tweet.findByIdAndDelete(tweetId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "The tweet is successfully deleted!")
    )
})

export {createTweet, getUserTweets, updateTweet, deleteTweet}