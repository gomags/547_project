const User = require('../models/user');
const { connection_mongo, mongo_DB } = require("../database");


module.exports.renderRegister = (req, res)=> {
    res.render('./register');
}

module.exports.register = async(req, res, next) => {
    try {

        const {email, username, acc_type, password} = req.body;
        
        const user = new User({email, username});

        // pass the user object and password in it and save it in db
        const registerUser = await User.register(user, password);
        
        connection_mongo.connect((err,conn) => {
            if(err) {
              callback(err,null)
            }
            else {
              let db = conn.db(mongo_DB)
              let collection_user = db.collection("users")
              var new_user = new Object();
              new_user.user_id = registerUser._id
              new_user.username = username
              new_user.account = acc_type
              new_user.email = email
              new_user.pass = password
              collection_user.insertOne(new_user)
            //   console.log(collection_user)
            }
          })

        req.login(registerUser, err => {
            if(err) {
                return next(err);
            }
            else {
                req.flash('success', 'Welcome to Community Car Rentals');
                res.redirect('/home');
            }
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

module.exports.renderLogin = (req, res)=> {
    res.render('./login');
};

module.exports.login = (req, res)=> {
    req.flash('success', 'Welcome Back');
    const redirectUrl = req.session.returnTo || '/products';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', "GoodBye");
    res.redirect('/home')
}

