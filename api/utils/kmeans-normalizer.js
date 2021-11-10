const normalizeUserDatasets = (usersData) => {
  const userIDs = [];

  const arr = usersData.map((dbUserInfo, i) => {
    const data = {};

    dbUserInfo.averageMovieGenres.forEach((elem) => {
      data[elem.name] = elem.average;
    });

    userIDs.push(dbUserInfo._id);
    return data;
  });

  return ({ arr, userIDs });
};

const normalizeUser = (userData) => {
  const data = {};

  userData.averageMovieGenres.forEach((elem) => {
    data[elem.name] = elem.average;
  });

  return data;
};

module.exports = {
  normalizeUserDatasets,
  normalizeUser
};