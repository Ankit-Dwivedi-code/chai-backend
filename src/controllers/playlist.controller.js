import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name and description is required!")
    }
    
    const playlist = await Playlist.create(
        {
            name,
            description,
            // videos: [],
            owner : req.user._id
        }
    )

    if (!playlist) {
        throw new ApiError(404, "Error in creating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist created successfully")
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "UserId is not valid")
    }

    const playlists = await Playlist.find({owner : userId})

    if(!playlists){
        throw new ApiError(404, "No playlist found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlist successfully fetched"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist ID is not valid")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "Error in finding the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Playlist or video Id is not valid")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        { $push: { videos: videoId } },
        {
            new : true
        }
    )

    if(!playlist){
        throw new ApiError(404, "Unable to update playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Video added successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Playlist or video Id is not valid")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } }, // Use $pull to remove videoId from videos array
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Unable to update playlist");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "Video removed successfully")
        );

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400, "Invalid playlist Id")
    }

    await Playlist.findByIdAndDelete(playlistId)

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Playlist deleted successfully")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId){
        throw new ApiError(400, "Invalid playlist Id")
    }

    if(!name || !description){
        throw new ApiError(400, "Name or description is required")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            name : name,
            description : description
        },
        {
            new : true
        }
    )

    if (!playlist) {
        throw new ApiError(404, "Error in updating the playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "Playlist updated successfully")
    )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}