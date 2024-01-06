const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.set("views engine" , "ejs");
app.set("views" , path.join(__dirname , "views"));

app.listen("3000" , ()=>
{
    console.log("listening on port 3000");
});

app.use(session({
    secret : "mysecretcode",
    resave : false,
    saveUninitialized : true
}));

app.use(flash());



//here we are creating a temparory variable as name in session to store something it will be changed every
//time we go on register path with differnet name in the query
app.get("/register" ,(req,res)=>{
    let {name = "anonymus"} = req.query;
    req.session.name = name;
    req.flash("sucess" , "User register successfully!!");
    res.redirect("/hello");
});


app.get("/hello" ,(req,res)=>{
  
    res.render("hello.ejs" , { name : req.session.name,  messages : req.flash('sucess')});
});



// app.get('/flash', function(req, res){
//   // Set a flash message by passing the key, followed by the value, to req.flash().
//   req.flash('info', 'Flash is back!')
//   res.redirect('/');
// });
 
// app.get('/', function(req, res){
//   // Get an array of flash messages by passing the key to req.flash()
//   res.render('hello.ejs', { messages: req.flash('info') });
// });



app.get("/test" , (req,res)=>
{
    res.send("test Successful");
});



//even on changing the tab on same browser the count will remain continous as it will be consider as
//a same session between client and server but if we change our browser than it will be considered as 
//a different session as this time session id  will be different from that of previous browser session id
app.get("/reqcount" ,(req,res)=>
{
    if(req.session.count)
    {
        req.session.count++;
    }
    else
    {
        req.session.count = 1;
    }

    res.send(`you visited ${req.session.count} times`);
});


