const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Operation = require('../models/Operation');

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

const debugData = async () => {
    await connectDB();

    try {
        console.log("--- USERS ---");
        const users = await User.find({}).sort({ userno: 1 });
        users.forEach(u => console.log(`${u.name} | Role: ${u.role} | ID: ${u.userno}`));

        console.log("\n--- OPERATIONS ---");
        const ops = await Operation.find({});
        ops.forEach(op => console.log(`Op: ${op.name} | AssignedTo: '${op.assignedUser}'`));

        console.log("\n--- ANALYSIS ---");
        // Check for operations that don't match any user
        const userIDs = users.map(u => u.userno);
        ops.forEach(op => {
            if (!userIDs.includes(op.assignedUser)) {
                console.log(`WARNING: Operation '${op.name}' is assigned to '${op.assignedUser}' which DOES NOT EXIST in Users.`);
            } else {
                console.log(`MATCH: Operation '${op.name}' assigned to valid user '${op.assignedUser}'`);
            }
        });

        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

debugData();
