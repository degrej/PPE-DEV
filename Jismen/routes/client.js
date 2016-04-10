var express = require('express');
var router = express.Router();

// Accueil admin
router.get('/', function(req, res, next){
  res.render('client', {title : 'Jismen - Client'});
});

module.exports = router;
