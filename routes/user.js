const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const ExpressError = require("../ExpressError.js");
const passport = require("passport");
const userController = require("../controller/user.js");

//for error handling
function wrapAsync(fn) {
    return function(req,res,next){
        fn(req,res,next).catch((err) => next(err));
    }
};


router.route("/signup")
.get((req,res)=>{
    res.render("users/signup.ejs");
})
.post(wrapAsync(async(req,res)=>
{
  try{
    let { email , username , password } = req.body;
    
    let user = new User({
        email : email,
        username : username,
    });

    let data = await User.register(user , password);
    // console.log(data);


    //this will help us to get directly logged in as soon as we signup on the wandderlust
    req.login(data , (err)=>{
        if(err){
            next(err);
        }
        req.flash("sucess" , "Welcome To WanderLust");
        res.redirect("/listings");
    });
  }
  catch(error){
    req.flash("error" , error.message);
    res.redirect("/signup");
  }
}));


router.route("/login")
.get((req,res)=>{
    res.render("users/login.ejs");
})
.post(
passport.authenticate("local" , {failureRedirect : "/login" , failureFlash : false}),
 async (req,res)=>
{
   req.flash("sucess" , "Welcome back to WanderLust . You are Logged in");
   res.redirect("/listings");

});




// router.get("/signup" , (req,res)=>{
//     res.render("users/signup.ejs");
// });


// router.post("/signup" , wrapAsync(async(req,res)=>
// {
//   try{
//     let { email , username , password } = req.body;
    
//     let user = new User({
//         email : email,
//         username : username,
//     });

//     let data = await User.register(user , password);
//     console.log(data);


//     //this will help us to get directly logged in as soon as we signup on the wandderlust
//     req.login(data , (err)=>{
//         if(err){
//             next(err);
//         }
//         req.flash("sucess" , "Welcome To WanderLust");
//         res.redirect("/listings");
//     });
//   }
//   catch(error){
//     req.flash("error" , error.message);
//     res.redirect("/signup");
//   }
// }));


// router.get("/login" , (req,res)=>{
//     res.render("users/login.ejs");
// });

// router.post("/login" ,
// passport.authenticate("local" , {failureRedirect : "/login" , failureFlash : true}),
//  async (req,res)=>
// {
//    req.flash("sucess" , "Welcome back to WanderLust . You are Logged in");
//    res.redirect("/listings");

// });


router.get("/logout" , (req,res)=>{
    req.logout((err)=>
    {
        if(err){
            next(err);
        }
        req.flash("sucess" , "you are logged out!!");
        res.redirect("/listings");
    })
})


module.exports = router;