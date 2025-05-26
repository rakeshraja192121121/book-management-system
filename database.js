const book = [
  {
    isbn: "11book",
    title: "rich dad and poor dad",
    pubdate: "1997",
    language: "english",
    numpage: "250",
    author: ["Robert"],
    category: ["biopic", "novel"],
    publication: [1, 2],
  },
];

const author = [
  {
    id: 1,
    name: "robert",
    books: ["rich dad poor dad", "atomic habits"],
  },
];

const publication = [
  {
    id: 1,
    name: "writex",
    books: ["11book"],
  },
  {
    id: 2,
    name: "writex",
    books: [],
  },
];

module.exports = { book, author, publication };
