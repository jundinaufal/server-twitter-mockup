require('dotenv').config()

const { MongoClient } = require('mongodb');

// Connection URL
const url = process.env.MONGODB_URI;
// console.log(url);
const client = new MongoClient(url);

// Database Name
const dbName = 'project_gc1_p3';

async function mongoConnect() {
  try {
    // Use connect method to connect to the server
    await client.connect();
    console.log('MongoDB Connected successfully to server');
    // const db = client.db(dbName);
  
    // the following code examples can be pasted here...
    return 'done.';
  } catch (error) {
    console.log('MongoDB connection error ', error)
    throw error
  }
}

const getDatabase = () => {
  return client.db(dbName)
}

// const getDatabase = client.db(dbName) // ini kalau misalkan clientnya gagal connect, bikin error code 
module.exports = {
  mongoConnect,
  getDatabase
}
