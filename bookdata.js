const mongoose = require("mongoose");

const BookSchema = mongoose.Schema({
  isbn: String,
  title: String,
  pubdate: Number,
  language: String,
  numpage: Number,
  author: [Number],
  category: [String],
  publication: Number,
});

const BookModel = mongoose.model("books", BookSchema);

module.exports = BookModel;
