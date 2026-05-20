// Importing packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const authMiddleware = require('./middleware/auth')

// Load env file
dotenv.config();

// Creating app and setting the port
connectDB();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Define Routes
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json(
        {
            message: `Hello ${req.user.userId}, you are authenticated!`
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})