import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const commentSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true
    },
    video:{
        type : mongoose.Schema.Types.ObjectId, // video id of the video that is commented on
        ref : "Video"
    },
    owner:{
        type : mongoose.Schema.Types.ObjectId,  // user id of the owner of this comment (commenter) 
        ref : "User"
    }
}, { timestamps: true })

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)