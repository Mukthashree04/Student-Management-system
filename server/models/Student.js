const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  classroomCode: { type: String, default: null, uppercase: true, index: true }
});

module.exports = mongoose.model('Student', studentSchema);
