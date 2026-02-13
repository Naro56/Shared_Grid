const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  owner_id: { type: String, default: null },
  owner_color: { type: String, default: null },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Map _id to id for frontend compatibility
blockSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure (x, y) is unique
blockSchema.index({ x: 1, y: 1 }, { unique: true });

module.exports = mongoose.model('Block', blockSchema);
