const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  greeting: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "Cyberdyne Systems",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
