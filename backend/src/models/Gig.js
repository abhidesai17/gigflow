const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    budget: { type: Number, required: true, min: 0 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['open', 'assigned'], default: 'open', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gig', gigSchema);
