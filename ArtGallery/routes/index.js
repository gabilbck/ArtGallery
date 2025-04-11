const express = require('express');
const router = express.Router();

// Define routes
router.get('/', (req, res) => { /* ... */ });

// Ensure you export the router directly
module.exports = router; // ✅ Correct export