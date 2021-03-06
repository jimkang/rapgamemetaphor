var Bot = require('./node_modules/twit/examples/bot');
var config = require('./config/config');
var createWordnok = require('wordnok').createWordnok;
var handleTwitterError = require('./handletwittererror');
var probable = require('probable');
var canonicalizer = require('canonicalizer');
var getRhymeLine = require('./get-rhyme-line');
var callNextTick = require('call-next-tick');
var ngramChainToSentence = require('ngram-chain-to-sentence');

var wordnikSource = createWordnok({
  apiKey: config.wordnikAPIKey
});
var bot = new Bot(config.twitter);

var simulationMode = (process.argv[2] === '--simulate');

console.log('rapgame is running.');

function postRapMetaphor() {
  wordnikSource.getTopic(postWithWord);
}

function postWithWord(error, word) {
  if (error) {
    handleTwitterError(error);
  }
  else {
    var forms = canonicalizer.getSingularAndPluralForms(word);
    word = forms[0];

    var introTable = probable.createRangeTableFromDict({
      'I\'m the': 35,
      'I\'m like the': 10,
      'It\'s the': 20,
      'Here I am, the': 10,
      'I\'m a': 15
    });

    var prefixExclamationTable = probable.createRangeTableFromDict({
      'UNH!': 10,
      'Blaow!': 10,
      'BOOM!': 10
    });

    var prefixTable = probable.createRangeTableFromDict({
      rap: 50,
      'rap game': 30
    });
    var suffixTable = probable.createRangeTableFromDict({
      'of rap': 50,
      'of rap! There is none higher': 7,
      'of the rap game': 15,
      'of the whole rap game': 8,
      'of this rap shit': 10
    });

    var configRoll = probable.roll(5);

    var usePrefix = true;
    var useSuffix = false;
    var useIntro = true;
    var usePrefixExclamation = false;

    if (configRoll > 2) {
      usePrefix = false;
      useSuffix = true;
    }

    if (configRoll > 3) {
      usePrefixExclamation = true;
    }

    var text = '';
    var lastWord;

    if (usePrefixExclamation) {
      text += (prefixExclamationTable.roll() + ' ');
    }
    if (useIntro) {
      text += (introTable.roll() + ' ');
    }
    if (usePrefix) {
      text += (prefixTable.roll() + ' ');
    }
    
    text += word;
    lastWord = word;

    if (useSuffix) {
      var suffix = suffixTable.roll();
      text += (' ' + suffix);
      lastWord = getLastWord(suffix);
    }

    text += '!';
    text = capitalizeFirst(text);

    var getRhymeOpts = {
      endWord: lastWord,
      topic: word,
      random: Math.random,
      strict: false
    };

    var rhymeRetries = 0;

    getRhymeLine(getRhymeOpts, addRhymeLine);

    function addRhymeLine(error, rhymePath) {
      if (error) {
        console.log(error);
        if (error.message === 'Could not find rhymes.') {
          rhymeRetries += 1;
          callNextTick(getRhymeLine, getRhymeOpts, addRhymeLine);
          return;
        }
      }
      else if (rhymePath && rhymePath.length > 1) {
        var rhymeSentence = ngramChainToSentence(rhymePath);
        if (probable.roll(2) === 0) {
          text += '\n' + rhymeSentence;
        }
        else {
          text = rhymeSentence + '\n' + text;
        }
      }
      else if (rhymeRetries < 5) {
        // Retry.
        rhymeRetries += 1;
        console.log('Retry ', rhymeRetries);
        callNextTick(getRhymeLine, getRhymeOpts, addRhymeLine);
        return;
      }
      else {
        console.log('Retried', rhymeRetries, 'times with no luck.');
        return;
      }

      if (simulationMode) {
        console.log('Would have tweeted:', text);
      }
      else {
        bot.tweet(text, reportTweetResult);
      }
    }
  }
}

function reportTweetResult(error, reply) {
  console.log((new Date()).toString(), 'Tweet posted', reply.text);
}

function getLastWord(sentence) {
  var words = sentence.split(' ');
  return words[words.length - 1];
}

function capitalizeFirst(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

postRapMetaphor();
