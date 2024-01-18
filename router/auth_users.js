// auth_users.js

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: 'testuser', password: 'testpassword' }, // Add your registered users here
];

const isValid = (username) => {
  // Write code to check if the username is valid (if needed)
  return true; // For simplicity, assuming all usernames are valid
}

const authenticatedUser = (username, password) => {
  // Write code to check if the username and password match the records
  const user = users.find((user) => user.username === username && user.password === password);
  return !!user; // Return true if the user is found, false otherwise
}

// Helper function to check if a review exists for a specific user and ISBN
const findUserReview = (username, isbn) => {
  const book = books[isbn];

  // Check if the book and reviews exist
  if (book && book.reviews) {
    // Convert reviews object to an array of values
    const reviewsArray = Object.values(book.reviews);

    // Use find method on the array
    return reviewsArray.find((review) => review.username === username);
  }

  return null;
}

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(400).json({ message: "Invalid username" });
  }

  // Check if the username and password match the records
  if (authenticatedUser(username, password)) {
    // Create a JWT token for the user
    const accessToken = jwt.sign({ username }, "access", { expiresIn: '1h' });

    // Save user credentials for the session
    req.session.authorization = { accessToken };

    return res.status(200).json({ message: "Login successful", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Only registered users can add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const reviewText = req.query.review; // Use request query to get the review text

  // Check if the user is authenticated
  if (!req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const username = jwt.decode(req.session.authorization.accessToken).username;

  // Check if the review already exists for the same user and ISBN
  const existingReview = findUserReview(username, isbn);

  if (existingReview) {
    // Modify the existing review
    existingReview.text = reviewText;
  } else {
    // Create a new review
    const newReview = {
      username,
      text: reviewText,
    };

    // Add the review to the book object
    if (!books[isbn].reviews) {
      books[isbn].reviews = {}; // Initialize reviews as an object if not exists
    }

    // Assign the new review with a unique ID
    const reviewId = Object.keys(books[isbn].reviews).length + 1;
    books[isbn].reviews[reviewId] = newReview;
  }

  // Send a success response
  return res.status(200).json({ message: "Review added or modified successfully", book: books[isbn] });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;

  // Check if the user is authenticated
  if (!req.session.authorization || !req.session.authorization.accessToken) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  const username = jwt.decode(req.session.authorization.accessToken).username;

  // Check if the review exists for the user and ISBN
  const reviewToDelete = findUserReview(username, isbn);

  if (reviewToDelete) {
    // Delete the review
    delete books[isbn].reviews[reviewToDelete.id];

    // Send a success response
    return res.status(200).json({ message: "Review deleted successfully", book: books[isbn] });
  } else {
    return res.status(404).json({ message: "Review not found" });
  }
});
module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;


