mocha=./node_modules/mocha/bin/_mocha
istanbul=./node_modules/istanbul/lib/cli.js

test-cov: clean
	node $(istanbul) cover $(mocha) --report lcovonly -- --recursive -R spec

clean:
	rm -fr coverage