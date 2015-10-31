var createRime = require('rime');
var queue = require('queue-async');
var _ = require('lodash');
var callNextTick = require('call-next-tick');

function getRhymeLine(opts, done) {
  var endWord;
  var topic;
  var random;
  var strict;

  if (opts) {
    endWord = opts.endWord;
    topic = opts.topic;
    random = opts.random;
    strict = opts.strict;
  }

  createRime(
    {
      random: random
    },
    getRhymesWithRime
  );

  function getRhymesWithRime(error, rime) {
    var rhymes = rime.getLastSyllableRhymes({
      base: endWord,
      strict: strict
    });

    if (!rhymes) {
      callNextTick(done);
      return;
    }

    console.log('Last syllable rhyme phoneme sequences:');
    console.log(JSON.stringify(rhymes, null, '  '));

    var q = queue(1);
    rhymes.forEach(queueGetWords);
    q.awaitAll(done);

    function queueGetWords(rhyme) {
      q.defer(rime.getWordsThatFitPhonemes, rhyme);
    }
  }
}

module.exports = getRhymeLine;
