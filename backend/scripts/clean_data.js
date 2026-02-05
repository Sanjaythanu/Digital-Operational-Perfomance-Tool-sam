const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Operation = require('../models/Operation');

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

const cleanData = async () => {
    await connectDB();

    try {
        const users = await User.find({});
        const validUserNos = users.map(u => u.userno);

        console.log(`Valid User IDs: ${validUserNos.join(', ')}`);

        const result = await Operation.deleteMany({
            assignedUser: { $nin: validUserNos }
        });

        console.log(`Deleted ${result.deletedCount} operations with invalid Assigned IDs.`);
        console.log("Remaining Operations:");
        const remaining = await Operation.find({});
        remaining.forEach(op => console.log(`- ${op.name} (${op.assignedUser})`));

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

cleanData();
