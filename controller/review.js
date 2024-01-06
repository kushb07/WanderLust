const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.craeteReview = async(req,res)=>
{
    let {id}  = req.params;
    let listing =await Listing.findById(id);
    console.log(id);

    let { rating , comment} = req.body;

    let newReview = new Review({
        rating : rating ,
        comment : comment,
    });

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review added");
    req.flash("sucess" , "New Review Added!!")
    res.redirect(`/listings/${listing._id}`);
}


module.exports.destroyReview = async (req,res)=>
{
    let {id , reviewid} = req.params;

    let listing = await Listing.findByIdAndUpdate(id , {$pull : {reviews : reviewid}});
    let review = await Review.findByIdAndDelete(reviewid);
    req.flash("sucess" , "Review Deleted!!")
    res.redirect(`/listings/${id}`);
}