const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dopt');
        console.log('Connected to DB');

        const email = 'Sanjaychittu2005@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.name} (${user.email}) - Role: ${user.role}`);
        } else {
            console.log(`User with email ${email} NOT found.`);
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUser();
