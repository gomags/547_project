var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
const dbUrl = "mongodb+srv://ccr_app:ccr_app@cluster0.vo5vzvs.mongodb.net";
mongoose.connect(dbUrl, {  
    useUnifiedTopology: true,
});
var UserSchema=mongoose.Schema({
    username: String,
    Password: String
});

UserSchema.plugin(passportlocalmongoose);
module.exports=mongoose.model("User", UserSchema);