const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.CLOUD_API_KEY, 
  api_secret: process.env.CLOUD_API_SECRET
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
