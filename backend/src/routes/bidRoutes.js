const express = require('express');

const { requireAuth } = require('../middleware/auth');
const { createBid, listBidsForGig, hireBid } = require('../controllers/bidController');

const router = express.Router();

router.post('/', requireAuth, createBid);
router.get('/:gigId', requireAuth, listBidsForGig);
router.patch('/:bidId/hire', requireAuth, hireBid);

module.exports = router;
