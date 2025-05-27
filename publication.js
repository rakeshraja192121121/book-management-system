const mongoose = require("mongoose");
//schema
const PubSchema = mongoose.Schema({
  id: Number,
  name: String,
  books: [String],
});
//model

const PubModel = mongoose.model("publications", PubSchema);

//export

module.exports = pubModel;
