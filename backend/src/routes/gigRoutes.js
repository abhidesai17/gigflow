const express = require('express');

const { listGigs, createGig } = require('../controllers/gigController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', listGigs);
router.post('/', requireAuth, createGig);

module.exports = router;
