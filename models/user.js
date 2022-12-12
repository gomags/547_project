var mongoose=require("mongoose");
var passportlocalmongoose=require("passport-local-mongoose");
const dbUrl = 'mongodb://localhost:27017/project';
mongoose.connect(dbUrl, {  
    useUnifiedTopology: true,
});
var UserSchema=mongoose.Schema({
    username: String,
    Password: String
});

UserSchema.plugin(passportlocalmongoose);
module.exports=mongoose.model("User", UserSchema);