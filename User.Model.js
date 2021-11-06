const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  photo: { type: String },
});

module.exports = mongoose.model("Users", userSchema);
