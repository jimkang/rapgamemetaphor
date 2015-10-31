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

function reportAllWords(error, path) {
  if (error) {
    console.log(error, error.stack);
  }
  else if (!path) {
    console.log('No rhymes found.');
  }
  else {
    console.log('Words that match rhyme sequences:');
    console.log(JSON.stringify(path, null, '  '));
  }
}
