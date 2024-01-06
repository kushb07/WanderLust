const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const ExpressError = require("../ExpressError.js");
const { listingSchema }= require("../schema.js");
const listingController = require("../controller/listing.js");
//for uploading the file/photo of listing
const multer = require("multer");
const {storage} = require("../CloudConfig.js");
const upload = multer({storage : storage});

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN
const geocodingClient = mbxGeocoding({ accessToken: "pk.eyJ1Ijoia3VzaC1iYWphaiIsImEiOiJjbHFneTV0ZXkxYTk5MmtvNm95emJjNGZlIn0.leoeT-6Jq5uyyYUIJZw68g" });

//for error handling
function wrapAsync(fn) {
    return function(req,res,next){
        fn(req,res,next).catch((err) => next(err));
    }
};


const isLoggedIn =  ((req,res,next)=>{
       //it stores the info about the user and using this only passport authenticate wheter user is logged 
    //in or not
    // console.log(req.user);
    if(!req.isAuthenticated())
    {
        req.flash("error" , "You must be logged in!");
        res.redirect("/login");
    }
    next();
});

const isOwner = async (req,res,next) => {
    const {id} = req.params;
    let listing = await Listing.findById(id);

    if(res.locals.currUser &&      !listing.owner._id.equals(res.locals.currUser._id))
    {
        req.flash("error" ,"You are not the owner of the listing");
        return res.redirect(`/listings/${id}`);
    }

    next();
}



//for schema validation
const validateListing = (req,res,next) =>
{
    let {error} = listingSchema.validate(req.body);

    if(error)
    {
        throw new ExpressError(404 , error);
    }
    else
    {
        next();
    }
};



router.route("/")
.get(wrapAsync (async (req,res) =>
{
    const listingData = await Listing.find({});
    res.render("listings/index.ejs" , {listingData});
    // console.log(listingData);
}))
.post(
    isLoggedIn,upload.single('image') ,wrapAsync (async (req,res,next)=>
{

            let response = await  geocodingClient.forwardGeocode({
                query: req.body.location,
                limit: 1,
            })
                .send()

              
               
   
            let {title , description , price ,location , country , category} = req.body;
            let url = req.file.path;
            let filename = req.file.filename;
            // console.log(req.file);
            // console.log(url , filename);
            // console.log("req.body");
            // console.log(req.body);
            const newListing = new Listing({
                title : title,
                description:description,
                price:price,
                location:location,
                country:country,
                category : category,
            });
           
            newListing.owner = req.user._id;
            newListing.image = {url,filename};
            newListing.geometry =   response.body.features[0].geometry;

            // console.log("new listing --->");
            // console.log(newListing);

            await newListing.save();
            // console.log(newListing);
            req.flash("sucess" , "New Listing Created!!");
            res.redirect("/listings");
       
}));





//this have to be placed above /listings/id bcz router will trying to match new with id and will give
//error  
//new route ---->
router.get("/new" ,isLoggedIn, (req,res) =>
{
        res.render("listings/new.ejs");   
});


