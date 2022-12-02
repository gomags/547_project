"use strict"
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
const ejsMate = require('ejs-mate');

const express = require('express');

const path = require('path');

const {connection} = require("./database");

const multer = require('multer')
const {storage} = require('./cloudinary')
const upload = multer({storage})

const userRoutes = require('./routes/users')

const flash = require('connect-flash')
const session = require('express-session')
const mongoose = require("mongoose")
const passport = require("passport")
const bodyParser = require("body-parser")
const LocalStrategy = require("passport-local")

const User = require("./models/user");
const MongoDBStore = require("connect-mongo")(session);

const {MongoClient, ObjectId} = require('mongodb')

let LookupVehicle = require('lookup_vehicle');
// const NodeGeocoder = require('node-geocoder');

// const options = {
//   provider: 'google',

//   // Optional depending on the providers
//   fetch: customFetchImplementation,
//   apiKey: 'AIzaSyBk-spvVNSgJWusP6KkVI-EYat2TpMJgYQ', // for Mapquest, OpenCage, Google Premier
//   formatter: null // 'gpx', 'string', ...
// };

var config_var = {
    host: "localhost",
    port: "27017",
    db: "CCR",
    opts: {
      useUnifiedTopology: true
      }
}

const dbUrl = "mongodb://" + config_var.host + ":" + config_var.port
const DB = config_var.db
const client = new MongoClient(dbUrl, config_var.opts)


try {
  console.log('44')
  client.connect().then(() => console.log("Connected to db"))
}
catch(err){
  console.log(err)
}

// client.connect((err, conn) => {
//   if (!err) {
//     // const conn = conn;
//     let db = conn.db(DB);
//     db.createCollection("product", (err, res) => {
//       if (!err) {
//         console.log("create collection");
//       }
//     });

//     try {
//       let collection = db.collection("product");
//     } catch (e) {
//       process.exit(5);
//     }

//   }
// });

// client.connect((err, conn) => {
//   if (!err) {
//     // const conn = conn;
//     let db = conn.db(DB);

//     db.createCollection("users", (err, res) => {
//       if (!err) {
//         console.log("create collection ");
//       }
//     });

//     try {
//       let collection = db.collection("users");
//     } catch (e) {
//       process.exit(5);
//     }
//   }
// });


const jsonBodyParser = bodyParser.json();

const secret = process.env.SECRET || 'sould be a good secret'

// use mongo to help us store session
const store = new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e);
})

const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

const app = express();
// let express can use the public folder directly  https://expressjs.com/zh-tw/starter/static-files.html
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

const { graphqlHTTP } = require('express-graphql');
const { readFileSync } = require('fs')
const { assertResolversPresent, makeExecutableSchema } = require('@graphql-tools/schema');

const typeDefs = readFileSync('./schema.graphql').toString('utf-8')
const resolvers = require('./resolvers');

const schema = makeExecutableSchema({
  resolvers,
  resolverValidationOptions: {
    requireResolversForAllFields:  'warn',
    requireResolversToMatchSchema: 'warn'
  },
  typeDefs
});

app.use('/graphql', graphqlHTTP(async (req) => {
    return {
      schema,
      graphiql: true,
      context: {
        req,
        db: await connection.promise(),
        userCache: {},
        productCache: {},
        historyCache: {}
      }
    };
  }));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

//if put in front of graphql route will break grpahql//
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/home', (req, res, next) => {
    res.render('home');
});

// Introduce our website
app.get('/about', (req, res, next) => {
    res.render('about')
});

// Add Product 
app.get('/products/new', (req, res, next) => {
    res.render('add');
});
// post a new product
app.post('/products/new', upload.array('product_photo', 5), async (req, res, next) => {

  function getDatesInRange(startDate, endDate) {
    const date = new Date(startDate);
    const dates = [];
    while (date <= new Date(endDate)) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return dates;
  }

  client.connect((err,conn) => {

    var files_path = ''
    var car_vin_detail = ''
    LookupVehicle.lookup_callback(req.body.vin, (err, result) => {
      if (err) {
        console.log(err);
        // callback(err)
        } else {
          car_vin_detail = result.Results[0]
          if(err) {
            callback(err,null)
          }
          else {
            for (var i =0; i<req.files.length;i++) {
              files_path +=  `${req.files[i].path};`
            }
            var car_dates = getDatesInRange(req.body.car_date_in, req.body.car_date_out)
            let db = conn.db(DB)
            let collection = db.collection("product")
            var new_car = new Object();
            new_car.owner = req.user._id
            new_car.carName = car_vin_detail.Make + ' ' + car_vin_detail.Model + ' ' + car_vin_detail.ModelYear
            new_car.manufacturer = car_vin_detail.Manufacturer
            new_car.vehicleType = car_vin_detail.VehicleType
            new_car.capacity = car_vin_detail.Seats
            new_car.transmissionStyle = car_vin_detail.TransmissionStyle
            new_car.price = req.body.price
            new_car.car_photo = files_path
            new_car.car_dates = car_dates
            new_car.look_like = req.body.look_like
            new_car.coord = req.body.latlng
            new_car.descript = req.body.descript

            // var geocoder = new google.maps.Geocoder();
            // geocoder.geocode( { 'address': req.body.car_location}, async function(results, status) {
            //   const geocoder = NodeGeocoder(options);
            //   // Using callback
            //   const res = await geocoder.geocode('29 champs elysée paris');
            //   console.log(results)
            // })

            collection.insertOne(new_car)
          }
        }
      });
    })
  req.flash('success', 'Successfully add a new product');
  res.redirect('/products/new');
});

app.get('/products/new/:productId', jsonBodyParser, async (req, res, next) => {
  res.render('productDetail')
});

app.get('/products', async (req, res, next) => {
  res.render("products")
});

// app.post('/cart', jsonBodyParser, async(req, res, next) => {
//     for(let i = 0; i < req.body.length; i++) {
//         const curUser = req.user._id
//         const {productName, productId, price, sellerName, number } = req.body[i];

//         const q = 'SELECT numberOfProduct FROM product WHERE product_id =?';
//         const d  = [productId];
//         const [rows, fields] = await connection.promise().query(q, d);

//         const numberOfProduct = rows[0].numberOfProduct - number;

//         const updateq = 'UPDATE product SET numberOfProduct=?  WHERE product_id=?';
//         const updated = [numberOfProduct, productId];
//         const [rowsUPDATE, fieldsUPDATE] = await connection.promise().query(updateq, updated);

//         const insertq = 'INSERT INTO history (buyer, seller, product_name, num, price) VALUES (?, ?, ?, ?, ?)';
//         const insertd = [String(curUser), String(sellerName), productName, number, Number(price)*Number(number)];
//         const [rowsInsert, fieldsInsert] = await connection.promise().query(insertq, insertd);
//     }
    
// }) 


app.get('/profile', (req, res, next) => {
    res.render('profile')
})

app.use('/', userRoutes);

app.listen(3000);
console.log('GraphQL API server running at http://localhost:3000/graphql');


