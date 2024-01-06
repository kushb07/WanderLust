const mongoose = require("mongoose");
const Review = require("./review.js");

const listingSchema = new mongoose.Schema({
    title : 
    {
        type : String,
        required : true,
    },
    description :
    {
        type: String,
    },
    image :
    {
        url : String,
        filename : String,
     },
    price :
    {
        type : Number,
        min : 1,
    },
    location :
    {
        type: String,
    },
    country :
    {
        type : String
    },
    reviews : [{
        type : mongoose.Schema.Types.ObjectId ,
         ref : "Review",
    }],
    geometry : {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
        },
        coordinates: {
          type: [Number],
        }
      },
      category : {
        type : String ,
        enum : ["trending" , "rooms" , "iconicCities" , "mountain" , "castles" , "amazingPools" , "camping" , "farms" , "arctic"],
      },
      owner : {
        type : mongoose.Schema.Types.ObjectId , 
        ref : "User",
      }
});


listingSchema.post("findOneAndDelete" , async (listing)=>
{
    if(listing.reviews.length)
    {
        await Review.deleteMany({_id : {$in : listing.reviews}});
    }
});


const Listing = mongoose.model("Listing" , listingSchema);


module.exports = Listing;