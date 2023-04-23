const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Required custome middleweares
const errorHandler = require('./middlewares/errorHandler');
const protectRoutes = require('./middlewares/protectRoutes');

// Required routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');

// Configure the dotenv
dotenv.config();

// Initialize the server
const app = express();

// Middlewares
app.use(express.json());
app.use(helmet());
app.use(morgan('common'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', protectRoutes, userRoutes);
app.use('/api/posts', protectRoutes, postRoutes);

// Listening to requests
const port = process.env.PORT || 5000;
app.listen(process.env.PORT, () => {
  // Connect to Database
  mongoose
    .connect(process.env.MONGODB_URI)
    .then((req) =>
      console.log(`Server is on port: ${port} and Connected to the DB`)
    );
});

// Error handler middleware
// It should be at the end
app.use(errorHandler);
