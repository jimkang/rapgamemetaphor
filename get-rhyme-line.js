var createRime = require('rime');
var queue = require('queue-async');
var _ = require('lodash');
var callNextTick = require('call-next-tick');
var WanderGoogleNgrams = require('wander-google-ngrams');
var async = require('async');
var createProbable = require('probable').createProbable;

var wander = WanderGoogleNgrams();

function getRhymeLine(opts, getDone) {
  var endWord;
  var topic;
  var random;
  var strict;
  var probable;

  if (opts) {
    endWord = opts.endWord;
    topic = opts.topic;
    random = opts.random;
    strict = opts.strict;
  }

  probable = createProbable({
    random: random
  });

  async.waterfall(
    [
      callCreateRime,
      getRhymesWithRime,
      wanderUpSentence      
    ],
    getDone
  );

  function callCreateRime(done) {
    createRime(
      {
        random: random
      },
      done
    );
  }

  function getRhymesWithRime(rime, done) {
    var rhymes = rime.getLastSyllableRhymes({
      base: endWord,
      strict: strict
    });

    if (!rhymes) {
      callNextTick(done, new Error('Could not find rhymes.'));
      return;
    }

    // console.log('Last syllable rhyme phoneme sequences:');
    // console.log(JSON.stringify(rhymes, null, '  '));

    var q = queue(1);
    rhymes.forEach(queueGetWords);
    q.awaitAll(done);

    function queueGetWords(rhyme) {
      q.defer(rime.getWordsThatFitPhonemes, rhyme);
    }
  }

  function wanderUpSentence(words, done) {
    if (!words || words.length < 1) {
      callNextTick(done);
      return;
    }

    var cleanedUpWords = _.flatten(_.compact(words));

    var opts = {
      word: probable.pickFromArray(cleanedUpWords),
      direction: 'backward'
    };
    wander(opts, done);
  }
}

module.exports = getRhymeLine;
