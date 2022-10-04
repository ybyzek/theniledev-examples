const Mongoose = require("mongoose");

const localDB = `mongodb://localhost:27017/role_auth`;

require('dotenv').config({ override: true });
const NILE_ENTITY_NAME = process.env.NILE_ENTITY_NAME;

const fs = require('fs');
fs.copyFile(
  `../usecases/${NILE_ENTITY_NAME}/init/Page.js`,
  './model/Page.js',
  (err) => {
    if (err) {
      console.log(
        `Error: could not copy ../usecases/${NILE_ENTITY_NAME}/init/Page.js to ./model/Page.js`
      );
      process.exit(0);
    } else {
      console.log(
        `Success: copied ../usecases/${NILE_ENTITY_NAME}/init/Page.js to ./model/Page.js`
      );
    }
  }
);
const User = require("./model/User");
const Page = require("./model/Page");

const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB Connected");
};

const users = require(`./../usecases/${NILE_ENTITY_NAME}/init/users.json`);
console.log(users);
User.insertMany(users, { ordered: false })
      .catch((error) => {
        console.log(error.message)
      });

const entities = require(`./../usecases/${NILE_ENTITY_NAME}/init/entities.json`);
console.log(entities);
Page.insertMany(entities, { ordered: false })
      .catch((error) => {
        console.log(error.message)
      });

module.exports = connectDB;
