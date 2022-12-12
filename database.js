// const mysql = require('mysql2');

// module.exports.connection = mysql.createConnection({
//     // '192.168.12.128', 
//     // '192.168.2.129'
//     host: '127.0.0.1',
//     user: 'root',
//     password: '547_project',
//     database: 'project',
//     multipleStatements: true
// });

const {MongoClient, ObjectId} = require('mongodb')
const dbUrl = "mongodb+srv://ccr_app:ccr_app@cluster0.vo5vzvs.mongodb.net"
const DB = "CCR"
// const client = new MongoClient(dbUrl, config_var.opts)

module.exports.connection_mongo = new MongoClient(dbUrl,  {useUnifiedTopology: true})
module.exports.mongo_DB = DB