const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  classroomCode: { type: String, required: true, index: true, uppercase: true },
  user: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  ts: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

messageSchema.index({ classroomCode: 1, ts: -1 });

module.exports = mongoose.model('Message', messageSchema);


