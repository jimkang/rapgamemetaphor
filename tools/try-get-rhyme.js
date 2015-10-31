var getRhymeLine = require('../get-rhyme-line');
var seedrandom = require('seedrandom');
var _ = require('lodash');

if (process.argv.length < 3) {
  console.log('Usage: node tools/try-get-rhyme.js <endword> <topic>');
  process.exit();
}

var endWord = process.argv[2];
var topic = process.argv[3];

var seed = (new Date()).toISOString();
console.log('Seed:', seed);

var opts = {
  endWord: endWord,
  topic: topic,
  random: seedrandom(seed),
  strict: false
};

getRhymeLine(opts, reportAllWords);

function reportAllWords(error, words) {
  if (error) {
    console.log(error, error.stack);
  }
  else if (!words) {
    console.log('No rhymes found.');
  }
  else {
    var cleanedUpWords = _.flatten(_.compact(words));
    console.log('Words that match rhyme sequences:');
    console.log(JSON.stringify(cleanedUpWords, null, '  '));
  }
}
