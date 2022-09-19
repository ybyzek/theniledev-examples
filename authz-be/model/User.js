const Mongoose = require("mongoose");

const UserSchema = new Mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    default: "password",
    required: true,
  },
  org: {
    type: String,
    default: "db-customer1",
    required: true,
  },
  role: {
    type: String,
    default: "basic",
    required: true,
  }
});

const User = Mongoose.model("user", UserSchema);

module.exports = User;
