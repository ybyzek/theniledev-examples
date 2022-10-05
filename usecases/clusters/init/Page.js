const Mongoose = require("mongoose");

const PageSchema = new Mongoose.Schema({
  cluster_name: {
    type: String,
    required: true,
  },
  org: {
    type: String,
    default: "Colton Labs",
    required: true,
  }
});

const Page = Mongoose.model("page", PageSchema);

module.exports = Page;
