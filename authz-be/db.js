const Mongoose = require("mongoose");

const localDB = `mongodb://localhost:27017/role_auth`;

const User = require("./model/User");
const Page = require("./model/Page");

const connectDB = async () => {
  await Mongoose.connect(localDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("Connected to MongoDB Connected");
};

const usersJson = require('../quickstart/src/datasets/userList.json');
console.log(usersJson);
User.insertMany(usersJson, { ordered: false })
      .catch((error) => {
        console.log(error.message)
      });

const pagesJson = require('../quickstart/src/datasets/pageList.json');
console.log(pagesJson);
Page.insertMany(pagesJson, { ordered: false })
      .catch((error) => {
        console.log(error.message)
      });

module.exports = connectDB;
