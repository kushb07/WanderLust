const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'dlzhugmyi', 
  api_key: '652183297998888', 
  api_secret: 'gZe2uzjwnwuRzoRpzDEu58rxTsg' 
});

// console.log();



const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats : ["jpg" , "png" , "jpeg"],
    },
  });

  module.exports = {cloudinary, storage};