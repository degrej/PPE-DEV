var express = require('express');
var router = express.Router();

// Accueil magasinier
router.get('/', function(req, res, next){
  res.render('magasinier', {title : 'Jismen - Magasinier'});
});

module.exports = router;