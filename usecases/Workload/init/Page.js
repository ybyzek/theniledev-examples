const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "team-1",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
