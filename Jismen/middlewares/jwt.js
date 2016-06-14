'use strict';

var jwt = require('express-jwt');
var config = require('../conf');

module.exports = function(app) {
	app.use(jwt({ secret: config.security.secret }).unless({path: ['/', /^\/api/i, /^\/admin\/?$/i, /^\/client\/?$/i, /^\/magasinier\/?$/i, /^\/commercial\/?$/i] }));

	app.use('/admin/api', function(req, res, next) {
		if(!req.user) return res.status(401).end();
		if(!req.user.role) return res.status(401).end();
		if(req.user.role !== 'administrateur') return res.status(401).end();

		return next();
	});

	app.use('/client/api', function(req, res, next){
		if(!req.user) return res.status(401).end();
		if(!req.user.role) return res.status(401).end();
		if(req.user.role !== 'client') return res.status(401).end();

		return next();
	});

	app.use('/admincom/api', function(req, res, next){
		if(!req.user) return res.status(401).end();
		if(!req.user.role) return res.status(401).end();
		if(req.user.role !== 'admin' && req.user.role !== 'commercial') return res.status(401).end();

		return next();
	});

	app.use('/adminmag/api', function(req, res, next){
		if(!req.user) return res.status(401).end();
		if(!req.user.role) return res.status(401).end();
		if(req.user.role !== 'admin' && req.user.role !== 'magasinier') return res.status(401).end();

		return next();
	});
};