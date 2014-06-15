/// <reference path="./../typings/tsd.d.ts" />

'use strict';

import assertion = require('./assertion');
import serialise = require('./serialise');

import parseLax = require('./parser/lax');

import result = require('./parser/result');
export import Result = result.ParseResult;

export import model = require('./model');
export import importer = require('./importers/index');
export import utils = require('./utils');


[model, importer, utils];

export var parts = parseLax;

export function parse(source: string): Result {
	// TODO add strict parser
	var header: model.Header;

	var result = parseLax.header.parse(source);
	var ret: Result = {
		success: result.status
	};
	if (result.status) {
		ret.value = result.value;
		return ret;
	}
	ret.index = result.index;

	var pos = utils.getPosition(source, result.index);
	ret.line = pos.line;
	ret.column = pos.column;

	ret.message = 'expected "' + result.expected.replace(/"/, '\"') + '" at line ' + pos.line + ', column ' + pos.column;

	var details = '';

	details += ret.message + '\n';
	details += utils.highlightPos(source, pos.line, pos.column);

	ret.details = details;

	return ret;
}

export function stringify(header: model.Header): string[] {
	return serialise.stringify(header);
}

export function assert(header: model.Header): model.Header {
	return assertion.header(header);
}
