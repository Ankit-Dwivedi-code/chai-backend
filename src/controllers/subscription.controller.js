import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id; 

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid Channel ID");
    }

    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (existingSubscription) {
        // If subscription exists, remove it
        await Subscription.findByIdAndDelete(existingSubscription._id);
    } else {
        // If not, create a new subscription
        await Subscription.create({
            subscriber: userId,
            channel: channelId
        });
    }

    return res.status(200).json(
        new ApiResponse(200, null, "Subscription toggled successfully")
    );
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // console.log(req.params);
    const {channelId} = req.params
    // console.log(channelId);
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel Id")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel : new mongoose.Types.ObjectId(channelId)
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
                subscriber : {$first: "$subscriber"}
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
    // console.log("Received request params:", req.params);
    const { subscriberId } = req.params

    // console.log(subscriberId);

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber Id")
    }

    const subscribedChannel = await  Subscription.aggregate([ // Aggregate query to get channel list of a subscriber (user) and also the count of subscribers for each channel in this array of documents returned by aggregate() function call below
        {
            $match:{
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from: "users", // Collection to join from (i.e. collection name) in the database connected to by mongoose connection below (i.e. dbName variable value above)
                localField: "channel",
                foreignField: "_id",
                as : "channel"
            }
        },
        {
            $unwind: "$channel" // Unwind the array to get channel object directly
        },
        {
            $project:{
                _id: 0,
                'channel._id': 1,
                'channel.username': 1,
                'channel.fullname': 1,
                'channel.email': 1,
                'channel.avatar': 1,
                'channel.coverImage': 1
            }
        }
    ])

    if (!subscribedChannel.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No subscribed channels found for this subscriber")
        );
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannel, "Subscribed channels fetched successfully")
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}