const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    gigId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true, index: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    message: { type: String, required: true, trim: true },
    proposedPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'hired', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
);

bidSchema.index({ gigId: 1, freelancerId: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
