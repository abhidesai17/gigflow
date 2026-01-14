const Bid = require('../models/Bid');
const Gig = require('../models/Gig');
const { asyncHandler } = require('../utils/asyncHandler');

const createBid = asyncHandler(async (req, res) => {
  const { gigId, message, proposedPrice } = req.body;

  if (!gigId || !message || proposedPrice === undefined) {
    res.status(400);
    throw new Error('gigId, message, proposedPrice are required');
  }

  const gig = await Gig.findById(gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (gig.status !== 'open') {
    res.status(409);
    throw new Error('Gig is not open for bidding');
  }

  if (String(gig.ownerId) === String(req.user.id)) {
    res.status(400);
    throw new Error('You cannot bid on your own gig');
  }

  try {
    const bid = await Bid.create({
      gigId,
      freelancerId: req.user.id,
      message,
      proposedPrice,
      status: 'pending',
    });

    res.status(201).json({ bid });
  } catch (e) {
    if (e?.code === 11000) {
      res.status(409);
      throw new Error('You have already bid on this gig');
    }
    throw e;
  }
});

const listBidsForGig = asyncHandler(async (req, res) => {
  const { gigId } = req.params;

  const gig = await Gig.findById(gigId);
  if (!gig) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (String(gig.ownerId) !== String(req.user.id)) {
    res.status(403);
    throw new Error('Not authorized to view bids for this gig');
  }

  const bids = await Bid.find({ gigId }).sort({ createdAt: -1 }).lean();
  res.json({ bids });
});

const hireBid = asyncHandler(async (req, res) => {
  const { bidId } = req.params;

  // Non-transactional hire flow (compatible with standalone MongoDB).
  // Uses conditional updates to prevent multiple hires.
  const bidDoc = await Bid.findById(bidId);
  if (!bidDoc) {
    res.status(404);
    throw new Error('Bid not found');
  }

  const gigDoc = await Gig.findById(bidDoc.gigId);
  if (!gigDoc) {
    res.status(404);
    throw new Error('Gig not found');
  }

  if (String(gigDoc.ownerId) !== String(req.user.id)) {
    res.status(403);
    throw new Error('Not authorized to hire for this gig');
  }

  // A freelancer cannot hire themselves (owner attempting to hire their own bid).
  if (String(bidDoc.freelancerId) === String(req.user.id)) {
    res.status(400);
    throw new Error('You cannot hire yourself');
  }

  if (gigDoc.status !== 'open') {
    res.status(400);
    throw new Error('Gig already assigned');
  }

  if (bidDoc.status !== 'pending') {
    res.status(400);
    throw new Error('Bid is not pending');
  }

  // 1) Lock the gig by transitioning open -> assigned (only one request can succeed).
  const updatedGig = await Gig.findOneAndUpdate(
    { _id: gigDoc._id, status: 'open' },
    { $set: { status: 'assigned' } },
    { new: true }
  ).lean();

  if (!updatedGig) {
    res.status(400);
    throw new Error('Gig already assigned');
  }

  // 2) Mark selected bid pending -> hired.
  const updatedBid = await Bid.findOneAndUpdate(
    { _id: bidDoc._id, status: 'pending' },
    { $set: { status: 'hired' } },
    { new: true }
  ).lean();

  if (!updatedBid) {
    // Best-effort rollback: if bid couldn't be hired, reopen gig only if no bid is hired.
    const anyHired = await Bid.exists({ gigId: gigDoc._id, status: 'hired' });
    if (!anyHired) {
      await Gig.updateOne({ _id: gigDoc._id, status: 'assigned' }, { $set: { status: 'open' } });
    }

    res.status(400);
    throw new Error('Bid is not pending');
  }

  // 3) Reject all other bids for the gig.
  await Bid.updateMany(
    { gigId: gigDoc._id, _id: { $ne: bidDoc._id } },
    { $set: { status: 'rejected' } }
  );

  res.json({ gig: updatedGig, hiredBid: updatedBid });
});

module.exports = { createBid, listBidsForGig, hireBid };
