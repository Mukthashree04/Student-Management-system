const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true, uppercase: true },
}, { timestamps: true });

classroomSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('Classroom', classroomSchema);


