

const {MongoClient, ObjectId} = require('mongodb')
const dbUrl = "mongodb://localhost:27017";
const DB = "CCR"
// const client = new MongoClient(dbUrl, config_var.opts)

module.exports.connection_mongo = new MongoClient(dbUrl,  {useUnifiedTopology: true})
module.exports.mongo_DB = DB