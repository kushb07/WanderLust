const User = require("../models/user");


module.exports.renderSignUpForm = (req,res)=>{
    res.render("users/signup.ejs");
}

module.exports.signUp = async(req,res)=>
{
  try{
    let { email , username , password } = req.body;
    
    let user = new User({
        email : email,
        username : username,
    });

    let data = await User.register(user , password);
    console.log(data);


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
}


module.exports.renderLoginForm = (req,res)=>{
    res.render("users/login.ejs");
}

module.exports.login = async (req,res)=>
{
   req.flash("sucess" , "Welcome back to WanderLust . You are Logged in");
   res.redirect("/listings");

}

module.exports.logOut = (req,res)=>{
    req.logout((err)=>
    {
        if(err){
            next(err);
        }
        req.flash("sucess" , "Logged out you");
        res.redirect("/listings");
    })
}