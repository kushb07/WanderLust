const express = require("express");
const router = express.Router({mergeParams : true});
const ExpressError = require("../ExpressError.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {reviewSchema }= require("../schema.js");

const reviewController = require("../controller/review.js");


const isLoggedIn =  ((req,res,next)=>{
    //it stores the info about the user and using this only passport authenticate wheter user is logged 
 //in or not
 // console.log(req.user);
 if(!req.isAuthenticated())
 {
     req.flash("error" , "You must be logged in");
     res.redirect("/login");
 }
 next();
});



//for schema validation of reviews-->
const validateReview = (req,res,next) =>
{
    let {error} = reviewSchema.validate(req.body);

    if(error)
    {
        throw new ExpressError(404 , error);
    }
    else
    {
        next();
    }
}


//for error handling
function wrapAsync(fn) {
    return function(req,res,next){
        fn(req,res,next).catch((err) => next(err));
    }
};

// review post route

router.post("/" , isLoggedIn, wrapAsync (async(req,res)=>
{
    let {id}  = req.params;
    let listing =await Listing.findById(id);
    // console.log(id);

    let { rating , comment} = req.body;

    let newReview = new Review({
        rating : rating ,
        comment : comment,
    });

    newReview.author = req.user._id;
    // console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review added");
    req.flash("sucess" , "New Review Added!!")
    res.redirect(`/listings/${listing._id}`);
}));


// delete review route

router.post("/:reviewid" ,isLoggedIn, wrapAsync(async (req,res)=>
{
    let {id , reviewid} = req.params;

    let rev = await Review.findById(reviewid);

    if(!rev.author._id.equals(res.locals.currUser._id))
    {
        req.flash("error" , "You are not the author of this review");
        return res.redirect(`/listings/${id}`);
    }

    let listing = await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewid}});
    let review = await Review.findByIdAndDelete(reviewid);
    req.flash("sucess" , "Review Deleted!!")
    res.redirect(`/listings/${id}`);
}));

module.exports = router;