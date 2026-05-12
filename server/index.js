// Importing packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require("mongoose")

// Load env file
dotenv.config();

// Creating app and setting the port
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log('MongoDB Connection Error:', error))

// Define Routes
app.get('/', (req, res) => {
    res.json(
        {
            message: "Motor Archive API is running!!"
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})