const Listing = require("../models/listing");

module.exports.index = async (req,res) =>
{
    const listingData = await Listing.find({});
    res.render("listings/index.ejs" , {listingData});
    // console.log(listingData);
};


module.exports.renderNewListingFrom = (req,res) =>
{
        res.render("listings/new.ejs");   
}


module.exports.showListing = async (req ,res)=>
{
    let {id} = req.params;
    const listingData = await Listing.findById(id).populate("reviews");
    if(!listingData)
    {
        req.flash("error" , "Listing You Requested For , Does Not Exit");
        res.redirect("/listings");
    }
    res.cookie("greet" , "hello");
    res.render("listings/show.ejs" , {listingData});
}

module.exports.createNewListing = async (req,res,next)=>
{

            // let {result} = listingSchema.validate(req.body);
            // console.log(result);
   
            let {title , description , price ,location , country} = req.body;
            const newListing = new Listing({
                title : title,
                description:description,
                price:price.toLocaleString("en-IN"),
                location:location,
                country:country,
            });

            await newListing.save();
            req.flash("sucess" , "New Listing Created!!");
            res.redirect("/listings");
       
}

module.exports.renderEditForm = async (req,res,next)=>
{
    try{
            let {id} =  req.params;
            const currListing = await Listing.findById(id);
            // console.log(currListing.title);
            // console.log(currListing.price);
            if(!currListing)
            {
                req.flash("error" , "Listing You Requested For , Does Not Exit");
                res.redirect("/listings");
            }
            res.render("listings/edit.ejs" , {currListing});
        }
    catch(err)
        {
            next(err);
        }

}

module.exports.updateListing = async (req,res,next) =>
{

try{
        let {id} = req.params;
        let listing = await Listing.findById(id);
        let {title , description , price , location , country} = req.body;

        if(price<0)
        {
            throw new Error("enter positive price bkl");
        }

        listing.title = title;
        listing.description = description;
        listing.price = price;
        listing.location = location;
        listing.country = country;
        listing.save()

        req.flash("sucess" , "Listing Updated!!")
        res.redirect("/listings");
} 
catch(err){
        next(err);
}

}



module.exports.destroyListing = async (req,res)=>
{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("sucess" , "Listing Deleted!!");
    res.redirect("/listings");
}

