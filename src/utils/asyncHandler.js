//This file for wrap the function of connetion to mongo db it helps to create a method to connect to the database whenever you want

const asyncHandler = (requestHandler) =>{
    (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err)=> next(err))
    }
}

export {asyncHandler}


// const asyncHandler = (fn)=> async(req, res, next) =>{
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             message : error.message
//         })
//     }
// }