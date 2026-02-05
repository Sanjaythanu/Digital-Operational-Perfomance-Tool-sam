const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    const { name, email, password, adminSecret } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check for admin privileges
        // If adminSecret is provided and matches the secure key, grant admin role
        const role = (adminSecret && adminSecret === (process.env.ADMIN_SECRET || 'admin-secret-key-123')) ? 'admin' : 'user';

        // Auto-generate User ID based on Role
        // AD-XXX for Admin, U-XXX for User
        let nextId = '';
        const prefix = role === 'admin' ? 'AD' : 'U';

        // Find last user WITH THE SAME ROLE to increment correctly
        const lastUser = await User.findOne({ role }).sort({ createdAt: -1 });

        if (lastUser && lastUser.userno && lastUser.userno.startsWith(prefix)) {
            const lastIdNum = parseInt(lastUser.userno.split('-')[1]);
            if (!isNaN(lastIdNum)) {
                nextId = `${prefix}-${String(lastIdNum + 1).padStart(3, '0')}`;
            } else {
                nextId = `${prefix}-001`;
            }
        } else {
            nextId = `${prefix}-001`;
        }

        const user = await User.create({
            name,
            email,
            userno: nextId,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userno: user.userno,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                userno: user.userno,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
