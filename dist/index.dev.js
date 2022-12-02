"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

var ejsMate = require('ejs-mate');

var express = require('express');

var path = require('path'); // const mysql = require('mysql2');


var _require = require("./database"),
    connection = _require.connection;

var multer = require('multer');

var _require2 = require('./cloudinary'),
    storage = _require2.storage;

var upload = multer({
  storage: storage
});

var userRoutes = require('./routes/users'); /// for authentication ///


var flash = require('connect-flash');

var session = require('express-session');

var mongoose = require("mongoose");

var passport = require("passport");

var bodyParser = require("body-parser");

var LocalStrategy = require("passport-local");

var User = require("./models/user");

var MongoDBStore = require("connect-mongo")(session);

var dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/project'; ///////////////////

var jsonBodyParser = bodyParser.json(); ///////////////////
// project db name
// 'mongodb://localhost:27017/project'

mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});
var db = mongoose.connection; // connect fail

db.on("error", console.error.bind(console, "connection error")); // connect sucessful

db.once('open', function () {
  return console.log('Connected to MongoDB');
});
var secret = process.env.SECRET || 'sould be a good secret'; // use mongo to help us store session

var store = new MongoDBStore({
  url: dbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});
var sessionConfig = {
  store: store,
  name: 'session',
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}; //////////////////////////

var app = express(); // let express can use the public folder directly  https://expressjs.com/zh-tw/starter/static-files.html

app.use(express["static"]('public'));
app.set('views', path.join(__dirname, 'views')); /// authentication part ///

app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
}); //////////////////////////////////////////
/////////////////////////
///// graphql thing /////

var _require3 = require('express-graphql'),
    graphqlHTTP = _require3.graphqlHTTP;

var _require4 = require('fs'),
    readFileSync = _require4.readFileSync;

var _require5 = require('@graphql-tools/schema'),
    assertResolversPresent = _require5.assertResolversPresent,
    makeExecutableSchema = _require5.makeExecutableSchema;

var typeDefs = readFileSync('./schema.graphql').toString('utf-8');

var resolvers = require('./resolvers');

var schema = makeExecutableSchema({
  resolvers: resolvers,
  resolverValidationOptions: {
    requireResolversForAllFields: 'warn',
    requireResolversToMatchSchema: 'warn'
  },
  typeDefs: typeDefs
});
app.use('/graphql', graphqlHTTP(function _callee(req) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.t0 = schema;
          _context.t1 = req;
          _context.next = 4;
          return regeneratorRuntime.awrap(connection.promise());

        case 4:
          _context.t2 = _context.sent;
          _context.t3 = {};
          _context.t4 = {};
          _context.t5 = {};
          _context.t6 = {
            req: _context.t1,
            db: _context.t2,
            userCache: _context.t3,
            productCache: _context.t4,
            historyCache: _context.t5
          };
          return _context.abrupt("return", {
            schema: _context.t0,
            graphiql: true,
            context: _context.t6
          });

        case 10:
        case "end":
          return _context.stop();
      }
    }
  });
})); /////////////////////
/////////////////////

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs'); //if put in front of graphql route will break grpahql//

app.use(bodyParser.urlencoded({
  extended: true
}));
app.get('/home', function (req, res, next) {
  res.render('home');
}); // Introduce our website

app.get('/about', function (req, res, next) {
  res.render('about'); // res.sendFile(__dirname+'/views/about.html');
}); // Add Product 

app.get('/products/new', function (req, res, next) {
  res.sendFile(__dirname + '/views/add.html');
});
app.post('/products/new', upload.single('product_photo'), function _callee2(req, res, next) {
  var q, d;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          console.log(req.user);
          _context2.prev = 1;
          q = 'INSERT INTO product(seller, category, productName, price, boughtDate, product_photo, look_like, numberOfProduct, descript) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);';
          d = [String(req.user), req.body.category, req.body.product_name, req.body.price, req.body.boughtDate, req.file.path, req.body.look_like, req.body.numberOfProduct, req.body.descript];
          _context2.next = 6;
          return regeneratorRuntime.awrap(connection.promise().query(q, d));

        case 6:
          _context2.next = 11;
          break;

        case 8:
          _context2.prev = 8;
          _context2.t0 = _context2["catch"](1);
          console.error('Errorrrr', _context2.t0); //   return next();

        case 11:
          res.redirect('/products/new');

        case 12:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[1, 8]]);
});
app.get('/products/new/:productId', jsonBodyParser, function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // console.log(req.params)
          res.render('productDetail');

        case 1:
        case "end":
          return _context3.stop();
      }
    }
  });
}); 

// Show products
app.get('/products', function _callee4(req, res, next) {
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          res.render("products");
        case 1:
        case "end":
          return _context4.stop();
      }
    }
  })
}) 

// app.get('/products/clothes', async (req, res, next) => {
//   res.sendFile(__dirname+'/views/productsClothes.html');
// });
// app.get('/products/furnitures', async (req, res, next) => {
//   res.sendFile(__dirname+'/views/productsFurnitures.html');
// });


// Profile
app.get('/profile', function (req, res, next) {
  console.log(res.locals.currentUser);
  res.render('profile'); 
}); 

// user route
// they are in routes folder
app.use('/', userRoutes);
app.listen(3000);
console.log('GraphQL API server running at http://localhost:3000/graphql'); 

