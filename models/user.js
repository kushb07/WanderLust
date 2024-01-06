const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
    },
});

//to directly ading the password and username field in the userSchema
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User" , userSchema);

module.exports = User;