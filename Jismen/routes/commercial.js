var express = require('express');
var router = express.Router();

// Accueil commercial
router.get('/', function(req, res, next){
  res.render('commercial', {title : 'Jismen - Commercial'});
});

module.exports = router;