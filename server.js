"use strict";
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const ejsMate = require("ejs-mate");

const express = require("express");

const path = require("path");

// const {connection} = require("./database");

const multer = require("multer");
const { storage } = require("./cloudinary");
const upload = multer({ storage });

const userRoutes = require("./routes/users");

const flash = require("connect-flash");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");

const User = require("./models/user");
const MongoDBStore = require("connect-mongo");

const { MongoClient, ObjectId } = require("mongodb");

let LookupVehicle = require("lookup_vehicle");
// const DataLoader = require('dataloader');
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
};

// const dbUrl = "mongodb://" + config_var.host + ":" + config_var.port;
const dbUrl = "mongodb+srv://ccr_app:ccr_app@cluster0.vo5vzvs.mongodb.net"

const DB = config_var.db;
const client = new MongoClient(dbUrl, {
  useUnifiedTopology: true
});

try {
  client.connect().then(() => console.log("Connected to db"));
} catch (err) {
  console.log(err);
}

var db = null;
client.connect((err, conn) => {
  if (!err) {
    db = conn.db(DB);
  }
});

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

const secret = process.env.SECRET || "sould be a good secret";

// use mongo to help us store session
const store = MongoDBStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const app = express();
// let express can use the public folder directly  https://expressjs.com/zh-tw/starter/static-files.html
app.use(express.static("public"));
app.set("views", path.join(__dirname, "views"));

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

const { graphqlHTTP } = require("express-graphql");
const { readFileSync } = require("fs");
const {
  assertResolversPresent,
  makeExecutableSchema,
} = require("@graphql-tools/schema");

// const typeDefs = readFileSync('./schema.graphql').toString('utf-8')
// const resolvers = require('./resolvers');

async function getProductsGQ(db, keys) {
  try {
    // console.log(keys)
    const docs = await db
      .collection("player")
      .find({ _id: { $in: keys } })
      .toArray();
    let out_list = [];
    for (let i = 0; i < docs.length; i++) {
      const player_doc = docs[i];
      const out = await _formatPlayer(player_doc);
      out_list.push(out);
    }
    // console.log(out_list)
    keys.forEach((element, index) => {
      keys[index] = element.toString();
    });
    if (out_list.length > 1) {
      out_list.sort((a, b) => (a.name > b.name ? 1 : -1));
    }
    // return out_list;
    const results = out_list.reduce((acc, row) => {
      acc[row.pid] = row;
      return acc;
    }, {});
    return keys.map(
      (key) => results[key] || new Error(`player ${key} does not exist `)
    );
  } catch (err) {
    console.log(err);
  }
}

// const schema = makeExecutableSchema({
//   resolvers,
//   resolverValidationOptions: {
//     requireResolversForAllFields:  'warn',
//     requireResolversToMatchSchema: 'warn'
//   },
//   typeDefs
// });

const graphql = require("graphql");
const {
  PossibleFragmentSpreadsRule,
  GraphQLObjectType,
  GraphQLString,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
} = graphql;

app.use(
  "/graphql",
  graphqlHTTP(async (req) => {
    // console.log('graphql')
    return {
      schema: new GraphQLSchema({
        query: RootQuery,
      }),
      graphiql: true,
      context: {
        req,
        db: db,
        userCache: {},
        productCache: {},
        historyCache: {},
      },
    };
  })
);

const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    _id: { type: GraphQLID },
    owner: { type: GraphQLID },
    carName: { type: GraphQLString },
    manufacturer: { type: GraphQLString },
    vehicleType: { type: GraphQLString },
    capacity: { type: GraphQLString },
    transmissionStyle: { type: GraphQLString },
    price: { type: GraphQLInt },
    car_photo: { type: new GraphQLList(GraphQLString) },
    car_dates: { type: new GraphQLList(GraphQLString) },
    look_like: { type: GraphQLString },
    coord: { type: new GraphQLList(GraphQLFloat) },
    descript: { type: GraphQLString },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    userId: { type: GraphQLID },
    userName: { type: GraphQLString },
    account: { type: GraphQLString },
    pass: { type: GraphQLString },
    email: { type: GraphQLString },
    products: { type: new GraphQLList(ProductType) },
  }),
});

