const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '../.env' }); // Adjust path if running from scripts folder
// Or just assume running from backend root

// If running from backend filter via "node scripts/seedAdmin.js"
if (!process.env.MONGO_URI) {
    const path = require('path');
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dopt');

        // Check if admin exists
        const adminExists = await User.findOne({ email: 'admin@dopt.com' });

        if (adminExists) {
            await User.deleteOne({ email: 'admin@dopt.com' });
            console.log('Removed existing admin to re-seed');
        }

        const user = new User({
            name: 'System Admin',
            email: 'admin@dopt.com',
            password: 'adminpassword123', // Will be hashed by pre-save hook
            role: 'admin'
        });

        await user.save();
        console.log('Admin user seeded successfully');
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
