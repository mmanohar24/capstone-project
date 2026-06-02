const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Sign Up
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check all fields are present
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        // Check password length
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email already exists" });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create the user
        const user = new User(
            {
                name,
                email,
                password: hashPassword
            }
        );

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        )

        res.status(201).json(
            {
                message: "Account created successfully",
                token,
                user:
                {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        );

    }
    catch (error) {
        console.log('SignUp Error:', error.code, error.message);

        if (error.code === 11000) {
            return res.status(400).json({ message: "An account with this email already exists" })
        }
        res.status(500).json({ message: "Server error" })

    }
})

// Login
router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;

        // Check all fields are present
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Email or password is incorrect" })
        }

        // Check password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({ message: "Password is incorrect" })
        }

        // Create JWT token
        const token = jwt.sign(
            {
                userId: user._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        )

        res.status(200).json(
            {
                message: "Logged in successfully",
                token,
                user:
                {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }
        );
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' })
    }
})

module.exports = router;