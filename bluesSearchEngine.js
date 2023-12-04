module.exports = { compareTwoStrings, findBestMatch };
function compareTwoStrings(first, second) {
  first = first.replace(/\s+/g, '');
  second = second.replace(/\s+/g, '');
  if (first === second) return 1;
  if (first.length < 2 || second.length < 2) return 0;
  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1;
    firstBigrams.set(bigram, count);
  }
  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }
  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

function findBestMatch(mainString, targetStrings) {
  if (!areArgsValid(mainString, targetStrings)) throw new Error('Error! Arguments are not valid. SearchData need to be a non-empty array of number or strings, and searchString need to be a string.');
  const ratings = [];
  let bestMatchIndex = 0;
  for (let i = 0; i < targetStrings.length; i++) {
    const currentTargetString = targetStrings[i];
    const currentRating = compareTwoStrings(mainString, currentTargetString);
    ratings.push({ target: currentTargetString, rating: currentRating });
    if (currentRating > ratings[bestMatchIndex].rating) {
      bestMatchIndex = i;
    }
  }
  const bestMatch = ratings[bestMatchIndex];
  return { ratings, bestMatch, bestMatchIndex };
}

function areArgsValid(mainString, targetStrings) {
  if (typeof mainString !== 'string' || !Array.isArray(targetStrings) || !targetStrings.length || targetStrings.find(s => typeof s !== 'string')) {
    return false;
  }
  return true;
}