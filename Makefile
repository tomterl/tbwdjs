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

jslint:
	@gjslint --unix_mode --strict --nojsdoc -r lib

node_modules/.bin/jshint:
	@npm install jshint

.PHONY: jslint jshint bootstrap
