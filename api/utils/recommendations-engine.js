const Vector = require('vector-object');

function getRecommendationsCF(clusterUsers, userID) {
  const currentUser = clusterUsers.find(el => el.id === userID);

  if (currentUser === undefined) {
    throw new Error(`User ${userID} does not exist in current cluster`);
  }

  const cleanClustersUsers = clusterUsers
    .filter(user => user.id !== userID);

  const movieList = [];

  cleanClustersUsers.forEach(clusterUser => {
    const cosineSimilarity = new Vector(currentUser.averageMovieGenres.map(el => el.average))
      .getCosineSimilarity(new Vector(clusterUser.averageMovieGenres.map(el => el.average)));

    clusterUser.userMovieRatings.forEach(movieRatingObj => {
      const currentMovieListIndex = movieList.findIndex(el => el.movieID == movieRatingObj.movieID);
      if (currentMovieListIndex === -1) {
        movieList.push({
          movieID: movieRatingObj.movieID,
          rating: movieRatingObj.rating * cosineSimilarity
        });
      } else {
        movieList[currentMovieListIndex].rating = (
          movieList[currentMovieListIndex].rating + movieRatingObj.rating * cosineSimilarity
        ) / 2;
      }
    });
  });

  return movieList.sort((a, b) => b.rating - a.rating);
};

module.exports = {
  getRecommendationsCF,
};