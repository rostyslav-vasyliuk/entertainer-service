const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    link: String,
    title: String,
    categories: [String],
    city: String,
    price: String,
    date: Date,
    img: String
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = {
  Event
}
