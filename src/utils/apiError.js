class ApiError extends Error{
    constructor (
        statusCode,  //The HTTP status code related to the error
        message = "Something went wrong", //A descriptive error message. It defaults to "Something went wrong" if not provided.
        errors = [],  //An array to hold additional error details. It defaults to an empty array.
        stack = "" //An optional stack trace. It defaults to an empty string.
    ){
        // Call the parent constructor to set the message property
        super(message);
        
        // Set custom properties specific to ApiError
        this.statusCode = statusCode; // HTTP status code // Initialize the statusCode property
        this.data = null; // Placeholder for additional data if needed // Initialize the data property
        this.message = message; // Error message // The message property, already set by super(message)
        this.success = false; // Indicates the success status (always false for errors)
        this.errors = errors; // Array of additional error details

        // Handle the stack trace
        if (stack) {
            this.stack = stack; // Use the provided stack trace if available
        } else {
            Error.captureStackTrace(this, this.constructor); // Capture the stack trace
        }
    }
}

export {ApiError}