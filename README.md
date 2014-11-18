rapgamemetaphor
==================

This is the source for @rapgamemetaphor, an everyword-style Twitter bot.

Installation
------------

    git clone git@github.com:jimkang/rapgamemetaphor.git
    npm install

Then, create a `config.js` file in the project root that contains your [Twitter API keys](https://apps.twitter.com/) and your [Wordnik API key](http://developer.wordnik.com/). Example:

    module.exports = {
      twitter: {
        consumer_key: 'asdfkljqwerjasdfalpsdfjas',
        consumer_secret: 'asdfasdjfbkjqwhbefubvskjhfbgasdjfhgaksjdhfgaksdxvc',
        access_token: '9999999999-zxcvkljhpoiuqwerkjhmnb,mnzxcvasdklfhwer',
        access_token_secret: 'opoijkljsadfbzxcnvkmokwertlknfgmoskdfgossodrh'
      },
      wordnikAPIKey: 'mkomniojnnuibiybvuytvutrctrxezewarewetxyfcftvuhbg'
    };

Optionally, set up a cron job for run `rapgame.js` periodically.

Usage
-----

To post a tweet, run the commmand:

    node rapgame.js

To make a post and print it to the console, but not post it:

    node rapgame.js --simulate

Tests
-----

Run tests with `make test`.


License
-------

MIT.
