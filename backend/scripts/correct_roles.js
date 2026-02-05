const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dopt');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const correctRoles = async () => {
    await connectDB();

    try {
        // 1. Identify the Main Admin
        const mainAdminEmail = 'admin@dopt.com'; // Adjust if different

        // 2. Set everyone else to 'user'
        const usersToDowngrade = await User.find({ email: { $ne: mainAdminEmail } });
        console.log(`Found ${usersToDowngrade.length} users to potentialy correctness check.`);

        for (const user of usersToDowngrade) {
            if (user.role === 'admin') {
                user.role = 'user';
                await user.save();
                console.log(`Downgraded ${user.name} to 'user'`);
            }
        }

        // 3. Re-assign IDs
        // Fix Admin ID
        // 3. Re-assign IDs safely
        // Step A: Assign TEMP IDs to avoid collision
        const allUsers = await User.find({});
        for (let i = 0; i < allUsers.length; i++) {
            allUsers[i].userno = `TEMP-${Date.now()}-${i}`;
            await allUsers[i].save();
        }

        // Fix Admin IDs
        const admins = await User.find({ role: 'admin' }).sort({ createdAt: 1 });
        for (let i = 0; i < admins.length; i++) {
            const user = admins[i];
            const newId = `AD-${String(i + 1).padStart(3, '0')}`;
            if (user.userno !== newId) {
                user.userno = newId;
                await user.save();
                console.log(`Updated Admin ${user.name} -> ${newId}`);
            }
        }

        // Fix User IDs
        const users = await User.find({ role: 'user' }).sort({ createdAt: 1 });
        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            const newId = `U-${String(i + 1).padStart(3, '0')}`;
            if (user.userno !== newId) {
                user.userno = newId;
                await user.save();
                console.log(`Updated User ${user.name} -> ${newId}`);
            }
        }

        console.log('Roles and IDs corrected.');
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

correctRoles();
