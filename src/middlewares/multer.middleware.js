import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { //cb means callback
      cb(null, "./public/temp") //null for error and second arguement is the file path
    },
    filename: function (req, file, cb) { //It will return the file name
      cb(null, file.originalname) //by which name you want to upload your file
    }
  })
  
   export const upload = multer({ 
    storage: storage
 })