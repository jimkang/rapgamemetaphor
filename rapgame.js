var Bot = require('./node_modules/twit/examples/bot');
var config = require('./config');
var createWordnok = require('wordnok').createWordnok;
var handleTwitterError = require('./handletwittererror');
var probable = require('probable');
var canonicalizer = require('canonicalizer');

var wordnikSource = createWordnok({
  apiKey: config.wordnikAPIKey
});
var bot = new Bot(config.twitter);

var simulationMode = (process.argv[2] === '--simulate');

console.log('rapgame is running.');

function postTitle() {
  wordnikSource.getTopic(postOnTitle);
}

function postOnTitle(error, title) {
  if (error) {
    handleTwitterError(error);
  }
  else {
    var forms = canonicalizer.getSingularAndPluralForms(title);
    title = forms[0];

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

    if (usePrefixExclamation) {
      text += (prefixExclamationTable.roll() + ' ');
    }
    if (useIntro) {
      text += (introTable.roll() + ' ');
    }
    if (usePrefix) {
      text += (prefixTable.roll() + ' ');
    }
    
    text += title;

    if (useSuffix) {
      text += (' ' + suffixTable.roll());
    }

    text += '!';
    text = capitalizeFirst(text);

    if (simulationMode) {
      console.log('Would have tweeted:', text);
    }
    else {
      bot.tweet(text, function reportTweetResult(error, reply) {
        console.log((new Date()).toString(), 'Tweet posted', reply.text);

      });
    }
  }
}

function capitalizeFirst(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

postTitle();
