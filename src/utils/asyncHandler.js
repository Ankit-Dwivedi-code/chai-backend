//This file for wrap the function of connetion to mongo db it helps to create a method to connect to the database whenever you want
// It is a higher order function
// The asyncHandler function is used to wrap asynchronous route handlers and middleware functions in Express. It simplifies error handling by automatically catching any errors thrown during asynchronous operations and passing them to Express's error-handling middleware.
// Without asyncHandler, you would need to manually try-catch every asynchronous route handler to pass errors to next. This utility function eliminates that boilerplate code.
const asyncHandler = (requestHandler) =>{  //asyncHandler is defined as a higher-order function. It takes a single argument, 
    return (req, res, next) =>{  //Inside asyncHandler, it returns a new function that takes req, res, and next as parameters.
        Promise.resolve(requestHandler(req, res, next)) //Inside the returned function, it wraps the requestHandler call in Promise.resolve(). This ensures that even if requestHandler is not already returning a promise, it will be converted into a promise.
        .catch((err)=> next(err))  //If the promise is rejected (i.e., an error occurs), the .catch method catches the error and passes it to next(err). This allows Express to handle the error using its error-handling middleware.
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