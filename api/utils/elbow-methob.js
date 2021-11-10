const kmeans = require('./kmeans');
const Vector = require("vector-object");
const { normalizeUserDatasets, normalizeUser } = require("./kmeans-normalizer");
const usersSample = require('./sampleuser.json');

const getOptimalClustersAmountElbowMethod = (users = usersSample,) => {
  const sse = {};
  const MAX_K = Math.ceil(Math.sqrt(users.length));

  const { arr, userIDs } = normalizeUserDatasets(users);

  for (let k = 1; k < MAX_K; ++k) {
    sse[k] = 0;

   kmeans.clusterize(arr, userIDs, { k, maxIterations: 10, debug: false }, (err, clusters) => {
      clusters.clusters.forEach((cluster) => {
        const currentCentroidVector = new Vector(cluster.centroid);

        cluster.vectorIds.forEach((userID) => {
          const currentUser = users.find((el) => el._id === userID);
          const currentUserRatesVector = new Vector(normalizeUser(currentUser));
          sse[k] += Math.pow(Number(currentCentroidVector.getDistance(currentUserRatesVector)), 2);
        });
      });
    });
  }

  setTimeout(() => {
    console.table(sse);
  }, 100);
};

module.exports = {
  getOptimalClustersAmountElbowMethod
};