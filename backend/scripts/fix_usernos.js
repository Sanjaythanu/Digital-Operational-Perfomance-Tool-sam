const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/operational-dashboard');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const fixUserNos = async () => {
    await connectDB();

    try {
        // Fix Admins
        const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 });
        console.log(`Found ${admins.length} admins.`);
        for (let i = 0; i < admins.length; i++) {
            const user = admins[i];
            const newId = `AD-${String(i + 1).padStart(3, '0')}`;
            if (user.userno !== newId) {
                user.userno = newId;
                await user.save();
                console.log(`Updated Admin ${user.name} -> ${newId}`);
            }
        }

        // Fix Users
        const users = await User.find({ role: 'user' }).sort({ createdAt: 1 });
        console.log(`Found ${users.length} users.`);
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const newId = `U-${String(i + 1).padStart(3, '0')}`;
            if (user.userno !== newId) {
                user.userno = newId;
                await user.save();
                console.log(`Updated User ${user.name} -> ${newId}`);
            }
        }

        console.log('All IDs updated successfully.');
        process.exit();
    } catch (error) {
        console.error('Error updating users:', error);
        process.exit(1);
    }
};

fixUserNos();
