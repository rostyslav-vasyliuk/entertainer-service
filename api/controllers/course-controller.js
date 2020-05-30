const { Course } = require('../models/course-model');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user-model');

const DEFAULT_PER_PAGE = 20;

const getCourses = async (req, res) => {
  try {
    const page = req.query.page;
    const type = req.query.type;
    const body = {};
    console.log(type)
    if (type) {
      body.type = type;
    }

    const total = await Course.countDocuments(body);

    const courses = await Course.find(body)
      .limit(DEFAULT_PER_PAGE)
      .skip(DEFAULT_PER_PAGE * (page - 1))
      .sort({ date: 'asc' });

    const pagination = { total, page, perPage: DEFAULT_PER_PAGE };
    console.log(courses.length)
    res.status(200).send({ courses, pagination });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

const getDetails = async (req, res) => {
  try {
    const id = req.params.id;

    const course = await Course.findById(id);

    const recommendations = await Course.find({ type: course.type, _id: { $ne: id } })
      .limit(10)
      .sort({ date: 'asc' });

    const token = req.headers['access-token'];
    const decoded = jwt.decode(token);

    const user = await User.findById(decoded.id);

    user.visitedCourses.push(id);

    await user.save();

    const isFavourite = user.favouriteCourses.indexOf(id) === -1 ? false : true;
    console.log(isFavourite)
    res.status(200).send({ course, recommendations, isFavourite });
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

    const index = user.favouriteCourses.indexOf(id);

    if (index === -1) {
      user.favouriteCourses.push(id)
    } else {
      user.favouriteCourses.splice(index, 1);
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

    const favouriteIds = user.favouriteCourses;
    console.log(favouriteIds)
    const total = user.favouriteCourses.length;
    const courses = await Course.find().where('_id').in(favouriteIds).exec()

    const pagination = { total, page, perPage: DEFAULT_PER_PAGE };

    res.status(200).send({ courses, pagination });
  } catch (err) {
    console.log(err)
    res.status(500).json(err);
  }
};

module.exports = {
  getDetails,
  getCourses,
  addToFavourites,
  getFavourites
};
