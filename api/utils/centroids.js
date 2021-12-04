const Vector = require('vector-object');

function getRandomInRange(min, max) {
  return Math.random() * (max - min) + min;
}

function getInitialCentroids(data, k) {
  if (k > data.length) {
    throw new Error(`Cannot get ${k} centroids cause length of input data is ${data.length}`);
  }

  const randomCentroid = new Vector(data[getRandomInRange(0, data.length - 1)]);
  const initialCentroids = [randomCentroid];

  for (let i = 0; i < k - 2; i++) {
    const maxDistance = 0;
    let centroidCandidate = null;

    data.forEach(element => {
      const totalDistanceToAllCentroids = initialCentroids.reduce(
        (partial_sum, a) => partial_sum + a.getDistance(new Vector(element))
        , 0);

        if (totalDistanceToAllCentroids >  maxDistance) {
          maxDistance = totalDistanceToAllCentroids;
          centroidCandidate = new Vector(element);
        }
    });

    initialCentroids.push(centroidCandidate);
  }

  return initialCentroids;
}

module.exports = {
  getInitialCentroids,
};