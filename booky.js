const express = require("express");

const booky = express();

booky.use(express.json());

const database = require("./database");

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

booky.listen(3000, () => {
  console.log("the server has started");
});
