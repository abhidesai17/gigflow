const Gig = require('../models/Gig');
const { asyncHandler } = require('../utils/asyncHandler');

const listGigs = asyncHandler(async (req, res) => {
  const search = (req.query.search || '').trim();

  const filter = { status: 'open' };
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const gigs = await Gig.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ gigs });
});

const createGig = asyncHandler(async (req, res) => {
  const { title, description, budget } = req.body;

  if (!title || !description || budget === undefined) {
    res.status(400);
    throw new Error('title, description, budget are required');
  }

  const gig = await Gig.create({
    title,
    description,
    budget,
    ownerId: req.user.id,
    status: 'open',
  });

  res.status(201).json({ gig });
});

module.exports = { listGigs, createGig };
