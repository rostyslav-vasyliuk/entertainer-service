const kmeans = require('./kmeans');
const Vector = require("vector-object");
const { normalizeUserDatasets, normalizeUser } = require("./kmeans-normalizer");
const usersSample = require('./sampleuser.json');

const getOptimalClustersAmount = (users = usersSample,) => {
  const sse = {};
  const MAX_K = Math.ceil(Math.sqrt(users.length));

  const { arr, userIDs } = normalizeUserDatasets(users);

  const transform = (arr) => {
    return arr.map((el, i) => ({ [`id${i}`]: el }));
  };

  const first = [4.24, 3.23, 4.29, 4.65, 2.39, 3.55, 2.34];
  const second = [3.91, 3.98, 3.47, 3.67, 3.89, 3.12, 4.43];

  const firstVector = new Vector(transform(first));
  const vect2 = new Vector(transform(second));

  console.log(firstVector.getCosineSimilarity(vect2));
  // for (let k = 1; k < MAX_K; ++k) {
  //   sse[k] = 0;

  //  kmeans.clusterize(arr, userIDs, { k, maxIterations: 10, debug: false }, (err, clusters) => {
  //     clusters.clusters.forEach((cluster) => {
  //       const currentCentroidVector = new Vector(cluster.centroid);

  //       cluster.vectorIds.forEach((userID) => {
  //         const currentUser = users.find((el) => el._id === userID);
  //         const currentUserRatesVector = new Vector(normalizeUser(currentUser));
  //         sse[k] += Math.pow(Number(currentCentroidVector.getDistance(currentUserRatesVector)), 2);
  //       });
  //     });
  //   });
  // }

  // setTimeout(() => {
  //   console.table(sse);
  // }, 100);
};

module.exports = {
  getOptimalClustersAmount
};