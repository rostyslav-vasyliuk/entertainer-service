const { Event } = require('../models/event-model');

const DEFAULT_PER_PAGE = 20;

const getEvents = async (req, res) => {
  try {
    const page = req.query.page;
    const category = req.query.category;
    const body = {};

    if (category) {
      body.categories = category;
    }

    const total = await Event.countDocuments(body);

    const events = await Event.find(body)
      .limit(DEFAULT_PER_PAGE)
      .skip(DEFAULT_PER_PAGE * page)
      .sort({ date: 'asc' });

    const pagination = { total, page, perPage: DEFAULT_PER_PAGE };

    res.status(200).send({ events, pagination });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const event = await Event.findById(id);

    const recommendations = await Event.find({ categories: event.categories[0] })
      .limit(10)
      .sort({ date: 'asc' });

    res.status(200).send({ event, recommendations });
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails,
  getEvents
};
