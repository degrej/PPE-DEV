/* IIFE Scope Isolation */
;(function() {
	'use strict';

	var express = require('express');
	var logger = require('morgan');
	var bodyParser = require('body-parser');
	var cookieParser = require('cookie-parser');
	var path = require('path');

	var jwtFilter = require('./jwt');


	module.exports = function(app) {
		app.use(logger('dev'));
		app.use(express.static(path.join(__dirname, "..", 'public')));
		jwtFilter(app);
		app.use(bodyParser.json());
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(cookieParser());
	};
})();
