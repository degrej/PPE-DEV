;(function() {
	'use strict';

	// Notre variable qui contiendra tous les éléments de configuration de notre application
	var _config = {};

	_config.general = {
		environment: process.env.NODE_ENV || 'development',
		contact_mails: [
			'Jérémie Degré <jeremie.degre@gmail.com>',
			'Contact Jismen <contact.jismen@gmail.com'
		]
	};

	_config.security = {
		secret: 'w1Nt3R15c0M1nNg'
	};

	/*_config.mongodb = {
		connectionString: 'mongodb://localhost/jismen'
	};*/

	_config.mysql = {
		host: 'localhost',
		user: 'root',
		password: '',
		port: 3306,
		database: 'Jismen'
	};

	_config.smtp = {
		host: 'smtp.gmail.com',
		port: '465',
		user: 'contact.jismen@gmail.com', // Gmail address
		password: 'adminjismen'  // Gmail password
	};

	_config.products = {
		available_sizes : ['XS','S','M','L','XL','XXL']
	};

	// On rend disponible notre objet _config quand on fait un "require" de notre fichier conf.js
	module.exports = _config;
})();


/*module.exports = {
  secret: 'w1Nt3R15c0M1nNg',
  db:     'mongodb://localhost/jismen',
};*/
