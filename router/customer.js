// customer.js
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customerRouter = express.Router();

customerRouter.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Check if the user exists and the password is correct
  const user = authenticateUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Generate a JWT token for the user
  const token = jwt.sign({ username: user.username }, 'fingerprint_customer', { expiresIn: '1h' });

  // Save the token in the session (you might want to store it securely)
  req.session.authorization = { accessToken: token };

  // Return a success response with the token
  res.json({ message: "Login successful", token });
});

// Authentication middleware
customerRouter.use("/auth/*", function auth(req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization['accessToken'];
    jwt.verify(token, "access", (err, user) => {
      if (!err) {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ message: "User not authenticated" });
      }
    });
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// Add a book review
customerRouter.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  return res.status(300).json({ message: "Yet to be implemented" });
});

module.exports = customerRouter;
