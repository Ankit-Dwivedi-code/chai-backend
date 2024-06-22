class ApiResponse {
    constructor(statusCode, data, message = "Success"){
        this.statusCode = statusCode  //The HTTP status code of the response.
        this.data = data  //The data to be included in the response.
        this.message = message  //A message describing the response (default is "Success" if not provided).
        this.success = statusCode < 400 // Initializes the success property based on the statusCode. This property is a boolean indicating whether the response indicates a successful request. By convention, HTTP status codes below 400 represent success, so statusCode < 400 will be true for successful responses and false for error responses.
    }
}



// const response = new ApiResponse(200, { id: 1, name: "John Doe" });
// console.log(response);
// // Output:
// // ApiResponse {
// //   statusCode: 200,
// //   data: { id: 1, name: "John Doe" },
// //   message: "Success",
// //   success: true
// // }

// const errorResponse = new ApiResponse(404, null, "Resource not found");
// console.log(errorResponse);
// // Output:
// // ApiResponse {
// //   statusCode: 404,
// //   data: null,
// //   message: "Resource not found",
// //   success: false
// // }