//show routes
router.route("/:id")
.get( wrapAsync (async (req ,res)=>
{
    let {id} = req.params;
    const listingData = await Listing.findById(id).populate({path : "reviews" , populate : { path : "author"},}).populate("owner");
    if(!listingData)
    {
        // now we will access this flash message using error of locals used in flash.ejs inside include 
        // folder with the help of alert message 
        req.flash("error" , "Listing You Requested For , Does Not Exit");
        res.redirect("/listings");
    }


    // this is for map related work to be display in show page
    let response = await  geocodingClient.forwardGeocode({
        query: listingData.location,
        limit: 1,
    })
        .send();

    listingData.geometry =   response.body.features[0].geometry;
    // console.log(listingData);
    res.cookie("greet" , "hello");
    res.render("listings/show.ejs" , {listingData});
}))
//update route
.patch(isLoggedIn, isOwner , upload.single('image'), wrapAsync(async (req,res,next) =>
{

try{
        let {id} = req.params;
        let listing = await Listing.findById(id);


        //for authorizing the routes so that no user other than owner can edit the listing
        //this have been now implemented by isOwner middleware above in the code
        // if(!listing.owner._id.equals(res.locals.currUser._id))
        // {
        //     req.flash("error" , "you dont have permission to edit");
        //     return  res.redirect(`/listings/${id}`);
        // }
        let {title , description , price , location , country} = req.body;
        if(req.file){
            let url = req.file.path;
            let filename = req.file.filename;
            // console.log(url ,"........" ,filename);
            listing.image.path = url;
            listing.image.filename = filename;
        }
        if(price<0)
        {
            throw new Error("Please enter positive price");
        }

        listing.title = title;
        listing.description = description;
        listing.price = price;
        listing.location = location;
        listing.country = country;
        listing.save()

        req.flash("sucess" , "Listing Updated!!");
        res.redirect(`/listings/${id}`);
    } 
    catch(err){
            next(err);
    }

})
)
.delete(isLoggedIn,isOwner, wrapAsync (async (req,res)=>
{
    let {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("sucess" , "Listing Deleted!!");
    res.redirect("/listings");
}))



//index route ----->
//here index will be required from listingController similarly we can do this for our every route of listing
//but i'm leaving this as it is so that i can understand them properly
// router.get("/" ,wrapAsync (listingController.index));





//show route --->
// router.get("/:id" , wrapAsync (async (req ,res)=>
// {
//     let {id} = req.params;
//     const listingData = await Listing.findById(id).populate("reviews");
//     if(!listingData)
//     {
//         req.flash("error" , "Listing You Requested For , Does Not Exit");
//         res.redirect("/listings");
//     }
//     res.cookie("greet" , "hello");
//     res.render("listings/show.ejs" , {listingData});
// }));





// create route  --->
//we have implemented it using the router.route in above
// router.post("/" ,isLoggedIn,  wrapAsync (async (req,res,next)=>
// {

//             // let {result} = listingSchema.validate(req.body);
//             // console.log(result);
   
//             let {title , description , price ,location , country} = req.body;
//             const newListing = new Listing({
//                 title : title,
//                 description:description,
//                 price:price.toLocaleString("en-IN"),
//                 location:location,
//                 country:country,
//             });

//             await newListing.save();
//             req.flash("sucess" , "New Listing Created!!");
//             res.redirect("/listings");
       
// }));



//category route--->
router.get("/category/:option" , async (req,res)=>
{
    let {option} = req.params;
    let listingData = await Listing.find({category : option});
    if(!listingData.length)
    {
        // console.log("error");
         req.flash("error" , "Listing for choosen category does not exist!!");
         res.redirect("/listings");
    }
    // console.log(listingData);
    else{
        // console.log("success");
        // console.log(listingData);
    res.render("listings/index.ejs" , {listingData});
    }
});



router.post("/search" , async (req,res)=>{
    let {dest} = req.body;
     let listingData = await Listing.find({location : dest});

     if(!listingData.length)
     {
         // console.log("error");
          req.flash("error" , `No listing availabe at ${dest}!!`);
          res.redirect("/listings");
     }
     // console.log(listingData);
     else{
         // console.log("success");
         // console.log(listingData);
     res.render("listings/index.ejs" , {listingData});
     }
})




//edit route ---->
router.get("/:id/edit" ,isLoggedIn, isOwner,wrapAsync (async (req,res,next)=>
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
            let originalImageUrl = currListing.image.url;
            let changedImage = originalImageUrl.replace('/upload' , '/upload/w_250');
            // let changedImage = originalImageUrl.replace('&w' , '&w=20');
            // console.log(changedImage);
            res.render("listings/edit.ejs" , {currListing , changedImage});
        }
    catch(err)
        {
            next(err);
        }

})
);


//update route ---->
// router.patch("/:id" ,isLoggedIn, wrapAsync(async (req,res,next) =>
// {

// try{
//         let {id} = req.params;
//         let listing = await Listing.findById(id);
//         let {title , description , price , location , country} = req.body;

//         if(price<0)
//         {
//             throw new Error("enter positive price bkl");
//         }

//         listing.title = title;
//         listing.description = description;
//         listing.price = price;
//         listing.location = location;
//         listing.country = country;
//         listing.save()

//         req.flash("sucess" , "Listing Updated!!")
//         res.redirect("/listings");
// } 
// catch(err){
//         next(err);
// }

// })
// );



//delete route ----->

// router.delete("/:id" ,isLoggedIn, wrapAsync (async (req,res)=>
// {
//     let {id} = req.params;
//     await Listing.findByIdAndDelete(id);
//     req.flash("sucess" , "Listing Deleted!!");
//     res.redirect("/listings");
// }));



module.exports = router;