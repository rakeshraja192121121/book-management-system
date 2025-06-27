require("express-async-handler");
require("dotenv").config();

const express = require("express");

const booky = express();
const mongoose = require("mongoose");

booky.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connection established !!!"));

const database = require("./database");
const openAi = require("./openAi");
const errorHandler = require("./middleware/errorHandler.js");

//importing models

const BookModel = require("./bookdata.js");

const AuthorModel = require("./authordata.js");

const PubModel = require("./publication.js");

const pipeline = [
  { $unwind: "$books" },

  { $match: { books: "11book" } },
  {
    $group: {
      _id: "$name",
      Books: { $sum: 1 },
    },
  },
];

// display all the books :::  route:/book

booky.get("/book", async (req, res) => {
  const allBookData = await BookModel.find();
  const result = await AuthorModel.aggregate(pipeline);
  res.json({
    allbooks: allBookData,
    pipeline: result,
  });
});

// display a specified book :::: route : /book/sp/:isbn

booky.get("/book/sp/:isbn", async (req, res) => {
  const getspecifiedBook = await BookModel.findOne({ isbn: req.params.isbn });

  if (!getspecifiedBook) {
    return res.json({
      error: `the requesting isbn number ${req.params.isbn} is not in the database`,
    });
  }

  return res.json({ data: getspecifiedBook });
});

// display the book of a specified catogery, route::/book/c/:category

booky.get("/book/c/:category", async (req, res) => {
  const getspecifiedBook = await BookModel.findOne({
    category: req.params.category,
  });

  //const getspecifiedBook = database.book.filter((books) =>
  //books.category.includes(req.params.category))
  if (!getspecifiedBook) {
    return res.json({
      error: `the category ${req.params.category} books are not avilable `,
    });
  }
  return res.json({ data: getspecifiedBook });
});

//display all  author , route:: /author

booky.get("/author", async (req, res) => {
  const getallAuthor = await AuthorModel.find();
  const result = await AuthorModel.aggregate(pipeline);

  res.json({ data: getallAuthor, pipeline: result });
});

// adding the datas to the database , route:/book/add

booky.post("/book/add", async (req, res) => {
  try {
    const newBook = req.body.newBook;

    const existingbook = await BookModel.findOne({ isbn: newBook.isbn });
    if (existingbook) {
      res.json({ msg: "the book is already in the database" });
    } else {
      const addBook = await BookModel.create(newBook);

      //database.book.push(newBook); without database
      return res.json({ addBook });
    }
  } catch (error) {
    res.json({ msg: "error" });
  }
});

//adding author to the database, route::/author/add

booky.post("/author/add", async (req, res) => {
  try {
    const newAuthor = req.body.newAuthor;

    const existingAuthor = await AuthorModel.findOne({ id: newAuthor.id });

    if (existingAuthor) {
      res.json({ msg: "Alredy Exist" });
    } else {
      const addingAuthor = await AuthorModel.create(newAuthor);

      res.json("added");
    }
  } catch (error) {
    console.log(error);
  }

  //database.author.push(newAuthor);
  //return res.json({ data: database.author });
});

//posting in publication route:: /add/publication

booky.post("/add/publication", async (req, res) => {
  try {
    const newPublication = req.body.newPub;
    const existingPublication = await PubModel.findOne({
      id: newPublication.id,
    });
    if (existingPublication) {
      res.json({ msg: "alredy exist" });
    } else {
      const newpub = await PubModel.create(newPublication);
      res.json("added");
    }
  } catch (error) {
    console.log(error);
    res.json({ msg: "error" });
  }
});

//updating a book title using isbn , route :: /book/update/title/:isbn

booky.put("/book/update/title/:isbn", async (req, res) => {
  const updatedTitle = await BookModel.findOneAndUpdate(
    { isbn: req.params.isbn },
    { title: req.body.newTitle },
    { new: true }
  );

  /*database.book.forEach((books) => {
    if (books.isbn === req.params.isbn) {
      books.title = req.body.newtitle;
      return;
    }
  });*/
  return res.json({ updatedTitle });
});

//updating book in book database and author database., route:::/book/update/author/:isbn/:author

