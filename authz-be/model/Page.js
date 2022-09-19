const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  dbName: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "db-customer1",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
