# test:
# 	node_modules/mocha/bin/mocha -R spec tests/attackmaker-tests.js

# debug-test:
# 	node_modules/mocha/bin/mocha debug -R spec tests/attackmaker-tests.js

build-server: npm-install
	echo "Server built."
