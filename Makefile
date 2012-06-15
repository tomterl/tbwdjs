# 
# tbwdjs - Makefile
# @author tom@goochesa.de (Tom Regner)
#
PYTHON ?= python
JSLINT ?= gjslint

bootstrap:
	@npm install -d

jshint: node_modules/.bin/jshint
	@node_modules/.bin/jshint lib/
	@node_modules/.bin/jshint tests/

jslint:
	@gjslint --unix_mode --strict --nojsdoc -r lib
	@gjslint --unix_mode --strict --nojsdoc -r tests

node_modules/.bin/jshint:
	@npm install jshint

clean:
	@rm -r node_modules
.PHONY: jslint jshint bootstrap clean