const HistType = new GraphQLObjectType({
  name: "Hist",
  fields: () => ({
    buyer: { type: GraphQLID },
    carId: { type: GraphQLID },
    carName: { type: GraphQLString },
    seller: { type: GraphQLID },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    product: {
      type: ProductType,
      args: { productId: { type: GraphQLID } },
      async resolve(parent, args) {
        const rows = await db
          .collection("product")
          .findOne({ _id: ObjectId(args.productId) });
        rows.coord = rows.coord.coordinates;
        return rows;
      },
    },
    products: {
      type: new GraphQLList(ProductType),
      args: {
        coord: { type: new GraphQLList(GraphQLFloat) },
        startDate: { type: GraphQLString },
        endDate: { type: GraphQLString },
      },
      async resolve(parent, args) {
        const rows = await db
          .collection("product")
          .find({
            coord: {
              $nearSphere: {
                $geometry: { type: "Point", coordinates: args.coord },
                $minDistance: 0,
                $maxDistance: 5000,
              },
            },
          })
          .toArray();

        for (let i = 0; i < rows.length; i++) {
          rows[i].coord = rows[i].coord.coordinates;
          for (let j = 0; j < rows[i].car_dates.length; j++) {
            rows[i].car_dates[j] = "'" + rows[i].car_dates[j] + "'";
          }
        }

        let arg_sd = "'" + new Date(args.startDate).toISOString() + "'";
        let arg_ed = "'" + new Date(args.endDate).toISOString() + "'";
        var result2 = rows.filter((obj) => obj.car_dates.includes(arg_sd));
        var result3 = result2.filter((obj) => obj.car_dates.includes(arg_ed));
        return result3;
      },
    },
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      async resolve(parent, args) {
        const rows = await db
          .collection("users")
          .findOne({ _id: ObjectId(args.id) });
        return rows;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args) {
        const rows = await db.collection("users").find({}).toArray();
        return rows;
      },
    },
  },
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/home", (req, res, next) => {
  res.render("home");
});

app.get("/about", (req, res, next) => {
  res.render("about");
});

app.get("/products/new", (req, res, next) => {
  res.render("add");
});

app.post(
  "/products/new",
  upload.array("product_photo", 5),
  async (req, res, next) => {
    function getDatesInRange(startDate, endDate) {
      const date = new Date(startDate);
      const dates = [];
      while (date <= new Date(endDate)) {
        dates.push(new Date(date).toISOString());
        date.setDate(date.getDate() + 1);
      }
      return dates;
    }

    client.connect((err, conn) => {
      var files_path = "";
      var car_vin_detail = "";
      LookupVehicle.lookup_callback(req.body.vin, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          car_vin_detail = result.Results[0];
          if (err) {
            callback(err, null);
          } else {
            var files_path = [];
            for (var i = 0; i < req.files.length; i++) {
              files_path.push(req.files[i].path);
            }

            req.body.latlng.split(":")[0];
            var latlng = {
              type: "Point",
              coordinates: [
                parseFloat(req.body.latlng.split(":")[1]),
                parseFloat(req.body.latlng.split(":")[0]),
              ],
            };

            var car_dates = getDatesInRange(
              req.body.car_date_in,
              req.body.car_date_out
            );
            let db = conn.db(DB);
            let collection = db.collection("product");
            var new_car = new Object();
            new_car.owner = req.user._id;
            new_car.carName =
              car_vin_detail.Make +
              " " +
              car_vin_detail.Model +
              " " +
              car_vin_detail.ModelYear;
            new_car.manufacturer = car_vin_detail.Manufacturer;
            new_car.vehicleType = car_vin_detail.VehicleType;
            new_car.capacity = car_vin_detail.Seats;
            new_car.transmissionStyle = car_vin_detail.TransmissionStyle;
            new_car.price = req.body.price;
            new_car.car_photo = files_path;
            new_car.car_dates = car_dates;
            new_car.look_like = req.body.look_like;
            new_car.coord = latlng;
            new_car.descript = req.body.descript;
            collection.insertOne(new_car);
          }
        }
      });
    });
    req.flash("success", "Successfully add a new product");
    res.redirect("/products/new");
  }
);

app.get("/products/new/:productId", jsonBodyParser, async (req, res, next) => {
  res.render("productDetail");
});

app.get("/products", async (req, res, next) => {
  res.render("products");
});

app.get("/profile", (req, res, next) => {
  res.render("profile");
});

app.use("/", userRoutes);

// app.listen(3000);
// console.log("GraphQL API server running at http://localhost:3000/graphql");
if (module === require.main) {
  const PORT = parseInt(process.env.PORT) || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}

module.exports = app