require("dotenv").config();

const express = require("express");

const booky = express();
const mongoose = require("mongoose");

booky.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("connection established !!!"));

const database = require("./database");

//importing models

const BookModel = require("./bookdata.js");

const AuthorModel = require("./authordata.js");

const PubModel = require("./publication.js");

booky.get("/book", (req, res) => {
  res.json({ data: database.book });
});

booky.get("/book/sp/:id", (req, res) => {
  const getspecifiedBook = database.book.filter(
    (book) => book.isbn === req.params.id
  );

  console.log(getspecifiedBook.length);
  if (getspecifiedBook.length === 0) {
    return res.json({
      error: `the requesting isbn number ${req.params.id} is not in the database`,
    });
  }

  return res.json({ data: getspecifiedBook });
});

booky.get("/book/c/:category", (req, res) => {
  const getspecifiedBook = database.book.filter((books) =>
    books.category.includes(req.params.category)
  );
  console.log(getspecifiedBook);

  if (getspecifiedBook.length === 0) {
    return res.json({
      error: `the category ${req.params.category} books are not avilable `,
    });
  }
  return res.json({ data: getspecifiedBook });
});

booky.get("/author", (req, res) => {
  return res.json({ data: database.author });
});

booky.post("/book/add", (req, res) => {
  const newBook = req.body.newBook;
  database.book.push(newBook);
  return res.json({ data: database.book });
});

booky.post("/author/add", (req, res) => {
  const newAuthor = req.body.newAuthor;
  database.author.push(newAuthor);
  return res.json({ data: database.author });
});

booky.put("/book/update/title/:isbn", (req, res) => {
  database.book.forEach((books) => {
    if (books.isbn === req.params.isbn) {
      books.title = req.body.newtitle;
      return;
    }
  });
  return res.json({ data: database.book });
});

booky.put("/book/update/author/:isbn/:author", (req, res) => {
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
  return res.json({ book: database.book, author: database.author });
});

//updating publications

booky.put("/publication/update/book/:isbn", (req, res) => {
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
  return res.json({
    book: database.book,
    publications: database.publication,
    msg: "sucessfully updated",
  });
});

// deleting the book

booky.delete("/book/delete/:isbn", (req, res) => {
  const updatedbooks = database.book.filter((bookitem) => {
    bookitem.isbn !== req.params.isbn;
  });
  database.book = updatedbooks;
  return res.json({ book: database.book });
});

//deleting a author

booky.delete("/delete/author/:isbn/:authorid", (req, res) => {
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
});

// deleting a publication

booky.delete("/delete/publication/:isbn/:pubid", (req, res) => {
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
});

booky.listen(3000, () => {
  console.log("the server has started");
});
