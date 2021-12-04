const euclidean = require('ml-distance-euclidean').euclidean;
const distanceMatrix = require('ml-distance-matrix');

function silhouetteScore(data, labels) {
  let dist = distanceMatrix(data, euclidean);
  let result = silhouetteSamples(dist, labels, silhouetteReduce);
  return result.reduce((p, c, i) => p + (c - p) / (i + 1), 0);
}

function silhouetteSamples(data, labels, reduceFunction) {
  let labelsFreq = countBy(labels);
  let samples = reduceFunction(data, labels, labelsFreq);
  let denom = labels.map((val) => labelsFreq[val] - 1);
  let intra = samples.intraDist.map((val, ind) => val / denom[ind]);
  let inter = samples.interDist;
  return inter
    .map((val, ind) => val - intra[ind])
    .map((val, ind) => val / Math.max(intra[ind], inter[ind]));
}

function countBy(arr) {
  let valid = arr.every((val) => {
    if (typeof val !== 'number') return false;
    return val >= 0.0 && Math.floor(val) === val && val !== Infinity;
  });

  if (!valid) { return; }

  let out = Array.from({ length: Math.max(...arr) + 1 }, () => 0);
  arr.forEach((value) => {
    out[value]++;
  });
  return out;
}

function silhouetteReduce(dataChunk, labels, labelFrequencies) {
  let clusterDistances = dataChunk.map((row) =>
    labelFrequencies.map((_, mInd) =>
      labels.reduce(
        (acc, val, rInd) => (val === mInd ? acc + row[rInd] : acc + 0),
        0
      )
    )
  );
  let intraDist = clusterDistances.map((val, ind) => val[labels[ind]]);
  let interDist = clusterDistances
    .map((mVal, mInd) => {
      mVal[labels[mInd]] += Infinity;
      labelFrequencies.forEach((fVal, fInd) => (mVal[fInd] /= fVal));
      return mVal;
    })
    .map((val) => Math.min(...val));
  return {
    intraDist: intraDist,
    interDist: interDist,
  };
}