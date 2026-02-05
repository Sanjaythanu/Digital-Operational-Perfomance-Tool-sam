const express = require('express');
const router = express.Router();
const Operation = require('../models/Operation');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Create new operation
// @route   POST /api/operations
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
    console.log('POST /api/operations request body:', req.body); // DEBUG LOG
    const { name, department, assignedUser, performanceScore } = req.body;

    try {
        if (!name) return res.status(400).json({ message: 'Missing field: Operation Name' });
        if (!department) return res.status(400).json({ message: 'Missing field: Department' });
        if (!assignedUser) return res.status(400).json({ message: 'Missing field: Assigned User' });
        if (performanceScore === undefined) return res.status(400).json({ message: 'Missing field: Performance Score' });

        const operation = new Operation({
            name,
            department,
            assignedUser,
            performanceScore,
            userId: req.user._id, // Linked to creator
        });

        const createdOperation = await operation.save();
        console.log('Operation created successfully:', createdOperation); // DEBUG LOG
        res.status(201).json(createdOperation);
    } catch (error) {
        console.error("Operation creation error:", error);
        res.status(400).json({ message: error.message || 'Invalid Operation Data' });
    }
});

// @desc    Get operations
// @route   GET /api/operations
// @access  Private (User: own, Admin: all)
router.get('/', protect, async (req, res) => {
    try {
        let operations;
        if (req.user.role === 'admin') {
            operations = await Operation.find({}).select('-userId');
        } else {
            // Users see operations assigned to their specific User No (userno)
            operations = await Operation.find({ assignedUser: req.user.userno }).select('-userId');
        }
        res.json(operations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Update operation
// @route   PUT /api/operations/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
    const { name, department, assignedUser, performanceScore } = req.body;

    try {
        const operation = await Operation.findById(req.params.id);

        if (operation) {
            // Allow Admin OR Owner to update
            if (req.user.role !== 'admin' && operation.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            operation.name = name || operation.name;
            operation.department = department || operation.department;
            operation.assignedUser = assignedUser || operation.assignedUser;
            operation.performanceScore = performanceScore !== undefined ? performanceScore : operation.performanceScore;

            const updatedOperation = await operation.save();
            res.json(updatedOperation);
        } else {
            res.status(404).json({ message: 'Operation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Delete operation
// @route   DELETE /api/operations/:id
// @access  Private (Admin or Owner)
router.delete('/:id', protect, async (req, res) => {
    try {
        const operation = await Operation.findById(req.params.id);

        if (operation) {
            if (req.user.role !== 'admin' && operation.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            await operation.deleteOne();
            res.json({ message: 'Operation removed' });
        } else {
            res.status(404).json({ message: 'Operation not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
