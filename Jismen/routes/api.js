var express = require('express');
var router = express.Router;

router.get('/products/promo', function (req, res, next){
  res.send();
})

module.exports = router;