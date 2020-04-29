const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    link: String,
    title: String,
    type: String,
    duration: String,
    level: String,
    rating: String,
    description: String,
    'instructor-avatar': String,
    'instructor-name': String,
    'instructor-title': String,
    img: String
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

module.exports = {
  Course
}
