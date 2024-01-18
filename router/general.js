const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username already exists
  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // If username is unique, create a new user
  const newUser = {
    username,
    password,
  };

  // Add the new user to the users array
  users.push(newUser);

  // Return a success response
  return res.status(201).json({ message: "User registered successfully", user: newUser });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Find the book in the books object based on ISBN
  const book = books[isbn];

  if (book) {
    // If book is found, send its details as a response
    res.json(book);
  } else {
    // If book is not found, return a 404 Not Found status
    res.status(404).json({ message: "Book not found" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  // Obtain all the keys for the 'books' object
  const isbnList = Object.keys(books);

  // Initialize an array to store books matching the provided author
  const booksByAuthor = [];

  // Iterate through the 'books' array & check if the author matches the one provided in the request parameters
  isbnList.forEach((isbn) => {
    const book = books[isbn];
    if (book.author === author) {
      booksByAuthor.push({
        isbn: isbn,
        title: book.title,
        reviews: book.reviews
      });
    }
  });

  // If books are found for the author, send their details as a response
  if (booksByAuthor.length > 0) {
    res.json(booksByAuthor);
  } else {
    // If no books are found for the author, return a 404 Not Found status
    res.status(404).json({ message: "No books found for the author" });
  }
});


// Get book details based on title
public_users.get('/title/:title', function (req, res) {
  const titleToSearch = req.params.title;
  const matchingBooks = [];

  // Iterate through the keys of the books object
  for (const isbn in books) {
    if (books.hasOwnProperty(isbn)) {
      const book = books[isbn];
      
      // Check if the title matches the one provided in the request parameters
      if (book.title.toLowerCase() === titleToSearch.toLowerCase()) {
        matchingBooks.push(book);
      }
    }
  }

  if (matchingBooks.length > 0) {
    // If matching books are found, send their details as a response
    res.json(matchingBooks);
  } else {
    // If no matching books are found, return a 404 Not Found status
    res.status(404).json({ message: "Books with the title not found" });
  }
});

// Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  // Find the book in the books object based on ISBN
  const book = books[isbn];

  if (book) {
    const reviews = book.reviews;

    // If reviews are available, send them as a response
    if (reviews && Object.keys(reviews).length > 0) {
      res.json(reviews);
    } else {
      // If no reviews are found, return a 404 Not Found status
      res.status(404).json({ message: "No reviews found for the book" });
    }
  } else {
    // If book is not found, return a 404 Not Found status
    res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
