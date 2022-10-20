const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  accountID: {
    type: String,
    required: true,
  },
  accountType: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "River Bank",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
