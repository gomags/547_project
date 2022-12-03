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
// const mongoose = require("mongoose")
const passport = require("passport")
const bodyParser = require("body-parser")
const LocalStrategy = require("passport-local")

const User = require("./models/user");

const MongoDBStore = require("connect-mongo")(session);

const {MongoClient, ObjectId} = require('mongodb')

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

class User{
  constructor(){
    this.config_file = {
      host: 'localhost',
      port: 27017,
      db: 'car_rental',
      opts: {useUnifiedTopology: true}
    }

    this.uri = "mongodb://" + this.config_file.host + ":" + this.config_file.port
    this.db = this.config_file.db
    this.client = new MongoClient(this.uri, this.config_file.opts)
  }

  getUser(userId,callback){
    // connect to database
    this.client.connect((err,conn) => {
        if(err)
        {   // if error return error
            callback(err,null)
        }
        else
        {   // connect to database
            let db = conn.db(this.db)
            let collection = db.collection("user")
            collection.find({"userId":userId}).toArray((err,result) =>{// find user with userId
                if(err)
                {   // if error return error
                    conn.close()
                    callback(err,null)
                }
                else
                {   // if no error return player
                    if(result.length>0)
                    {   //close connection and return player
                        conn.close()
                        //console.log(result[0])
                        callback(null,result[0])
                    }
                    else
                    {   // if no player found return error
                        conn.close()
                        callback(true,"no records")
                    }
                }
            })
        }
    })
  }
}


class Product{
  constructor(){
    this.config_file = {
      host: 'localhost',
      port: 27017,
      db: 'car_rental',
      opts: {useUnifiedTopology: true}
    }

    this.uri = "mongodb://" + this.config_file.host + ":" + this.config_file.port
    this.db = this.config_file.db
    this.client = new MongoClient(this.uri, this.config_file.opts)
  }

  getProduct(productId,callback){
    // connect to database
    this.client.connect((err,conn) => {
        if(err)
        {   // if error return error
            callback(err,null)
        }
        else
        {   // connect to database
            let db = conn.db(this.db)
            let collection = db.collection("product")
            collection.find({"productId":productId}).toArray((err,result) =>{// find product with productId
                if(err)
                {   // if error return error
                    conn.close()
                    callback(err,null)
                }
                else
                {   // if no error return player
                    if(result.length>0)
                    {   //close connection and return player
                        conn.close()
                        //console.log(result[0])
                        callback(null,result[0])
                    }
                    else
                    {   // if no player found return error
                        conn.close()
                        callback(true,"no records")
                    }
                }
            })
        }
    })
  }
}

let userobj = new User()
let prodobj = new Product()


try {
  console.log('44')
  client.connect().then(() => console.log("Connected to db"))
}
catch(err){
  console.log(err)
}

client.connect((err, conn) => {
  if (!err) {
    // const conn = conn;
    let db = conn.db(DB);
    db.createCollection("product", (err, res) => {
      if (!err) {
        console.log("create collection");
      }
    });

    try {
      let collection = db.collection("product");
    } catch (e) {
      process.exit(5);
    }

  }
});

client.connect((err, conn) => {
  if (!err) {
    // const conn = conn;
    let db = conn.db(DB);

    db.createCollection("users", (err, res) => {
      if (!err) {
        console.log("create collection ");
      }
    });

    try {
      let collection = db.collection("users");
    } catch (e) {
      process.exit(5);
    }
  }
});


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
const { start } = require('repl');

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
app.post('/products/new', upload.single('product_photo'), async (req, res, next) => {

  this.client.connect((err,conn) => {
    if(err) {
      callback(err,null)
    }
    else {

      var product = new Object();
      let productId = req.query?.productId
      let productName = req.query?.productName
      let price = req.query?.price
      let location = req.query?.location
      let seller = req.query?.seller
      let category = req.query?.category
      let startDate = req.query?.startDate
      let endDate = req.query?.endDate
      let capacity = req.query?.capacity
      let product_photo = req.query?.product_photo
      let descript = req.query?.descript

      product.productId = productId
      product.productName = productName
      product.price = price
      product.location = location
      product.seller = seller
      product.category = category
      product.startDate = startDate
      product.endDate = endDate
      product.capacity = capacity
      product.product_photo = product_photo
      product.descript = descript

      let db = conn.db(DB)
      db.createCollection("product", (err, res) => {
        if (!err){

        }
      })
      let collection = db.collection("product")
      //create schema for product

      collection.insertOne(new_product, (err,res) =>{
        if(err) {
          conn.close()
          callback(err,null)
        }
        else {
          conn.close()
          callback(null, 'inserted product')
        }
      })
    }
  })
})

  //updating prodct availability
  app.post('/product/update', async (req,res) => {
    this.client.connect((err,conn) => {
      if(err) {
        callback(err,null)
      }
      else {

      }
  })
})

  app.post('/user', async (req, res) => {

    this.client.connect((err,conn) => {
      if(err) {
        callback(err,null)
      }
      else {

        var user = new Object();
        let userId = req.query?.userId
        let userName = req.query?.userName
        let account = req.query?.account
        let pass = req.query?.pass
        let email = req.query?.email
        let products = req.query?.products
        let buyProducts = req.query?.buyProducts

        user.userId = userId
        user.userName = userName
        user.account = account
        user.pass = pass
        user.email = email
        user.products = products
        user.buyProducts = buyProducts

        let db = conn.db(DB)
        db.createCollection("user", (err, res) => {
          if (!err){

          }
        })

        let collection = db.collection("user")
        //create schema for product
  
        collection.insertOne(user, (err,res) =>{
          if(err) {
            conn.close()
            callback(err,null)
          }
          else {
            conn.close()
            callback(null, 'inserted user')
          }
        })
      }
    })

  

  req.flash('success', 'Successfully add a new product');
  res.redirect('/products/new');
});

app.get('/products/new/:productId', jsonBodyParser, async (req, res, next) => {
  
  res.render('productDetail')

});

// Show products
app.get('/products', async (req, res, next) => {
  res.render("products")
});

// checkout
app.post('/cart', jsonBodyParser, async(req, res, next) => {
    
    for(let i = 0; i < req.body.length; i++) {
        const curUser = req.user._id

        const {productName, productId, price, sellerName, number } = req.body[i];

        const q = 'SELECT numberOfProduct FROM product WHERE product_id =?';
        const d  = [productId];
        const [rows, fields] = await connection.promise().query(q, d);

        const numberOfProduct = rows[0].numberOfProduct - number;

        const updateq = 'UPDATE product SET numberOfProduct=?  WHERE product_id=?';
        const updated = [numberOfProduct, productId];
        const [rowsUPDATE, fieldsUPDATE] = await connection.promise().query(updateq, updated);

        const insertq = 'INSERT INTO history (buyer, seller, product_name, num, price) VALUES (?, ?, ?, ?, ?)';
        const insertd = [String(curUser), String(sellerName), productName, number, Number(price)*Number(number)];
        const [rowsInsert, fieldsInsert] = await connection.promise().query(insertq, insertd);
    }
    
}) 

// Profile
app.get('/profile', (req, res, next) => {
    res.render('profile')
})

// user route
// they are in routes folder
app.use('/', userRoutes);

app.listen(3000);
console.log('GraphQL API server running at http://localhost:3000/graphql');