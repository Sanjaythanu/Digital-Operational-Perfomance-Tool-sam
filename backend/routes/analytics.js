const express = require('express');
const router = express.Router();
const Operation = require('../models/Operation');
const { protect } = require('../middleware/authMiddleware');
const { THRESHOLDS } = require('../config/constants');

// @desc    Get dashboard stats
// @route   GET /api/analytics
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'admin') {
            query = { assignedUser: req.user.userno };
        }

        const operations = await Operation.find(query);

        const totalOperations = operations.length;
        const avgPerformance = totalOperations > 0
            ? operations.reduce((acc, curr) => acc + curr.performanceScore, 0) / totalOperations
            : 0;

        const optimalStats = operations.filter(op => op.performanceScore >= THRESHOLDS.OPTIMAL).length;
        const criticalAlerts = operations.filter(op => op.performanceScore < THRESHOLDS.CRITICAL).length;

        // Calculate department stats for the matrix
        const departmentStatsMap = {};
        operations.forEach(op => {
            if (!departmentStatsMap[op.department]) {
                departmentStatsMap[op.department] = { total: 0, count: 0 };
            }
            departmentStatsMap[op.department].total += op.performanceScore;
            departmentStatsMap[op.department].count += 1;
        });

        const departmentStats = Object.keys(departmentStatsMap).map(dept => ({
            department: dept,
            performance: Math.round(departmentStatsMap[dept].total / departmentStatsMap[dept].count)
        }));

        res.json({
            totalOperations,
            avgPerformance: avgPerformance.toFixed(1),
            optimalStats,
            criticalAlerts,
            departmentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
