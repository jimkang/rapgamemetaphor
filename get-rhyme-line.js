var createRime = require('rime');
var queue = require('queue-async');
var _ = require('lodash');
var callNextTick = require('call-next-tick');
var WanderGoogleNgrams = require('wander-google-ngrams');
var async = require('async');
var createProbable = require('probable').createProbable;
var config = require('./config/config');

var createWanderStream = WanderGoogleNgrams({
  wordnikAPIKey: config.wordnikAPIKey
});

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
      wrapUpRime(new Error('Could not find rhymes.'));
      return;
    }

    var q = queue(1);
    rhymes.forEach(queueGetWords);
    q.awaitAll(wrapUpRime);

    function queueGetWords(rhyme) {
      q.defer(rime.getWordsThatFitPhonemes, rhyme);
    }

    function wrapUpRime(error, rhymePath) {
      rime.closeDb(passError);

      function passError(closeError, error) {
        if (closeError) {
          done(closeError, rhymePath);
        }
        else {
          done(error, rhymePath);
        }
      }
    }
  }

  function wanderUpSentence(words, done) {
    if (!words || words.length < 1) {
      callNextTick(done);
      return;
    }

    var cleanedUpWords = _.flatten(_.compact(words));
    var sentenceWords = [];

    var opts = {
      word: probable.pickFromArray(cleanedUpWords).toLowerCase(),
      direction: 'backward',
      repeatLimit: 1,
      tryReducingNgramSizeAtDeadEnds: true,
      shootForASentence: true,
      maxWordCount: 12
    };

    var stream = createWanderStream(opts);
    stream.on('end', passBackSentenceWords);
    stream.on('error', done);
    stream.on('data', saveWord);

    function saveWord(word) {
      sentenceWords.unshift(word);
    }

    function passBackSentenceWords() {
      done(null, sentenceWords);
    }
  }
}

module.exports = getRhymeLine;
