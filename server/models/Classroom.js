const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Classroom', classroomSchema);


