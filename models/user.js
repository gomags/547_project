var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
const dbUrl = "mongodb+srv://admin1:admin1@cluster0.cirpcyl.mongodb.net";
mongoose.connect(dbUrl, {  
    useUnifiedTopology: true,
});
var UserSchema=mongoose.Schema({
    username: String,
    Password: String
});

UserSchema.plugin(passportlocalmongoose);
module.exports=mongoose.model("User", UserSchema);