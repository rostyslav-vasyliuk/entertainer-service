const { Event } = require('../models/event-model');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

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
      .skip(DEFAULT_PER_PAGE * (page - 1))
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

    const recommendations = await Event.find({ categories: event.categories[0], _id: { $ne: id } })
      .limit(10)
      .sort({ date: 'asc' });

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    user.visitedEvents.push(id);

    await user.save();

    const isFavourite = user.favouriteEvents.indexOf(id) === -1 ? false : true;
    console.log(isFavourite)
    res.status(200).send({ event, recommendations, isFavourite });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const addToFavourites = async (req, res) => {
  try {
    const id = req.body.id;

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    const index = user.favouriteEvents.indexOf(id);

    if (index === -1) {
      user.favouriteEvents.push(id)
    } else {
      user.favouriteEvents.splice(index, 1);
    }

    await user.save();

    const isFavourite = index === -1 ? true : false;
    res.status(200).send({ isFavourite });
  } catch (err) {
    res.status(500).json(err);
  }
};

const getFavourites = async (req, res) => {
  try {
    const page = req.query.page;

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    const favouriteEventsIds = user.favouriteEvents;
    console.log(favouriteEventsIds)
    const total = user.favouriteEvents.length;
    const events = await Event.find().where('_id').in(favouriteEventsIds).exec()

    const pagination = { total, page, perPage: DEFAULT_PER_PAGE };

    res.status(200).send({ events, pagination });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails,
  getEvents,
  addToFavourites,
  getFavourites
};
