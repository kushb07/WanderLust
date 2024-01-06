require('dotenv').config()

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const exp = require("constants");
const methodOverride = require('method-override');
const ejsMate = require("ejs-mate");
const ExpressError = require("./ExpressError.js");
const { listingSchema , reviewSchema }= require("./schema.js");


const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const flash = require("connect-flash");
const MongoStore = require('connect-mongo');

//passport is used for authentication
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.js");


   




app.use(methodOverride("_method"));

app.set("views engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));

app.use(express.urlencoded({extended:true}));
app.engine("ejs" , ejsMate);

app.use(express.static(path.join(__dirname , "/public")));




const store = MongoStore.create({
    mongoUrl : 'mongodb+srv://Kush:Kush0705@cluster0.fdyqvum.mongodb.net/?retryWrites=true&w=majority',
    crypto:{
        secret : process.env.SECRET,
    },
    touchAfter : 24* 60 * 60,
});

store.on("error" , ()=>{
    console.log("Error in mongoStore" , err);
})

//session is required to use flash and passport
app.use(session({
    secret : process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie :{
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge : 7 * 24 * 60 * 60 * 1000,
        httpOnly : true,
    },
}));



app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//serialize user into session
passport.serializeUser(User.serializeUser());
//deserialize user into session
passport.deserializeUser(User.deserializeUser());

//here we are storing the sucess msg in local which can be access inside any ejs which will be shown
//when we will add a new listing
app.use((req,res,next) =>
{
    res.locals.sucess = req.flash("sucess");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

main()
.then(() => {console.log("Connected Successfully to db")})
.catch((err) => {console.log(err)});




async function main()
{
    await mongoose.connect('mongodb+srv://Kush:Kush0705@cluster0.fdyqvum.mongodb.net/?retryWrites=true&w=majority');
};


app.listen("8080" , () =>
{
    console.log("app is listening to 8080");
});


// app.get("/" , (req , res)=>
// {
//     res.send("I am root");
// });


//for error handling
function wrapAsync(fn) {
    return function(req,res,next){
        fn(req,res,next).catch((err) => next(err));
    }
};


//which ever path starts from /listings we should match that with all the paths of the listing file
//that is inside routes folder
app.use("/listings" , listingRouter);

//similarly here also just like above
app.use("/listings/:id/reviews" , reviewRouter);

app.use("/" , userRouter);




app.get("/demouser" , async(req,res)=>
{
    const fakeUser = new User({
        email : "stu@gmail.com",
        username : "kush123",
    });

    const data = await User.register(fakeUser , "Kush@0705");
    res.send(data);
});






//this will gonna throw errors whenever we will try to call the path which were not created
//by us
app.all("*" , (req,res,next)=>
{
    next(new ExpressError(404 , "No page found!!"));
});



//before this error handling middleware , site is getting crashed when we were entering price as negative 
//bcz there is no one to handle database error , but as we have created this now it will throw an error 
//as soon as some rules or validation are break on database side/server side

app.use((err,req,res,next)=>
{
    let {status = 500 , message} = err;
    res.status(status).render("listings/error.ejs" , {message});
});

