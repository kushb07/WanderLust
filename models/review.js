const { date } = require("joi");
const mongoose = require("mongoose");


const reviewSchema  = new mongoose.Schema({
    comment : {
        type : String , 
        reuired : true
    },
    rating : {
        type : Number,
        required : true,
        min : 1 ,
        max : 5,
    },
    created_at : {
        type : Date,
        default :Date.now(),
    },
    author: {
        type:mongoose.Schema.Types.ObjectId ,
        ref :"User",
    }
});

const Review = mongoose.model("Review" , reviewSchema);

module.exports = Review;