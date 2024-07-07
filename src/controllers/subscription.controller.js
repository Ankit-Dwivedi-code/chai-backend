import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Channel Id is not found")
    }

    const subscriber = await Subscription.findById()

    if(!subscriber){
        throw new ApiError(400, "channel not found in toggle subscription!")
    }

    

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscriber, "Subscription toggled successfully")
    )
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel : mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as : "subscriber"
            }
        },
        {
            $addFields:{
                subscriber : {$first: "subscriber"}
            }
        },
        {
            $project:{
                _id: 0, // Hide the _id field from Subscription document
                'subscriber._id': 1,
                'subscriber.username': 1,
                'subscriber.fullname': 1,
                'subscriber.email': 1,
                'subscriber.avatar': 1,
                'subscriber.coverImage': 1
            }
        }
    ])
    if(!subscribers.length){
        throw new ApiError(404, "No subscribers found for this channel");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            "Subscribers fetched successfully"
        )
    );
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}