booky.put("/book/update/author/:isbn/:author", async (req, res) => {
  const updateBook = await BookModel.findOneAndUpdate(
    { isbn: req.params.isbn },
    { $addToSet: { author: req.params.author } },
    { new: true }
  );
  const updateAuthor = await AuthorModel.findOneAndUpdate(
    { id: req.params.author },
    { $push: { books: req.params.isbn } },
    { new: true }
  );
  res.json({ Bookdata: updateBook, authorData: updateAuthor });

  /*
  database.book.forEach((books) => {
    if (books.isbn === req.params.isbn) {
      return books.author.push(req.params.author);
    }
  });
  console.log(req.params.isbn);
  database.author.forEach((authors) => {
    if (authors.id === req.params.author) {
      return authors.books.push(req.params.isbn);
    }
  });
  return res.json({ book: database.book, author: database.author });*/
});

//updating publications

// in publicaltion updating book ,route::/publication/update/book/:isbn

booky.put("/publication/update/book/:isbn", async (req, res) => {
  const updatepub = await PubModel.findOneAndUpdate(
    { id: req.body.pubid },
    { $addToSet: { books: req.params.isbn } },
    { new: true }
  );
  const updatebook = await BookModel.findOneAndUpdate(
    { isbn: req.params.isbn },
    {
      publication: req.body.pubid,
    },
    {
      new: true,
    }
  );
  /*
  database.publication.forEach((pubitem) => {
    if (pubitem.id === req.body.pubid) {
      return pubitem.books.push(req.params.isbn);
    }
  });
  database.book.forEach((bookitem) => {
    if (bookitem.isbn === req.params.isbn) {
      bookitem.publication = req.body.pubid;
    }
  });
  */
  res.json({ updatepub, updatebook });
});

booky.put("/creating/file/put/:id", async (req, res) => {
  const newAuthor = req.body.newAuthor;

  const Id = req.params.id;

  const existingAuthor = await AuthorModel.findOne({ id: newAuthor.id });

  if (existingAuthor) {
    res.json({ msg: "Alredy Exist" });
  } else {
    const addingAuthor = await AuthorModel.create(
      { id: Id },
      { newAuthor },
      { runValidator: true }
    );

    res.json("added");
  }
});

// deleting the book, route:: /book/delete/:isbn

booky.delete("/book/delete/:isbn", async (req, res) => {
  const deleteBook = await BookModel.findOneAndDelete({
    isbn: req.params.isbn,
  });
  res.json({ msg: "deleted" });

  /*
  const updatedbooks = database.book.filter((bookitem) => {
    bookitem.isbn !== req.params.isbn;
  });
  database.book = updatedbooks;
  return res.json({ book: database.book });
  */
});

//deleting a author in author model and updatng it in book model route::  /delete/author/:isbn/:authorid

booky.delete("/delete/author/:isbn/:authorid", async (req, res) => {
  const newAuthor = await AuthorModel.findOneAndDelete({
    id: req.params.authorid,
  });
  const updatedbook = await BookModel.findOneAndUpdate(
    { isbn: req.params.isbn },
    {
      $pull: {
        author: req.params.authorid,
      },
    },
    {
      new: true,
    }
  );
  res.json({ msg: "deleted" });
  /*
  database.book.forEach((bookitem) => {
    if (bookitem.isbn === req.params.isbn) {
      const newAuthor = bookitem.author.filter(
        (authoritem) => authoritem !== parseInt(req.params.authorid)
      );
      bookitem.author = newAuthor;
    }
  });

  database.author.forEach((authoritem) => {
    if (authoritem.id === parseInt(req.params.authorid)) {
      const newbooklist = authoritem.books.filter(
        (book) => book !== req.params.isbn
      );
      authoritem.books = newbooklist;
    }
  });
  return res.json({
    book: database.book,
    author: database.author,
    msg: "deleted ",
  });
  */
});

// deleting a publication, and updation in book ,route:: /delete/publication/:isbn/:pubid

booky.delete("/delete/publication/:isbn/:pubid", async (req, res) => {
  const deletePub = await PubModel.findOneAndDelete({ id: req.params.pubid });
  const updateBook = await BookModel.findOneAndUpdate(
    { isbn: req.params.isbn },
    {
      publication: null,
    },
    { new: true }
  );
  res.json({ msg: "deleted" });
  /*


  database.book.forEach((bookitem) => {
    if (bookitem.isbn === req.params.isbn) {
      bookitem.publication = 0;
    }
  });

  database.publication.forEach((pubitem) => {
    if (pubitem.id === parseInt(req.params.pubid)) {
      newbooks = pubitem.books.filter((book) => book !== req.params.isbn);
    }
    pubitem.books = newbooks;
  });

  return res.json({
    book: database.book,
    publication: database.publication,
    msg: "deleted",
  });
  */
});

booky.get("/book/openAi/Recomadations", openAi);

booky.use(errorHandler);

booky.listen(3000, () => {
  console.log("the server has started");
});
